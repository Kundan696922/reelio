// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   getNowPlayingMovies,
//   getUpcomingMovies,
//   discoverTV,
//   getGenreMap,
//   NETWORK_IDS,
//   IMAGE_BASE,
// } from '../services/tmdb';
// import Loader from '../components/Loader';
// import ErrorMessage from '../components/ErrorMessage';

// const DAYS_BACK = 21;
// const DAYS_FORWARD = 120;

// const PLATFORM_LABEL = {
//   theatre: 'Theatres',
//   netflix: 'Netflix',
//   prime: 'Prime Video',
//   disney: 'Disney+',
// };

// // Each platform only ever produces one kind of title in this data
// // model: theatres are movies, the streamers are series.
// const PLATFORM_KIND = { theatre: 'movie', netflix: 'series', prime: 'series', disney: 'series' };

// function fmtISO(d) {
//   return d.toISOString().slice(0, 10);
// }
// function fmtMonth(d) {
//   return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
// }
// function fmtDow(d) {
//   return d.toLocaleDateString('en-US', { weekday: 'short' });
// }
// function fmtFullDate(d) {
//   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// }

// export default function Timeline() {
//   const [releases, setReleases] = useState([]);
//   const [genreMap, setGenreMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [platform, setPlatform] = useState('all');
//   const [kind, setKind] = useState('all');
//   const [openId, setOpenId] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       try {
//         const today = new Date();
//         const past = new Date(today);
//         past.setDate(past.getDate() - DAYS_BACK);
//         const future = new Date(today);
//         future.setDate(future.getDate() + DAYS_FORWARD);
//         const pastStr = fmtISO(past);
//         const futureStr = fmtISO(future);

//         const tvParams = (networkId) => ({
//           with_networks: networkId,
//           'first_air_date.gte': pastStr,
//           'first_air_date.lte': futureStr,
//           sort_by: 'first_air_date.desc',
//         });

//         const [nowPlaying, upcoming, netflixTv, primeTv, disneyTv, map] = await Promise.all([
//           getNowPlayingMovies(),
//           getUpcomingMovies(),
//           discoverTV(tvParams(NETWORK_IDS.netflix)),
//           discoverTV(tvParams(NETWORK_IDS.prime)),
//           discoverTV(tvParams(NETWORK_IDS.disney)),
//           getGenreMap(),
//         ]);
//         if (cancelled) return;

//         const seen = new Set();
//         const movieItems = [...(nowPlaying.results || []), ...(upcoming.results || [])]
//           .filter((m) => {
//             if (!m.release_date || seen.has(m.id)) return false;
//             seen.add(m.id);
//             return m.release_date >= pastStr && m.release_date <= futureStr;
//           })
//           .map((m) => ({ ...m, kind: 'movie', platform: 'theatre', date: m.release_date }));

//         const mapTv = (results, plat) =>
//           (results || [])
//             .filter((r) => r.first_air_date)
//             .map((r) => ({ ...r, kind: 'series', platform: plat, date: r.first_air_date }));

//         const all = [
//           ...movieItems,
//           ...mapTv(netflixTv.results, 'netflix'),
//           ...mapTv(primeTv.results, 'prime'),
//           ...mapTv(disneyTv.results, 'disney'),
//         ].sort((a, b) => new Date(a.date) - new Date(b.date));

//         setReleases(all);
//         setGenreMap(map);
//         setLoading(false);
//       } catch (err) {
//         if (!cancelled) {
//           setError(err.message);
//           setLoading(false);
//         }
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   if (loading) return <Loader />;
//   if (error) return <ErrorMessage message={error} />;

//   const invalidCombo = platform !== 'all' && kind !== 'all' && PLATFORM_KIND[platform] !== kind;
//   const items = invalidCombo
//     ? []
//     : releases.filter(
//         (r) => (platform === 'all' || r.platform === platform) && (kind === 'all' || r.kind === kind)
//       );

//   let lastMonth = '';

//   return (
//     <div className="tl-wrap">
//       <h1>Timeline</h1>

//       <div className="chip-row">
//         <button className={`chip ${platform === 'all' ? 'active' : ''}`} onClick={() => setPlatform('all')}>
//           All platforms
//         </button>
//         {Object.keys(PLATFORM_LABEL).map((p) => (
//           <button key={p} className={`chip ${platform === p ? 'active' : ''}`} onClick={() => setPlatform(p)}>
//             {PLATFORM_LABEL[p]}
//           </button>
//         ))}
//       </div>

//       <div className="chip-row tl-kind-row">
//         <button className={`chip ${kind === 'all' ? 'active' : ''}`} onClick={() => setKind('all')}>All</button>
//         <button className={`chip ${kind === 'movie' ? 'active' : ''}`} onClick={() => setKind('movie')}>Movies</button>
//         <button className={`chip ${kind === 'series' ? 'active' : ''}`} onClick={() => setKind('series')}>Series</button>
//       </div>

