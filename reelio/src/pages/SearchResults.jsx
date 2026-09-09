import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti, getGenreMap } from '../services/tmdb';
import MediaCard from '../components/MediaCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [state, setState] = useState({ loading: true, error: null, results: [], genreMap: {} });

  useEffect(() => {
    if (!query) {
      setState({ loading: false, error: null, results: [], genreMap: {} });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all([searchMulti(query), getGenreMap()])
      .then(([res, genreMap]) => {
        if (cancelled) return;
        const results = (res.results || []).filter(
          (r) => r.media_type === 'movie' || r.media_type === 'tv'
        );
        setState({ loading: false, error: null, results, genreMap });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: err.message }));
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (state.loading) return <Loader />;
  if (state.error) return <ErrorMessage message={state.error} />;

  return (
    <div className="search-page">
      <h1 className="search-page__title">
        {query ? `Results for "${query}"` : 'Search for movies & TV series'}
      </h1>
      {query && state.results.length === 0 && (
        <p className="search-page__empty">No results found.</p>
      )}
      <div className="media-grid">
        {state.results.map((item) => (
          <MediaCard key={`${item.media_type}-${item.id}`} item={item} genreMap={state.genreMap} />
        ))}
      </div>
    </div>
  );
}
