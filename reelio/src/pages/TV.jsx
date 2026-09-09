import { useEffect, useState } from 'react';
import { getPopularTV, getTopRatedTV, getGenreMap } from '../services/tmdb';
import MediaCard from '../components/MediaCard';
import FeaturedBanner from '../components/FeaturedBanner';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const SORTS = [
  { key: 'popular', label: 'Popular', fetcher: getPopularTV },
  { key: 'top_rated', label: 'Top Rated', fetcher: getTopRatedTV },
];

export default function TV() {
  const [sort, setSort] = useState('popular');
  const [items, setItems] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const fetcher = SORTS.find((s) => s.key === sort).fetcher;

    Promise.all([fetcher(1), getGenreMap()])
      .then(([res, map]) => {
        if (cancelled) return;
        setItems(res.results || []);
        setGenreMap(map);
        setPage(1);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sort]);

  function loadMore() {
    const fetcher = SORTS.find((s) => s.key === sort).fetcher;
    const nextPage = page + 1;
    fetcher(nextPage).then((res) => {
      setItems((prev) => [...prev, ...(res.results || [])]);
      setPage(nextPage);
    });
  }

  return (
    <div className="browse-page">
      {!loading && !error && (
        <FeaturedBanner
          items={items.slice(0, 3)}
          mediaType="tv"
          genreMap={genreMap}
        />
      )}

      <div className="browse-page__header">
        <h1>TV Series</h1>
        <div className="chip-row">
          {SORTS.map((s) => (
            <button
              key={s.key}
              className={`chip ${sort === s.key ? "active" : ""}`}
              onClick={() => setSort(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <div className="media-grid">
            {items.slice(3).map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                genreMap={genreMap}
                mediaType="tv"
              />
            ))}
          </div>
          <div className="browse-page__more">
            <button className="load-more-btn" onClick={loadMore}>
              Load more
            </button>
          </div>
        </>
      )}
    </div>
  );
}
