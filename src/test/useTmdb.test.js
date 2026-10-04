import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTmdbList, isRetriableError } from '../hooks/useTmdb';

vi.mock('../lib/tmdb', () => ({
  default: { get: vi.fn() },
  tmdbErrorMessage: (e) =>
    e?.code === 'ERR_CANCELED' || e?.name === 'AbortError'
      ? 'Request timed out or was cancelled. Retry?'
      : `FAILED:${e?.code || e?.response?.status}`,
}));

import tmdb from '../lib/tmdb';

const mockGet = tmdb.get;

function cancelError() {
  return Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' });
}
function resetError() {
  return Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isRetriableError', () => {
  it('retries transient failures, never missing keys or 404s', () => {
    expect(isRetriableError(resetError())).toBe(true);
    expect(isRetriableError({ response: { status: 429 } })).toBe(true);
    expect(isRetriableError({ response: { status: 502 } })).toBe(true);
    expect(isRetriableError({ code: 'ECONNABORTED' })).toBe(true);
    expect(isRetriableError({ code: 'TMDB_NO_KEY' })).toBe(false);
    expect(isRetriableError({ response: { status: 401 } })).toBe(false);
    expect(isRetriableError({ response: { status: 404 } })).toBe(false);
  });
});

describe('useTmdbList abort handling', () => {
  it('does NOT surface a cancelled shared request as an error (StrictMode remount)', async () => {
    let rejectShared;
    const shared = new Promise((_, rej) => {
      rejectShared = rej;
    });
    mockGet
      .mockReturnValueOnce(shared)
      .mockResolvedValueOnce({ data: { results: [{ id: 1 }] } });

    // Two mounts, same rail: the second joins the first's in-flight request.
    renderHook(() => useTmdbList('/strict', {}));
    const { result } = renderHook(() => useTmdbList('/strict', {}));

    // Simulate StrictMode cleanup aborting the shared request.
    await act(async () => {
      rejectShared(cancelError());
    });

    // The surviving mount must fall through to a fresh fetch and succeed —
    // never flash "timed out or was cancelled".
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it(
    'silently auto-retries a transient failure without showing error UI',
    { timeout: 15000 },
    async () => {
      mockGet
        .mockRejectedValueOnce(resetError())
        .mockRejectedValueOnce(resetError())
        .mockResolvedValueOnce({ data: { results: [{ id: 7 }] } });

      const { result } = renderHook(() => useTmdbList('/auto-retry', {}));

      // Even after the first failures, no error UI appears — skeleton stays.
      await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThanOrEqual(2));
      expect(result.current.status).not.toBe('error');

      // The silent delayed retry loads the rail with no click needed.
      // (Backoff 600ms + silent retry delay 1500ms, so allow generous time.)
      await waitFor(() => expect(result.current.status).toBe('success'), {
        timeout: 8000,
      });
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual([{ id: 7 }]);
      expect(mockGet).toHaveBeenCalledTimes(3);
    },
  );
});