//       {invalidCombo && (
//         <p className="tl-empty">{PLATFORM_LABEL[platform]} doesn't have {kind === 'movie' ? 'movies' : 'series'} in this data set.</p>
//       )}

//       {!invalidCombo && items.length === 0 && (
//         <p className="tl-empty">Nothing matches this filter yet.</p>
//       )}

//       {!invalidCombo && items.length > 0 && (
//         <div className="tl-timeline">
//           {items.map((r) => {
//             const d = new Date(r.date + 'T00:00:00');
//             const monthLabel = fmtMonth(d);
//             const showMonth = monthLabel !== lastMonth;
//             lastMonth = monthLabel;
//             const title = r.title || r.name;
//             const mediaType = r.kind === 'movie' ? 'movie' : 'tv';
//             const genre = (r.genre_ids || []).map((id) => genreMap[id]).filter(Boolean)[0] || '';
//             const isOpen = openId === `${mediaType}-${r.id}`;

//             return (
//               <div key={`${mediaType}-${r.id}`}>
//                 {showMonth && <div className="tl-month">{monthLabel}</div>}
//                 <div className="tl-row">
//                   <div className="tl-daycol">
//                     <span className="tl-daynum">{d.getDate()}</span>
//                     <span className="tl-dow">{fmtDow(d)}</span>
//                   </div>
//                   <div className={`tl-card ${isOpen ? 'open' : ''}`}>
//                     <button
//                       className="tl-summary"
//                       onClick={() => setOpenId(isOpen ? null : `${mediaType}-${r.id}`)}
//                     >
//                       <div className="tl-poster">
//                         {r.poster_path ? (
//                           <img src={IMAGE_BASE.posterSmall + r.poster_path} alt={title} loading="lazy" />
//                         ) : (
//                           <span>{title}</span>
//                         )}
//                       </div>
//                       <div className="tl-info">
//                         <p className="tl-title">{title}</p>
//                         <div className="tl-meta">
//                           <span className={`tl-badge tl-badge--${r.platform}`}>{PLATFORM_LABEL[r.platform]}</span>
//                           <span className="tl-kind">{r.kind === 'movie' ? 'In theatres' : 'New episodes'}</span>
//                           <span className="tl-date">{fmtFullDate(d)}</span>
//                           {genre && <span className="tl-genre">{genre}</span>}
//                         </div>
//                       </div>
//                       <span className="tl-expand">{isOpen ? '−' : '+'}</span>
//                     </button>
//                     {isOpen && (
//                       <div className="tl-detail">
//                         <p>{r.overview || 'No overview available yet.'}</p>
//                         <Link to={`/${mediaType}/${r.id}`} className="tl-link">View details ↗</Link>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getNowPlayingMovies,
  getUpcomingMovies,
  discoverTV,
  discoverMovie,
  getGenreMap,
  NETWORK_IDS,
  PROVIDER_IDS,
  IMAGE_BASE,
} from "../services/tmdb";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const DAYS_BACK = 21;
const DAYS_FORWARD = 120;
const WATCH_REGION = "US";

const PLATFORM_LABEL = {
  theatre: "Theatres",
  netflix: "Netflix",
  prime: "Prime Video",
  disney: "Disney+",
};

