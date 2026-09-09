// TMDB API client — isolated here so the rest of the app never talks
// to fetch()/TMDB directly. Swap or extend this file to change how
// data is fetched without touching components or pages.

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE = {
  poster: 'https://image.tmdb.org/t/p/w500',
  posterSmall: 'https://image.tmdb.org/t/p/w185',
  backdrop: 'https://image.tmdb.org/t/p/original',
  profile: 'https://image.tmdb.org/t/p/w185',
};

// TMDB network IDs, used by the timeline's platform filter.
export const NETWORK_IDS = { netflix: 213, prime: 1024, disney: 2739 };

async function tmdbGet(path, params = {}) {
  if (!API_KEY) {
    throw new Error('Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env file.');
  }
  const url = new URL(BASE_URL + path);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}) for ${path}`);
  }
  return res.json();
}

let genreCache = null;

export async function getGenreMap() {
  if (genreCache) return genreCache;
  const [movieGenres, tvGenres] = await Promise.all([
    tmdbGet('/genre/movie/list'),
    tmdbGet('/genre/tv/list'),
  ]);
  const map = {};
  [...movieGenres.genres, ...tvGenres.genres].forEach((g) => {
    map[g.id] = g.name;
  });
  genreCache = map;
  return map;
}

export function getTrending(mediaType = 'all', window = 'week') {
  return tmdbGet(`/trending/${mediaType}/${window}`);
}

export function getPopularMovies(page = 1) {
  return tmdbGet('/movie/popular', { page });
}

export function getPopularTV(page = 1) {
  return tmdbGet('/tv/popular', { page });
}

export function getTopRatedMovies(page = 1) {
  return tmdbGet('/movie/top_rated', { page });
}

export function getUpcomingMovies(page = 1) {
  return tmdbGet('/movie/upcoming', { page });
}

export function getNowPlayingMovies(page = 1) {
  return tmdbGet('/movie/now_playing', { page });
}

export function getTopRatedTV(page = 1) {
  return tmdbGet('/tv/top_rated', { page });
}

export function getAiringTodayTV(page = 1) {
  return tmdbGet('/tv/airing_today', { page });
}

// append_to_response pulls cast/crew in on the same request instead
// of a separate call.
export function getMovieDetails(id) {
  return tmdbGet(`/movie/${id}`, { append_to_response: 'credits' });
}

export function getTVDetails(id) {
  return tmdbGet(`/tv/${id}`, { append_to_response: 'credits' });
}

export function searchMulti(query, page = 1) {
  return tmdbGet('/search/multi', { query, page, include_adult: false });
}

// Generic TV discovery, used to pull "new on Netflix / Prime / Disney+"
// style lists for the timeline.
export function discoverTV(params = {}) {
  return tmdbGet('/discover/tv', params);
}

// TMDB watch-provider IDs (different ID space from NETWORK_IDS —
// providers = "where to stream", networks = "who produced the TV show").
export const PROVIDER_IDS = { netflix: 8, prime: 9, disney: 337 };

// Generic movie discovery, mirrors discoverTV — used to pull
// "new movies on Netflix / Prime / Disney+" via watch-provider filtering.
export function discoverMovie(params = {}) {
  return tmdbGet('/discover/movie', params);
}