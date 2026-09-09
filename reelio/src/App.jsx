import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TV from './pages/TV';
import Timeline from './pages/Timeline';
import MovieDetails from './pages/MovieDetails';
import TVDetails from './pages/TVDetails';
import SearchResults from './pages/SearchResults';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv" element={<TV />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<TVDetails />} />
        <Route path="/search" element={<SearchResults />} />
      </Route>
    </Routes>
  );
}
