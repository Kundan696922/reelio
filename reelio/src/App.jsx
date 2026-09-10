import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TV from "./pages/TV";
import Timeline from "./pages/Timeline";
import MovieDetails from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import SearchResults from "./pages/SearchResults";
import { ToastProvider, useToast } from "./components/Toast";
import { registerToastHandlers } from "./services/tmdb";

// Bridges Toast context to the plain-JS tmdb.js module, so tmdbGet()
// can trigger toasts without needing React context itself.
function ToastBridge() {
  const { showToast, dismissToast } = useToast();
  useEffect(() => {
    registerToastHandlers({ showToast, dismissToast });
  }, [showToast, dismissToast]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ToastBridge />
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
    </ToastProvider>
  );
}
