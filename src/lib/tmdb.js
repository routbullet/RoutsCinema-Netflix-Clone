import axios from "axios";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE =
  import.meta.env.VITE_TMDB_BASE || "https://api.themoviedb.org/3";
// In Vite dev, same-origin `/api/tmdb` is proxied to TMDB (see vite.config.js).
// In prod, fall back to the full base unless the deploy provides its own proxy.
const baseURL =
  typeof window !== "undefined" && import.meta.env.DEV
    ? "/api/tmdb"
    : TMDB_BASE;

export const TMDB_KEY_MISSING = !TMDB_KEY;

function isOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

export function tmdbErrorMessage(err) {
  const status = err?.response?.status;
  if (err?.code === "TMDB_NO_KEY" || status === 401)
    return "TMDB key is invalid or missing. Set VITE_TMDB_KEY in .env, restart npm run dev, and retry.";
  if (status === 404) return "That title could not be found.";
  if (status === 429)
    return "Too many requests to TMDB. Please wait a few seconds and retry.";
  // Vite dev proxy surfaces upstream resets as 502 with a marker body —
  // and direct failures as ECONNRESET/EPROTO/socket hang up.
  if (
    status === 502 ||
    err?.code === "ECONNRESET" ||
    err?.code === "EPROTO" ||
    err?.code === "ECONNREFUSED" ||
    /socket hang up|ECONNRESET|proxy error/i.test(err?.message || "")
  )
    return "Connection to TMDB was reset. Check your network/VPN, then Retry.";
  if (err?.code === "ECONNABORTED" || err?.code === "ERR_CANCELED")
    return "Request timed out or was cancelled. Retry?";
  if (!isOnline())
    return "You appear to be offline. Check connection and retry.";
  return "Couldn’t reach TMDB. Please retry.";
}

const tmdb = axios.create({
  baseURL,
  timeout: 10000,
  params: { language: "en-US" },
});

// Attach api_key per request (never hardcoded, never logged).
// Short-circuit when the key is missing so we never send `api_key=undefined`
// through the dev proxy (TMDB rejects it, and the burst of 401s looks like
// connection trouble). The rejection is shaped like an axios 401 so existing
// error UI handles it without network traffic.
tmdb.interceptors.request.use((config) => {
  if (!TMDB_KEY) {
    const err = new Error(
      "VITE_TMDB_KEY is missing. Copy .env.example to .env, add your TMDB key, and restart the dev server.",
    );
    err.code = "TMDB_NO_KEY";
    err.config = config;
    err.response = { status: 401, data: { status_message: "Missing API key" } };
    return Promise.reject(err);
  }
  config.params = { ...(config.params || {}), api_key: TMDB_KEY };
  return config;
});

tmdb.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!axios.isCancel(err)) {
      // Single contextual log — never log the key or full response.
      console.error(
        `[tmdb] ${err?.config?.url} failed:`,
        err?.response?.status || err?.code || err.message,
      );
    }
    return Promise.reject(err);
  },
);

export default tmdb;
