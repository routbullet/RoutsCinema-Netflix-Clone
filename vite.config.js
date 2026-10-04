import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const TMDB_TARGET = 'https://api.themoviedb.org/3';
// Opt-in upstream request logging: DEBUG=tmdb npm run dev
const debugTmdb = (...args) => {
  if (process.env.DEBUG?.includes('tmdb')) console.log('[tmdb-proxy]', ...args);
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Dev-only proxy so the browser never needs a hardcoded key in URLs.
      // Client calls `/api/tmdb/trending/all/day?language=en-US` etc.
      // The API key is attached by src/lib/tmdb.js via interceptor.
      '/api/tmdb': {
        target: TMDB_TARGET,
        changeOrigin: true,
        secure: true,
        // Fail fast instead of hanging a rail on a dead upstream socket.
        timeout: 10000,
        proxyTimeout: 10000,
        rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            debugTmdb(`${req.method} ${req.url}`);
          });
          proxy.on('error', (err, req, res) => {
            console.error(
              `[vite] tmdb proxy error: ${req.method} ${req.url} — ${err.code || err.message}`,
            );
            // http-proxy leaves the socket hanging by default; answer with a
            // 502 JSON body so the client (src/lib/tmdb.js) can show Retry
            // instead of waiting out the axios timeout.
            if (!res.headersSent && !res.writableEnded) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
            }
            try {
              res.end(
                JSON.stringify({
                  status_message:
                    'Dev proxy could not reach TMDB (connection reset). Check network/VPN and retry.',
                  code: err.code || 'PROXY_ERROR',
                }),
              );
            } catch {
              // Socket already gone — nothing left to do.
            }
          });
        },
      },
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
});
