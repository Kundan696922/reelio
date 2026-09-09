import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IMAGE_BASE } from "../services/tmdb";
import { formatDate, formatRating, genreNames } from "../utils/format";

const AUTO_ADVANCE_MS = 5000;
const DRAG_THRESHOLD = 0.15; // fraction of viewport width needed to change slide

export default function FeaturedBanner({ items = [], mediaType, genreMap }) {
  const slides = items.slice(0, 6);

  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const paused = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  const [slideWidth, setSlideWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [transitionOn, setTransitionOn] = useState(true);

  const lastIndex = slides.length - 1;

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function measure() {
      setSlideWidth(wrapper.offsetWidth);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, lastIndex));
  }, [lastIndex]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      if (paused.current || isDragging.current) return;
      setTransitionOn(true);
      setIndex((i) => (i >= lastIndex ? 0 : i + 1));
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [lastIndex, slides.length]);

  function goTo(i) {
    setTransitionOn(true);
    setIndex(Math.max(0, Math.min(i, lastIndex)));
  }

  function onPointerDown(e) {
    // Don't treat buttons/links as carousel dragging
    if (e.target.closest("a, button")) return;

    if (!slideWidth) return;

    isDragging.current = true;
    dragStartX.current = e.clientX;
    setTransitionOn(false);
    trackRef.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging.current) return;
    setDragOffset(e.clientX - dragStartX.current);
  }

  function endDrag(e) {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = dragOffset;
    setDragOffset(0);
    setTransitionOn(true);

    if (Math.abs(delta) > slideWidth * DRAG_THRESHOLD) {
      if (delta < 0) goTo(index + 1);
      else goTo(index - 1);
    } else {
      goTo(index); // snap back
    }
    try {
      trackRef.current.releasePointerCapture(e.pointerId);
    } catch {
      // already released
    }
  }

  if (slides.length === 0) return null;

  const translateX = -(index * slideWidth) + dragOffset;

  return (
    <div
      className="featured-banner-carousel"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="featured-banner-carousel__viewport" ref={wrapperRef}>
        <div
          className={`featured-banner-carousel__track${isDragging.current ? " dragging" : ""}`}
          ref={trackRef}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: transitionOn ? "transform 0.45s ease" : "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {slides.map((item) => {
            const title = item.title || item.name;
            const date = item.release_date || item.first_air_date;
            const genres = genreNames(item.genre_ids, genreMap);
            const linkType = item.media_type || mediaType; // trending items carry their own type

            return (
              <div
                key={item.id}
                className="featured-banner"
                style={{
                  width: slideWidth || undefined,
                  flexBasis: slideWidth || undefined,
                  backgroundImage: item.backdrop_path
                    ? `url(${IMAGE_BASE.backdrop}${item.backdrop_path})`
                    : undefined,
                }}
              >
                <div className="featured-banner__scrim" />
                <div className="featured-banner__content">
                  <span className="featured-banner__eyebrow">Featured</span>
                  <h2>{title}</h2>
                  <div className="featured-banner__meta">
                    <span>★ {formatRating(item.vote_average)}</span>
                    <span>{formatDate(date)}</span>
                    {genres[0] && <span>{genres[0]}</span>}
                  </div>
                  <p className="featured-banner__overview">{item.overview}</p>
                  <Link
                    to={`/${linkType}/${item.id}`}
                    className="featured-banner__btn"
                    draggable={false}
                  >
                    See more
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="featured-banner-carousel__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`featured-carousel__dot${i === index ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
