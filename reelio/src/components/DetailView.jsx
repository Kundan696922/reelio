// import { IMAGE_BASE } from '../services/tmdb';
// import { formatDate, formatRating } from '../utils/format';

// // Shared layout for both movie and TV detail pages.
// export default function DetailView({ backdrop, poster, title, date, rating, genres = [], overview, extra, cast = [] }) {
//   return (
//     <div className="detail-view">
//       {backdrop && (
//         <div
//           className="detail-view__backdrop"
//           style={{ backgroundImage: `url(${IMAGE_BASE.backdrop}${backdrop})` }}
//         />
//       )}
//       <div className="detail-view__content">
//         <div className="detail-view__poster">
//           {poster ? (
//             <img src={IMAGE_BASE.poster + poster} alt={title} />
//           ) : (
//             <div className="detail-view__poster-fallback">{title}</div>
//           )}
//         </div>
//         <div className="detail-view__info">
//           <h1>{title}</h1>
//           <div className="detail-view__meta">
//             <span className="detail-view__rating">★ {formatRating(rating)}</span>
//             <span>{formatDate(date)}</span>
//             {extra}
//           </div>
//           {genres.length > 0 && (
//             <div className="detail-view__genres">
//               {genres.map((g) => (
//                 <span key={g.id} className="genre-pill">{g.name}</span>
//               ))}
//             </div>
//           )}
//           <p className="detail-view__overview">{overview || 'No overview available.'}</p>
//         </div>
//       </div>

//       {cast.length > 0 && (
//         <section className="cast-section">
//           <h2>Cast</h2>
//           <div className="cast-scroll">
//             {cast.slice(0, 14).map((person) => (
//               <div key={person.cast_id ?? person.credit_id ?? person.id} className="cast-card">
//                 <div className="cast-card__photo">
//                   {person.profile_path ? (
//                     <img src={IMAGE_BASE.profile + person.profile_path} alt={person.name} loading="lazy" />
//                   ) : (
//                     <span>{person.name}</span>
//                   )}
//                 </div>
//                 <p className="cast-card__name">{person.name}</p>
//                 {person.character && <p className="cast-card__role">{person.character}</p>}
//               </div>
//             ))}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import { IMAGE_BASE } from "../services/tmdb";
import { formatDate, formatRating } from "../utils/format";

const CAST_PREVIEW_COUNT = 8;
const CAST_STEP = 5;

// Shared layout for both movie and TV detail pages.
export default function DetailView({
  backdrop,
  poster,
  title,
  date,
  rating,
  genres = [],
  overview,
  extra,
  cast = [],
}) {
  const [visibleCount, setVisibleCount] = useState(CAST_PREVIEW_COUNT);
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const pendingScrollIndex = useRef(null);

  const visibleCast = cast.slice(0, visibleCount);
  const hasMoreCast = visibleCount < cast.length;
  const isExpanded = visibleCount > CAST_PREVIEW_COUNT;

  const handleSeeMore = () => {
    pendingScrollIndex.current = visibleCount; // index of the first newly-added card
    setVisibleCount((prev) => Math.min(prev + CAST_STEP, cast.length));
  };

  const handleBackToStart = () => {
    setVisibleCount(CAST_PREVIEW_COUNT);
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const targetIndex = pendingScrollIndex.current;
    if (targetIndex === null) return;
    pendingScrollIndex.current = null;

    const targetCard = cardRefs.current[targetIndex];
    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
    }
  }, [visibleCount]);

  return (
    <div className="detail-view">
      {backdrop && (
        <div
          className="detail-view__backdrop"
          style={{ backgroundImage: `url(${IMAGE_BASE.backdrop}${backdrop})` }}
        />
      )}
      <div className="detail-view__content">
        <div className="detail-view__poster">
          {poster ? (
            <img src={IMAGE_BASE.poster + poster} alt={title} />
          ) : (
            <div className="detail-view__poster-fallback">{title}</div>
          )}
        </div>
        <div className="detail-view__info">
          <h1>{title}</h1>
          <div className="detail-view__meta">
            <span className="detail-view__rating">
              ★ {formatRating(rating)}
            </span>
            <span>{formatDate(date)}</span>
            {extra}
          </div>
          {genres.length > 0 && (
            <div className="detail-view__genres">
              {genres.map((g) => (
                <span key={g.id} className="genre-pill">
                  {g.name}
                </span>
              ))}
            </div>
          )}
          <p className="detail-view__overview">
            {overview || "No overview available."}
          </p>
        </div>
      </div>

      {cast.length > 0 && (
        <section className="cast-section">
          <h2>Cast</h2>
          <div className="cast-scroll" ref={scrollRef}>
            {visibleCast.map((person, index) => (
              <div
                key={person.cast_id ?? person.credit_id ?? person.id}
                className="cast-card"
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
              >
                <div className="cast-card__photo">
                  {person.profile_path ? (
                    <img
                      src={IMAGE_BASE.profile + person.profile_path}
                      alt={person.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>{person.name}</span>
                  )}
                </div>
                <p className="cast-card__name">{person.name}</p>
                {person.character && (
                  <p className="cast-card__role">{person.character}</p>
                )}
              </div>
            ))}
          </div>

          {(hasMoreCast || isExpanded) && (
            <div className="cast-section__controls">
              {isExpanded && (
                <button
                  type="button"
                  className="cast-section__back-btn"
                  onClick={handleBackToStart}
                  aria-label="Back to first cast members"
                >
                  ‹
                </button>
              )}
              {hasMoreCast && (
                <button
                  type="button"
                  className="cast-section__more-btn"
                  onClick={handleSeeMore}
                >
                  See more ({Math.min(CAST_STEP, cast.length - visibleCount)}{" "}
                  more)
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}