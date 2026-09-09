import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        placeholder="Search movies & TV series..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" aria-label="Search">
        <FaSearch />
      </button>
    </form>
  );
}
