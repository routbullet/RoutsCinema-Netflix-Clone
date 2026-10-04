// Central TMDB endpoint map. No API keys here — injected by src/lib/tmdb.js.
export const ENDPOINTS = {
  trending: '/trending/all/day',
  topRated: '/movie/top_rated',
  upcoming: '/movie/upcoming',
  tvShows: '/discover/tv',
  sciFi: '/discover/movie',
  animation: '/discover/movie',
  action: '/discover/movie',
  mystery: '/discover/movie',
  horror: '/discover/movie',
  romance: '/discover/movie',
  comedy: '/discover/movie',
  family: '/discover/movie',
  crime: '/discover/movie',
  thriller: '/discover/movie',
  documentary: '/discover/movie',
};

export const RAILS = [
  { key: 'trending', title: 'Trending Now', endpoint: ENDPOINTS.trending, params: {} },
  { key: 'top-rated', title: 'Top Rated', endpoint: ENDPOINTS.topRated, params: {} },
  { key: 'upcoming', title: 'Upcoming Movies', endpoint: ENDPOINTS.upcoming, params: {} },
  { key: 'tv', title: 'TV Shows', endpoint: ENDPOINTS.tvShows, params: { with_networks: 213 } },
  { key: 'scifi', title: 'Science Fiction', endpoint: ENDPOINTS.sciFi, params: { with_genres: 878 } },
  { key: 'animation', title: 'Animation', endpoint: ENDPOINTS.animation, params: { with_genres: 16 } },
  { key: 'action', title: 'Action', endpoint: ENDPOINTS.action, params: { with_genres: 28 } },
  { key: 'mystery', title: 'Mystery', endpoint: ENDPOINTS.mystery, params: { with_genres: 9648 } },
  { key: 'horror', title: 'Horror', endpoint: ENDPOINTS.horror, params: { with_genres: 27 } },
  { key: 'romance', title: 'Romantic', endpoint: ENDPOINTS.romance, params: { with_genres: 10749 } },
  { key: 'comedy', title: 'Comedy', endpoint: ENDPOINTS.comedy, params: { with_genres: 35 } },
  { key: 'family', title: 'Family', endpoint: ENDPOINTS.family, params: { with_genres: 10751 } },
  { key: 'crime', title: 'Crime', endpoint: ENDPOINTS.crime, params: { with_genres: 80 } },
  { key: 'thriller', title: 'Thriller', endpoint: ENDPOINTS.thriller, params: { with_genres: 53 } },
  { key: 'documentary', title: 'Documentary', endpoint: ENDPOINTS.documentary, params: { with_genres: 99 } },
];

export function detailsEndpoint(type, id) {
  return `/${type === 'tv' ? 'tv' : 'movie'}/${id}`;
}
