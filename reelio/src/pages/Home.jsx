import { useEffect, useState } from "react";
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getGenreMap,
} from "../services/tmdb";
import FeaturedBanner from "../components/FeaturedBanner";
import MediaRow from "../components/MediaRow";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Home() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    trending: [],
    movies: [],
    tv: [],
    genreMap: {},
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [trending, movies, tv, genreMap] = await Promise.all([
          getTrending("all", "week"),
          getPopularMovies(),
          getPopularTV(),
          getGenreMap(),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          trending: trending.results || [],
          movies: movies.results || [],
          tv: tv.results || [],
          genreMap,
        });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) return <Loader />;
  if (state.error) return <ErrorMessage message={state.error} />;

  return (
    <div className="home-page">
      <FeaturedBanner
        items={state.trending}
        mediaType="movie"
        genreMap={state.genreMap}
      />

      <MediaRow
        title="Trending This Week"
        items={state.trending}
        genreMap={state.genreMap}
      />
      <MediaRow
        title="Popular Movies"
        items={state.movies}
        genreMap={state.genreMap}
        mediaType="movie"
        exploreLink="/movies"
      />
      <MediaRow
        title="Popular TV Series"
        items={state.tv}
        genreMap={state.genreMap}
        mediaType="tv"
        exploreLink="/tv"
      />
    </div>
  );
}
