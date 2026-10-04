import { describe, it, expect } from 'vitest';
import { tmdbImg, titleOf, yearOf, mediaTypeOf } from '../lib/image';

describe('image helpers', () => {
  it('builds sized TMDB urls and guards null', () => {
    expect(tmdbImg('/abc.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg');
    expect(tmdbImg(null)).toBeNull();
  });
  it('resolves title/year/type', () => {
    expect(titleOf({ title: 'Dune' })).toBe('Dune');
    expect(titleOf({ name: 'Breaking Bad' })).toBe('Breaking Bad');
    expect(yearOf({ release_date: '2024-03-01' })).toBe('2024');
    expect(mediaTypeOf({ first_air_date: '2008-01-20' })).toBe('tv');
    expect(mediaTypeOf({ title: 'Dune' })).toBe('movie');
  });
});
