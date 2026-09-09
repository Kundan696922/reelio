import { Link } from 'react-router-dom';
import { IMAGE_BASE } from '../services/tmdb';
import { formatDate, formatRating, genreNames } from '../utils/format';

// mediaType can be passed explicitly (e.g. from a "Popular Movies"
// row where TMDB doesn't include media_type on each item), otherwise
// it's inferred from the item itself.
export default function MediaCard({ item, genreMap, mediaType }) {
  const type = mediaType || item.media_type || (item.first_air_date ? 'tv' : 'movie');
  if (type !== 'movie' && type !== 'tv') return null;

  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const genres = genreNames(item.genre_ids, genreMap);

  return (
    <Link to={`/${type}/${item.id}`} className="media-card">
      <div className="media-card__poster">
        {item.poster_path ? (
          <img src={IMAGE_BASE.poster + item.poster_path} alt={title} loading="lazy" />
        ) : (
          <div className="media-card__poster-fallback">{title}</div>
        )}
        <span className="media-card__rating">★ {formatRating(item.vote_average)}</span>
      </div>
      <div className="media-card__info">
        <p className="media-card__title">{title}</p>
        <p className="media-card__meta">
          {formatDate(date)}
          {genres.length > 0 ? ` · ${genres[0]}` : ''}
        </p>
      </div>
    </Link>
  );
}
