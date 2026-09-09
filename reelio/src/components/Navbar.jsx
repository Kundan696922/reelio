import { Link, NavLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { MdMovie, MdTv, MdAccessTime } from "react-icons/md";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo">
        Reelio
      </Link>

      <div className="navbar__search">
        <SearchBar />
      </div>

      <nav className="navbar__links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <AiFillHome />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/movies"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <MdMovie />
          <span>Movies</span>
        </NavLink>

        <NavLink
          to="/tv"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <MdTv />
          <span>TV</span>
        </NavLink>

        <NavLink
          to="/timeline"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <MdAccessTime />
          <span>Timeline</span>
        </NavLink>
      </nav>
    </header>
  );
}
