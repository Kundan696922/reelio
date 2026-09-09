import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MediaCard from "./MediaCard";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";

const GAP = 14;
const CARD_WIDTH = 150; // matches .media-card width in global.css
const STEP = CARD_WIDTH + GAP;

export default function MediaRow({
  title,
  items = [],
  genreMap,
  mediaType,
  exploreLink,
}) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(null);

  const [itemsPerView, setItemsPerView] = useState(1);
  const [page, setPage] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const pageCount = Math.max(
    1,
    Math.ceil(items.length / Math.max(1, itemsPerView)),
  );

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function measure() {
      const perView = Math.max(
        1,
        Math.floor((viewport.offsetWidth + GAP) / STEP),
      );
      setItemsPerView(perView);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, []);

  function updateScrollState() {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft >= scrollWidth - clientWidth - 2);
    setPage(Math.round(scrollLeft / (STEP * itemsPerView)));
  }

  function onScroll() {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateScrollState();
    });
  }

  useEffect(() => {
    updateScrollState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, itemsPerView]);

  function scrollToPage(p) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(p, pageCount - 1));
    track.scrollTo({ left: clamped * itemsPerView * STEP, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <div className="media-row">
      <div className="media-row__header">
        <h2 className="media-row__title">{title}</h2>
        {exploreLink && (
          <Link className="media-row__explore" to={exploreLink}>
            Explore all <FaArrowRight />
          </Link>
        )}
      </div>

      <div className="media-row__carousel">
        <button
          type="button"
          className="media-row__arrow media-row__arrow--left"
          onClick={() => scrollToPage(page - 1)}
          disabled={atStart}
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>

        <div className="media-row__viewport" ref={viewportRef}>
          <div className="media-row__track" ref={trackRef} onScroll={onScroll}>
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                genreMap={genreMap}
                mediaType={mediaType || item.media_type}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="media-row__arrow media-row__arrow--right"
          onClick={() => scrollToPage(page + 1)}
          disabled={atEnd}
          aria-label="Scroll right"
        >
          <FaChevronRight />
        </button>
      </div>

      {pageCount > 1 && (
        <div className="media-row__dots">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`media-row__dot${i === page ? " active" : ""}`}
              onClick={() => scrollToPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
