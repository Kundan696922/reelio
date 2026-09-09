import { useParams } from 'react-router-dom';
import { getMovieDetails } from '../services/tmdb';
import { useTmdbFetch } from '../hooks/useTmdbFetch';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import DetailView from '../components/DetailView';

export default function MovieDetails() {
  const { id } = useParams();
  const { data, loading, error } = useTmdbFetch(() => getMovieDetails(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  return (
    <DetailView
      backdrop={data.backdrop_path}
      poster={data.poster_path}
      title={data.title}
      date={data.release_date}
      rating={data.vote_average}
      genres={data.genres}
      overview={data.overview}
      extra={data.runtime ? <span>{data.runtime} min</span> : null}
      cast={data.credits?.cast || []}
    />
  );
}