function fmtISO(d) {
  return d.toISOString().slice(0, 10);
}
function fmtMonth(d) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function fmtDow(d) {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}
function fmtFullDate(d) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Timeline() {
  const [releases, setReleases] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platform, setPlatform] = useState("all");
  const [kind, setKind] = useState("all");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const today = new Date();
        const past = new Date(today);
        past.setDate(past.getDate() - DAYS_BACK);
        const future = new Date(today);
        future.setDate(future.getDate() + DAYS_FORWARD);
        const pastStr = fmtISO(past);
        const futureStr = fmtISO(future);

        const tvParams = (networkId) => ({
          with_networks: networkId,
          "first_air_date.gte": pastStr,
          "first_air_date.lte": futureStr,
          sort_by: "first_air_date.desc",
        });

        // Movies "available" on a streamer, per TMDB's watch-provider
        // data (separate ID space from with_networks, which is TV-only).
        const movieProviderParams = (providerId) => ({
          with_watch_providers: providerId,
          watch_region: WATCH_REGION,
          "primary_release_date.gte": pastStr,
          "primary_release_date.lte": futureStr,
          sort_by: "primary_release_date.desc",
        });

        const [
          nowPlaying,
          upcoming,
          netflixTv,
          primeTv,
          disneyTv,
          netflixMovies,
          primeMovies,
          disneyMovies,
          map,
        ] = await Promise.all([
          getNowPlayingMovies(),
          getUpcomingMovies(),
          discoverTV(tvParams(NETWORK_IDS.netflix)),
          discoverTV(tvParams(NETWORK_IDS.prime)),
          discoverTV(tvParams(NETWORK_IDS.disney)),
          discoverMovie(movieProviderParams(PROVIDER_IDS.netflix)),
          discoverMovie(movieProviderParams(PROVIDER_IDS.prime)),
          discoverMovie(movieProviderParams(PROVIDER_IDS.disney)),
          getGenreMap(),
        ]);
        if (cancelled) return;

        const seen = new Set();
        const theatreItems = [
          ...(nowPlaying.results || []),
          ...(upcoming.results || []),
        ]
          .filter((m) => {
            if (!m.release_date || seen.has(m.id)) return false;
            seen.add(m.id);
            return m.release_date >= pastStr && m.release_date <= futureStr;
          })
          .map((m) => ({
            ...m,
            kind: "movie",
            platform: "theatre",
            date: m.release_date,
          }));

        const mapTv = (results, plat) =>
          (results || [])
            .filter((r) => r.first_air_date)
            .map((r) => ({
              ...r,
              kind: "series",
              platform: plat,
              date: r.first_air_date,
            }));

        const mapStreamingMovies = (results, plat) =>
          (results || [])
            .filter((r) => r.release_date)
            .map((r) => ({
              ...r,
              kind: "movie",
              platform: plat,
              date: r.release_date,
            }));

        const all = [
          ...theatreItems,
          ...mapTv(netflixTv.results, "netflix"),
          ...mapTv(primeTv.results, "prime"),
          ...mapTv(disneyTv.results, "disney"),
          ...mapStreamingMovies(netflixMovies.results, "netflix"),
          ...mapStreamingMovies(primeMovies.results, "prime"),
          ...mapStreamingMovies(disneyMovies.results, "disney"),
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        setReleases(all);
        setGenreMap(map);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const items = releases.filter(
    (r) =>
      (platform === "all" || r.platform === platform) &&
      (kind === "all" || r.kind === kind),
  );

  let lastMonth = "";

  return (
    <div className="tl-wrap">
      <h1>Timeline</h1>

      <div className="chip-row">
        <button
          className={`chip ${platform === "all" ? "active" : ""}`}
          onClick={() => setPlatform("all")}
        >
          All platforms
        </button>
        {Object.keys(PLATFORM_LABEL).map((p) => (
          <button
            key={p}
            className={`chip ${platform === p ? "active" : ""}`}
            onClick={() => setPlatform(p)}
          >
            {PLATFORM_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="chip-row tl-kind-row">
        <button
          className={`chip ${kind === "all" ? "active" : ""}`}
          onClick={() => setKind("all")}
        >
          All
        </button>
        <button
          className={`chip ${kind === "movie" ? "active" : ""}`}
          onClick={() => setKind("movie")}
        >
          Movies
        </button>
        <button
          className={`chip ${kind === "series" ? "active" : ""}`}
          onClick={() => setKind("series")}
        >
          Series
        </button>
      </div>

      {items.length === 0 && (
        <p className="tl-empty">Nothing matches this filter yet.</p>
      )}

      {items.length > 0 && (
        <div className="tl-timeline">
          {items.map((r) => {
            const d = new Date(r.date + "T00:00:00");
            const monthLabel = fmtMonth(d);
            const showMonth = monthLabel !== lastMonth;
            lastMonth = monthLabel;
            const title = r.title || r.name;
            const mediaType = r.kind === "movie" ? "movie" : "tv";
            const genre =
              (r.genre_ids || [])
                .map((id) => genreMap[id])
                .filter(Boolean)[0] || "";
            const isOpen = openId === `${mediaType}-${r.id}`;

            return (
              <div key={`${r.platform}-${mediaType}-${r.id}`}>
                {showMonth && <div className="tl-month">{monthLabel}</div>}
                <div className="tl-row">
                  <div className="tl-daycol">
                    <span className="tl-daynum">{d.getDate()}</span>
                    <span className="tl-dow">{fmtDow(d)}</span>
                  </div>
                  <div className={`tl-card ${isOpen ? "open" : ""}`}>
                    <button
                      className="tl-summary"
                      onClick={() =>
                        setOpenId(isOpen ? null : `${mediaType}-${r.id}`)
                      }
                    >
                      <div className="tl-poster">
                        {r.poster_path ? (
                          <img
                            src={IMAGE_BASE.posterSmall + r.poster_path}
                            alt={title}
                            loading="lazy"
                          />
                        ) : (
                          <span>{title}</span>
                        )}
                      </div>
                      <div className="tl-info">
                        <p className="tl-title">{title}</p>
                        <div className="tl-meta">
                          <span className={`tl-badge tl-badge--${r.platform}`}>
                            {PLATFORM_LABEL[r.platform]}
                          </span>
                          <span className="tl-kind">
                            {r.kind === "movie" ? "Movie" : "New episodes"}
                          </span>
                          <span className="tl-date">{fmtFullDate(d)}</span>
                          {genre && <span className="tl-genre">{genre}</span>}
                        </div>
                      </div>
                      <span className="tl-expand">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="tl-detail">
                        <p>{r.overview || "No overview available yet."}</p>
                        <Link to={`/${mediaType}/${r.id}`} className="tl-link">
                          View details ↗
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}