import tmdbLogo from "../assets/tmdb.svg";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {year} Reelio. All rights reserved.</p>

      <div className="footer__tmdb">
        <span>Powered by</span>

        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={tmdbLogo} alt="TMDB" />
        </a>
      </div>
    </footer>
  );
}
