import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getGenreMap,
  IMAGE_BASE,
} from '../services/tmdb';
import { formatDate, formatRating, genreNames } from '../utils/format';
import { FaTimes, FaUndo, FaStar, FaFilm } from "react-icons/fa";
import { GiPopcorn } from "react-icons/gi";

const MODES = [
  { key: 'trending', label: 'Trending', fetcher: () => getTrending('all', 'week') },
  { key: 'movie', label: 'Movies', fetcher: () => getPopularMovies() },
  { key: 'tv', label: 'TV', fetcher: () => getPopularTV() },
  { key: 'top_rated', label: 'Top Rated', fetcher: () => getTopRatedMovies() },
];

const SWIPE_THRESHOLD = 90;

export default function SwipeBubble() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('trending');
  const [deck, setDeck] = useState([]);
  const [history, setHistory] = useState([]); // swiped-away items, most recent last — lets a mis-swipe be undone
  const [genreMap, setGenreMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [exiting, setExiting] = useState(null); // 'left' | 'right' | null
  const startXRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    loadDeck(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  function loadDeck(activeMode) {
    setLoading(true);
    setError(null);
    setDetailItem(null);
    setDragX(0);
    setExiting(null);
    const config = MODES.find((m) => m.key === activeMode);

    Promise.all([config.fetcher(), getGenreMap()])
      .then(([res, map]) => {
        const results = (res.results || [])
          .filter((item) => item.poster_path)
          .filter((item) => !item.media_type || item.media_type === 'movie' || item.media_type === 'tv')
          .map((item) => ({
            ...item,
            media_type: item.media_type || (activeMode === 'tv' ? 'tv' : 'movie'),
          }));
        setDeck(results);
        setGenreMap(map);
        setHistory([]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function triggerExit(direction) {
    if (exiting || deck.length === 0) return;
    setExiting(direction);
    setTimeout(() => {
      const item = deck[0];
      setDeck((prev) => prev.slice(1));
      setHistory((prev) => [...prev, item]);
      setExiting(null);
      setDragX(0);
      if (direction === 'right') setDetailItem(item);
    }, 220);
  }

  // Puts the last swiped card back on top of the deck — for when a
  // swipe happens by accident.
  function undoLast() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setDeck((prev) => [last, ...prev]);
    setDetailItem(null);
    setDragX(0);
    setExiting(null);
  }

  function handlePointerDown(e) {
    setDragging(true);
    startXRef.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function handlePointerMove(e) {
    if (!dragging) return;
    setDragX(e.clientX - startXRef.current);
  }
  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) triggerExit('right');
    else if (dragX < -SWIPE_THRESHOLD) triggerExit('left');
    else setDragX(0);
  }

  const topCard = deck[0];
  let transform = 'translateX(0px) rotate(0deg)';
  if (dragging) transform = `translateX(${dragX}px) rotate(${dragX / 14}deg)`;
  else if (exiting) transform = `translateX(${exiting === 'right' ? 650 : -650}px) rotate(${exiting === 'right' ? 25 : -25}deg)`;

  const skipOpacity = dragging && dragX < 0 ? Math.min(Math.abs(dragX) / 100, 1) : 0;
  const moreOpacity = dragging && dragX > 0 ? Math.min(dragX / 100, 1) : 0;

  return (
    <>
      <button
        className="swipe-bubble"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close swipe" : "Try swipe discovery"}
      >
        {open ? <FaTimes /> : <GiPopcorn />}
      </button>

      {open && (
        <div className="swipe-panel">
          <div className="swipe-panel__head">
            <p>Reelio Swipe</p>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <FaTimes />
            </button>
          </div>

          <div className="swipe-panel__body">
            <p className="swipe-panel__subtitle">
              Swipe left to pass, right for details.
            </p>

            <div className="chip-row swipe-panel__modes">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  className={`chip ${mode === m.key ? "active" : ""}`}
                  onClick={() => setMode(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="swipe-stage">
              {loading && (
                <div className="loader">
                  <div className="spinner" />
                </div>
              )}

              {!loading && error && (
                <div className="swipe-empty">
                  <h3>Couldn't load</h3>
                  <p>{error}</p>
                  <button
                    className="load-more-btn"
                    onClick={() => loadDeck(mode)}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && !topCard && (
                <div className="swipe-empty">
                  <h3>That's everything!</h3>
                  <button
                    className="load-more-btn"
                    onClick={() => loadDeck(mode)}
                  >
                    Start over
                  </button>
                </div>
              )}

              {!loading && !error && topCard && !detailItem && (
                <div
                  className="swipe-card"
                  style={{
                    transform,
                    transition: dragging
                      ? "none"
                      : "transform .22s ease, opacity .22s ease",
                    opacity: exiting ? 0 : 1,
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  <div className="swipe-card__poster">
                    <img
                      src={IMAGE_BASE.poster + topCard.poster_path}
                      alt={topCard.title || topCard.name}
                      draggable={false}
                    />
                    <span
                      className="swipe-stamp swipe-stamp--skip"
                      style={{ opacity: skipOpacity }}
                    >
                      PASS
                    </span>
                    <span
                      className="swipe-stamp swipe-stamp--more"
                      style={{ opacity: moreOpacity }}
                    >
                      SEE MORE
                    </span>
                    <span className="media-card__rating">
                      <FaStar /> {formatRating(topCard.vote_average)}
                    </span>
                  </div>
                  <div className="swipe-card__body">
                    <p className="swipe-card__title">
                      {topCard.title || topCard.name}
                    </p>
                    <p className="swipe-card__meta">
                      {formatDate(
                        topCard.release_date || topCard.first_air_date,
                      )}
                      {genreNames(topCard.genre_ids, genreMap)[0]
                        ? ` · ${genreNames(topCard.genre_ids, genreMap)[0]}`
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {detailItem && (
                <div className="swipe-detail">
                  <p className="swipe-detail__title">
                    {detailItem.title || detailItem.name}
                  </p>
                  <p className="swipe-detail__overview">
                    {detailItem.overview || "No overview available."}
                  </p>
                  <Link
                    to={`/${detailItem.media_type}/${detailItem.id}`}
                    className="load-more-btn swipe-detail__link"
                    onClick={() => setOpen(false)}
                  >
                    View full details
                  </Link>
                  <button className="chip" onClick={() => setDetailItem(null)}>
                    Keep swiping
                  </button>
                </div>
              )}
            </div>

            {!detailItem && topCard && (
              <div className="swipe-controls">
                <button
                  className="swipe-btn swipe-btn--back"
                  onClick={undoLast}
                  disabled={history.length === 0}
                  aria-label="Undo last swipe"
                >
                  <FaUndo />
                </button>
                <button
                  className="swipe-btn swipe-btn--skip"
                  onClick={() => triggerExit("left")}
                  aria-label="Pass"
                >
                  <FaTimes />
                </button>
                <button
                  className="swipe-btn swipe-btn--more"
                  onClick={() => triggerExit("right")}
                  aria-label="See more"
                >
                  <FaStar />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
