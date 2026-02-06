import { useMemo, useState } from "react";
import { Clapperboard, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetMoviesTans } from "../hooks/useGetMoviesTans";
import { useGetGenres } from "../hooks/useGetGenres";
import { AddMovie } from "./AddMovie";
import { MovieBrowserSection } from "./MovieBrowserSection";

const pageSize = 24;

export const MovieMain = () => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [page, setPage] = useState(1);
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const navigate = useNavigate();

  const { movies, loading, isError, totalPages, total } = useGetMoviesTans(
    selectedGenre || undefined,
    true,
    page,
    pageSize
  );
  const { genres, loading: genresLoading } = useGetGenres();

  const visibleGenres = useMemo(() => genres, [genres]);
  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
    setPage(1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.09),_transparent_45%)]" />
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1300px] px-6 py-10">
        <>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-white md:text-6xl">Movie Collection</h1>
              <p className="mt-2 text-base text-slate-300 md:text-xl">
                Discover and explore your favorite films
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMovieOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-4 text-base font-semibold text-slate-900 shadow-xl shadow-amber-500/30 transition hover:brightness-110 md:text-lg"
            >
              <Plus size={20} />
              Add Movie
            </button>
          </header>

          <div className="mt-8 rounded-3xl border border-slate-800/90 bg-slate-900/70 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectGenre("")}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-base font-semibold transition ${
                  selectedGenre === ""
                    ? "bg-amber-400 text-slate-900"
                    : "border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-300/60 hover:text-amber-300"
                }`}
              >
                <Clapperboard size={16} />
                All Movies
              </button>

              {genresLoading ? (
                <span className="px-3 py-2 text-sm text-slate-400">Loading genres...</span>
              ) : (
                visibleGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleSelectGenre(genre)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      selectedGenre === genre
                        ? "border-amber-300/70 bg-amber-400/10 text-amber-300"
                        : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-300/60 hover:text-amber-300"
                    }`}
                  >
                    {genre}
                  </button>
                ))
              )}
            </div>
          </div>

          <MovieBrowserSection
            movies={movies}
            loading={loading}
            isError={isError}
            total={total}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(current => Math.max(current - 1, 1))}
            onNext={() => {
              if (page < totalPages) {
                setPage(current => current + 1);
              }
            }}
            onPageSelect={setPage}
            onOpenMovie={movieId => navigate(`/movie/${movieId}`)}
          />
        </>
      </div>

      {isAddMovieOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setIsAddMovieOpen(false)}
        >
          <div
            className="w-full max-w-3xl"
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <div className="sticky top-0 z-10 mb-3 flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsAddMovieOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/95 text-slate-300 transition hover:border-amber-300/70 hover:text-amber-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
              <AddMovie onSuccess={() => setIsAddMovieOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
