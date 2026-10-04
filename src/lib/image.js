const CDN = 'https://image.tmdb.org/t/p';

/** Build a sized TMDB image URL. Guards null paths. */
export function tmdbImg(path, size = 'w342') {
  if (!path) return null;
  return `${CDN}/${size}${path}`;
}

export function posterSrc(posterPath) {
  return tmdbImg(posterPath, 'w342');
}

export function posterSrcSet(posterPath) {
  if (!posterPath) return undefined;
  return `${tmdbImg(posterPath, 'w342')} 342w, ${tmdbImg(posterPath, 'w500')} 500w`;
}

export function backdropSrc(backdropPath, size = 'w780') {
  return tmdbImg(backdropPath, size);
}

export function titleOf(item) {
  return item?.title || item?.name || item?.original_title || item?.original_name || 'Untitled';
}

export function yearOf(item) {
  const d = item?.release_date || item?.first_air_date || '';
  return d ? d.slice(0, 4) : '—';
}

export function mediaTypeOf(item) {
  if (item?.media_type === 'tv' || item?.first_air_date) return 'tv';
  return 'movie';
}
