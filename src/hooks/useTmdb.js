import { useCallback, useEffect, useRef, useState } from 'react';
import tmdb, { tmdbErrorMessage } from '../lib/tmdb';

// 5-min in-memory cache + in-flight dedupe (stale-while-revalidate mindset).
const cache = new Map();
const inflight = new Map();
const TTL = 5 * 60 * 1000;

function cacheKey(endpoint, params) {
  return `${endpoint}?${new URLSearchParams(params || {}).toString()}`;
}

// --- Concurrency limiter ----------------------------------------------------
// Home mounts ~15 rails at once (x2 under StrictMode). Without a cap that is
// ~30 simultaneous proxied TLS connections to api.themoviedb.org, which is
// exactly the burst that surfaces as `ECONNRESET` in the Vite dev proxy.
// Max 4 concurrent upstream requests; the rest wait their turn.
const MAX_CONCURRENT = 4;
let activeCount = 0;
const waitQueue = [];

function acquireSlot(signal) {
  if (activeCount < MAX_CONCURRENT) {
    activeCount += 1;
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const entry = { resolve, reject };
    waitQueue.push(entry);
    if (signal) {
      const onAbort = () => {
        const i = waitQueue.indexOf(entry);
        if (i !== -1) waitQueue.splice(i, 1);
        reject(new DOMException('Aborted while queued', 'AbortError'));
      };
      if (signal.aborted) onAbort();
      else signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

function releaseSlot() {
  activeCount = Math.max(0, activeCount - 1);
  const next = waitQueue.shift();
  if (next) {
    activeCount += 1;
    next.resolve();
  }
}

/** True for transient failures worth silently retrying. Never true for a
 *  missing key or a 404 — retrying those is pointless. Exported for tests. */
export function isRetriableError(err) {
  const status = err?.response?.status;
  if (status === 429 || status === 502) return true;
  if (err?.code === 'TMDB_NO_KEY') return false; // retrying without a key is pointless
  if (status === 401 || status === 404) return false;
  return (
    err?.code === 'ECONNRESET' ||
    err?.code === 'EPROTO' ||
    err?.code === 'ECONNREFUSED' ||
    err?.code === 'ECONNABORTED' || // timed out — TMDB was just slow
    /socket hang up|ECONNRESET|proxy error|timed out/i.test(err?.message || '')
  );
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('Aborted during backoff', 'AbortError'));
      },
      { once: true },
    );
  });
}

// Single upstream attempt through the limiter.
async function fetchOnce(url, config) {
  await acquireSlot(config?.signal);
  try {
    return await tmdb.get(url, config);
  } finally {
    releaseSlot();
  }
}

// Upstream fetch with one exponential-backoff retry on reset/rate-limit errors.
// Returns the axios response. Throws the last error (or abort).
async function fetchWithRetry(url, config, attempts = 2) {
  let lastErr;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (config?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      return await fetchOnce(url, config);
    } catch (e) {
      if (e?.code === 'ERR_CANCELED' || e?.name === 'AbortError') throw e;
      lastErr = e;
      const moreTries = attempt + 1 < attempts;
      if (!moreTries || !isRetriableError(e)) throw e;
      await sleep(600 * 2 ** attempt, config?.signal);
    }
  }
  throw lastErr;
}

/**
 * useTmdbList(endpoint, params) — rail fetching with loading/error/empty + retry + abort.
 */
export function useTmdbList(endpoint, params) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const retryTimerRef = useRef(null);
  const autoTriedRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchNow = useCallback(async () => {
    if (!endpoint) return;
    const key = cacheKey(endpoint, params);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < TTL) {
      setData(cached.data);
      setStatus('success');
      return;
    }
    if (inflight.has(key)) {
      try {
        const results = await inflight.get(key);
        setData(results);
        setStatus('success');
        return;
      } catch (e) {
        if (e?.code !== 'ERR_CANCELED' && e?.name !== 'AbortError') {
          setError(tmdbErrorMessage(e));
          setStatus('error');
          return;
        }
        // Shared request was aborted (StrictMode remount / superseded fetch).
        // That is not a failure — fall through and start our own fetch instead
        // of flashing "timed out or was cancelled".
      }
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('loading');
    setError(null);

    const promise = fetchWithRetry(endpoint, { params, signal: controller.signal }).then(
      (res) => res.data?.results ?? [],
    );
    inflight.set(key, promise);
    try {
      const results = await promise;
      cache.set(key, { data: results, at: Date.now() });
      setData(results);
      setStatus('success');
    } catch (e) {
      if (e?.code === 'ERR_CANCELED' || e?.name === 'AbortError') return;
      if (
        !controller.signal.aborted &&
        isRetriableError(e) &&
        !autoTriedRef.current
      ) {
        // Transient blip (reset / rate-limit / slow TMDB): retry once silently
        // after a short delay. The skeleton stays up — no error UI, no click.
        autoTriedRef.current = true;
        setStatus('loading');
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          if (mountedRef.current) fetchNow();
        }, 1500);
        return;
      }
      setError(tmdbErrorMessage(e));
      setStatus('error');
    } finally {
      inflight.delete(key);
    }
  }, [endpoint, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    fetchNow();
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      clearTimeout(retryTimerRef.current);
    };
  }, [fetchNow]);

  // Manual Retry gets a full silent-retry budget again.
  const retry = useCallback(() => {
    autoTriedRef.current = false;
    clearTimeout(retryTimerRef.current);
    return fetchNow();
  }, [fetchNow]);

  return { data, status, error, retry, loading: status === 'loading' };
}

/**
 * useTmdbDetails(type, id) — movie/tv details with videos + credits.
 */
export function useTmdbDetails(type, id) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    let cancelled = false;
    fetchWithRetry(`/${type === 'tv' ? 'tv' : 'movie'}/${id}`, {
      params: { append_to_response: 'videos,credits' },
      signal: controller.signal,
    })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setStatus('success');
      })
      .catch((e) => {
        if (cancelled || e?.code === 'ERR_CANCELED' || e?.name === 'AbortError') return;
        setError(tmdbErrorMessage(e));
        setStatus('error');
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [type, id]);

  return { data, status, error, loading: status === 'loading' };
}

/**
 * useDebouncedValue(value, delay) — for search input.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * useSearchMulti(query) — /search/multi with abort + debounce handled by caller.
 */
export function useSearchMulti(query) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setData([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    let cancelled = false;
    fetchWithRetry(
      '/search/multi',
      {
        params: { query: query.trim(), page: 1, include_adult: false },
        signal: controller.signal,
      },
      1, // typed queries abort often; never auto-retry a stale query
    )
      .then((res) => {
        if (cancelled) return;
        setData((res.data?.results ?? []).filter((r) => r?.poster_path || r?.backdrop_path));
        setStatus('success');
      })
      .catch((e) => {
        if (cancelled || e?.code === 'ERR_CANCELED' || e?.name === 'AbortError') return;
        setError(tmdbErrorMessage(e));
        setStatus('error');
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query]);

  return { data, status, error, loading: status === 'loading' };
}
