import { useState, useEffect, useCallback } from "react";

const API_KEY = "YOUR_OMDB_API_KEY"; // Replace with your OMDb API key from https://www.omdbapi.com/apikey.aspx
const BASE_URL = "https://www.omdbapi.com/";

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={styles.spinnerWrap}>
      <div style={styles.spinner} />
    </div>
  );
}

// ── MovieCard ─────────────────────────────────────────────────────────────────
function MovieCard({ movie, onClick }) {
  const poster =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x445?text=No+Poster";

  return (
    <div style={styles.card} onClick={() => onClick(movie.imdbID)}>
      <div style={styles.cardImgWrap}>
        <img src={poster} alt={movie.Title} style={styles.cardImg} />
        <div style={styles.cardOverlay}>
          <span style={styles.cardYear}>{movie.Year}</span>
        </div>
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{movie.Title}</h3>
        <span style={styles.cardType}>{movie.Type}</span>
      </div>
    </div>
  );
}

// ── MovieDetail ───────────────────────────────────────────────────────────────
function MovieDetail({ movie, onClose }) {
  const poster =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x445?text=No+Poster";

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        <div style={styles.modalInner}>
          <img src={poster} alt={movie.Title} style={styles.modalPoster} />
          <div style={styles.modalInfo}>
            <h2 style={styles.modalTitle}>{movie.Title}</h2>
            <div style={styles.modalMeta}>
              <span style={styles.badge}>{movie.Year}</span>
              <span style={styles.badge}>{movie.Rated}</span>
              <span style={styles.badge}>{movie.Runtime}</span>
              <span style={styles.badge}>{movie.Genre}</span>
            </div>
            {movie.imdbRating !== "N/A" && (
              <div style={styles.ratingRow}>
                <span style={styles.star}>★</span>
                <span style={styles.ratingNum}>{movie.imdbRating}</span>
                <span style={styles.ratingLabel}>/10 IMDb</span>
              </div>
            )}
            <p style={styles.modalPlot}>{movie.Plot}</p>
            <div style={styles.modalCredits}>
              {movie.Director !== "N/A" && (
                <p><strong>Director:</strong> {movie.Director}</p>
              )}
              {movie.Actors !== "N/A" && (
                <p><strong>Cast:</strong> {movie.Actors}</p>
              )}
              {movie.Language !== "N/A" && (
                <p><strong>Language:</strong> {movie.Language}</p>
              )}
              {movie.BoxOffice && movie.BoxOffice !== "N/A" && (
                <p><strong>Box Office:</strong> {movie.BoxOffice}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Search movies
  const searchMovies = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setError("Please enter a movie title.");
      return;
    }
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);

    try {
      const res = await fetch(
        ${ BASE_URL } ? apikey = ${ API_KEY } & s=${ encodeURIComponent(searchTerm) } & type=movie
      );
      const data = await res.json();

      if (data.Response === "True") {
        setResults(data.Search);
      } else {
        setError(data.Error || "No movies found.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch movie detail
  const fetchDetail = useCallback(async (imdbID) => {
    setDetailLoading(true);
    try {
      const res = await fetch(${ BASE_URL } ? apikey = ${ API_KEY } & i=${ imdbID } & plot=full);
      const data = await res.json();
      if (data.Response === "True") {
        setSelectedMovie(data);
      } else {
        setError(data.Error || "Could not load movie details.");
      }
    } catch {
      setError("Network error fetching movie details.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Submit on Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchMovies(query);
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>🎬 CineSearch</div>
        <p style={styles.tagline}>Search millions of movies instantly</p>

        {/* Search Bar */}
        <div style={styles.searchWrap}>
          <input
            style={styles.input}
            type="text"
            placeholder="Search for a movie title..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            style={styles.searchBtn}
            onClick={() => searchMovies(query)}
            disabled={loading}
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        {/* Error */}
        {error && <p style={styles.error}>{error}</p>}
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {loading && <Spinner />}

        {!loading && searched && results.length === 0 && !error && (
          <p style={styles.emptyMsg}>No results to show.</p>
        )}

        {!loading && results.length > 0 && (
          <>
            <p style={styles.resultCount}>{results.length} result(s) found</p>
            <div style={styles.grid}>
              {results.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} onClick={fetchDetail} />
              ))}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div style={styles.heroHint}>
            <span style={styles.heroIcon}>🍿</span>
            <p style={styles.heroText}>Start by searching for your favourite film above</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {detailLoading && (
        <div style={styles.modalBackdrop}>
          <Spinner />
        </div>
      )}
      {selectedMovie && !detailLoading && (
        <MovieDetail movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}

      {/* Spinner keyframe injected via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d14; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #e8b86d; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0d0d14",
    color: "#f0ece4",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0d0d14 100%)",
    padding: "48px 24px 36px",
    textAlign: "center",
    borderBottom: "1px solid #2a2a45",
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(2rem, 5vw, 3rem)",
    color: "#e8b86d",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  tagline: {
    fontSize: "0.95rem",
    color: "#8888aa",
    marginBottom: "28px",
  },
  searchWrap: {
    display: "flex",
    maxWidth: "560px",
    margin: "0 auto",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1.5px solid #2e2e50",
    background: "#12122a",
    color: "#f0ece4",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  searchBtn: {
    padding: "14px 28px",
    borderRadius: "12px",
    border: "none",
    background: "#e8b86d",
    color: "#0d0d14",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  error: {
    marginTop: "14px",
    color: "#ff6b6b",
    fontSize: "0.9rem",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px 60px",
  },
  resultCount: {
    color: "#8888aa",
    fontSize: "0.85rem",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "20px",
    animation: "fadeIn 0.4s ease",
  },
  card: {
    background: "#16162a",
    borderRadius: "14px",
    overflow: "hidden",
    cursor: "pointer",
    border: "1px solid #2a2a45",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": { transform: "scale(1.03)" },
  },
  cardImgWrap: { position: "relative" },
  cardImg: { width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "20px 10px 8px",
  },
  cardYear: { color: "#e8b86d", fontSize: "0.8rem", fontWeight: "500" },
  cardBody: { padding: "12px" },
  cardTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#f0ece4",
    lineHeight: 1.3,
    marginBottom: "6px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardType: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    color: "#6666aa",
    letterSpacing: "0.05em",
  },
  spinnerWrap: { display: "flex", justifyContent: "center", padding: "60px 0" },
  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #2a2a45",
    borderTopColor: "#e8b86d",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyMsg: { textAlign: "center", color: "#6666aa", marginTop: "60px" },
  heroHint: { textAlign: "center", marginTop: "80px" },
  heroIcon: { fontSize: "3.5rem" },
  heroText: { color: "#555577", marginTop: "12px", fontSize: "1rem" },
  // Modal
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#16162a",
    borderRadius: "20px",
    maxWidth: "860px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    border: "1px solid #2a2a45",
    animation: "fadeIn 0.3s ease",
  },
  closeBtn: {
    position: "sticky",
    top: "14px",
    float: "right",
    margin: "14px 14px 0 0",
    background: "#2a2a45",
    border: "none",
    color: "#f0ece4",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    cursor: "pointer",
    fontSize: "1rem",
    lineHeight: "34px",
    textAlign: "center",
    zIndex: 10,
  },
  modalInner: {
    display: "flex",
    gap: "28px",
    padding: "28px",
    flexWrap: "wrap",
  },
  modalPoster: {
    width: "200px",
    flexShrink: 0,
    borderRadius: "12px",
    objectFit: "cover",
    alignSelf: "flex-start",
  },
  modalInfo: { flex: 1, minWidth: "220px" },
  modalTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem",
    color: "#e8b86d",
    marginBottom: "12px",
    lineHeight: 1.2,
  },
  modalMeta: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" },
  badge: {
    background: "#22223a",
    border: "1px solid #3a3a5a",
    borderRadius: "6px",
    padding: "3px 10px",
    fontSize: "0.78rem",
    color: "#aaaacc",
  },
  ratingRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" },
  star: { color: "#e8b86d", fontSize: "1.2rem" },
  ratingNum: { fontSize: "1.5rem", fontWeight: "700", color: "#f0ece4" },
  ratingLabel: { color: "#8888aa", fontSize: "0.9rem" },
  modalPlot: { color: "#ccc8be", lineHeight: 1.7, marginBottom: "18px", fontSize: "0.95rem" },
  modalCredits: { color: "#8888aa", fontSize: "0.88rem", lineHeight: 1.8 },
};