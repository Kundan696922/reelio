import { useParams } from 'react-router-dom';
import { getTVDetails } from '../services/tmdb';
import { useTmdbFetch } from '../hooks/useTmdbFetch';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import DetailView from '../components/DetailView';

export default function TVDetails() {
  const { id } = useParams();
  const { data, loading, error } = useTmdbFetch(() => getTVDetails(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  return (
    <DetailView
      backdrop={data.backdrop_path}
      poster={data.poster_path}
      title={data.name}
      date={data.first_air_date}
      rating={data.vote_average}
      genres={data.genres}
      overview={data.overview}
      extra={
        data.number_of_seasons
          ? <span>{data.number_of_seasons} season{data.number_of_seasons > 1 ? 's' : ''}</span>
          : null
      }
      cast={data.credits?.cast || []}
    />
  );
}
