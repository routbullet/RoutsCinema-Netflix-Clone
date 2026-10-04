import { describe, it, expect } from 'vitest';
import { tmdbErrorMessage, TMDB_KEY_MISSING } from '../lib/tmdb';

describe('tmdbErrorMessage', () => {
  it('maps missing/invalid key to the env setup message', () => {
    expect(tmdbErrorMessage({ code: 'TMDB_NO_KEY' })).toMatch(/VITE_TMDB_KEY/);
    expect(tmdbErrorMessage({ response: { status: 401 } })).toMatch(/VITE_TMDB_KEY/);
  });

  it('maps proxy resets to the retry message', () => {
    expect(tmdbErrorMessage({ response: { status: 502 } })).toMatch(/reset/i);
    expect(tmdbErrorMessage({ code: 'ECONNRESET' })).toMatch(/reset/i);
    expect(tmdbErrorMessage(new Error('socket hang up'))).toMatch(/reset/i);
  });

  it('maps rate limiting to the backoff message', () => {
    expect(tmdbErrorMessage({ response: { status: 429 } })).toMatch(/too many requests/i);
  });

  it('exposes whether a key is configured (boolean, env-dependent)', () => {
    // NOTE: vitest loads .env.local like Vite does, so this is true on a
    // machine with a key configured and false on CI without one.
    expect(typeof TMDB_KEY_MISSING).toBe('boolean');
  });
});
