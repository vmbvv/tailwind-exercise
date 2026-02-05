import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useGetMoviesTans } from "../hooks/useGetMoviesTans";
import { MoviesSection } from "./MoviesSection";

const suggestedGenres = [
  "Drama",
  "Action",
  "Comedy",
  "Adventure",
  "Romance",
  "Thriller",
  "Animation",
  "Crime",
];

export const GenreMovies = () => {
  const [genreInput, setGenreInput] = useState("");
  const [activeGenre, setActiveGenre] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const trimmedGenre = activeGenre.trim();
  const isEnabled = trimmedGenre.length > 0;
  const { movies, loading, isError, totalPages } = useGetMoviesTans(
    trimmedGenre,
    isEnabled,
    page,
    pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [trimmedGenre]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveGenre(genreInput.trim());
  };

  const hint = useMemo(() => {
    if (!trimmedGenre) {
      return "Pick a genre.";
    }
    return `Genre: ${trimmedGenre}`;
  }, [trimmedGenre]);

  return (
    <section className="mt-10 animate-fade-up">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur">
        <h2 className="text-2xl text-slate-100">Genre</h2>
        <p className="mt-2 text-sm text-slate-300">{hint}</p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-wrap gap-3">
          <input
            value={genreInput}
            onChange={(event) => setGenreInput(event.target.value)}
            placeholder="Genre"
            className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          />
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-500/30 transition hover:brightness-110"
          >
            Go
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
          {suggestedGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                setGenreInput(genre);
                setActiveGenre(genre);
              }}
              className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 uppercase tracking-wide transition hover:border-teal-200/50 hover:text-teal-200"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {isEnabled ? (
        <MoviesSection
          eyebrow="Genre"
          title={trimmedGenre}
          description="Filtered list."
          emptyMessage="No matches."
          movies={movies}
          loading={loading}
          isError={isError}
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((current) => Math.max(current - 1, 1))}
          onNext={() => {
            if (page < totalPages) {
              setPage((current) => current + 1);
            }
          }}
          onPageSelect={setPage}
        />
      ) : (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          Enter a genre to see results.
        </div>
      )}
    </section>
  );
};
