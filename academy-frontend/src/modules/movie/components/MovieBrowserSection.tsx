import { useState } from "react";
import { Calendar, Clock3, Play, Star } from "lucide-react";
import type { IMovie } from "../types/movie";

interface MovieBrowserSectionProps {
  movies?: IMovie[];
  loading: boolean;
  isError: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (page: number) => void;
  onOpenMovie: (movieId: string) => void;
}

const MovieCard = ({
  movie,
  onOpenMovie
}: {
  movie: IMovie;
  onOpenMovie: (movieId: string) => void;
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const hasPoster = Boolean(movie.poster?.startsWith("http")) && !hasImageError;
  const summary = movie.plot ?? movie.fullplot ?? "No plot available for this movie.";
  const shortenedSummary =
    summary.length > 85 ? `${summary.slice(0, 85).trim()}...` : summary;
  const canOpenMovie = Boolean(movie._id);
  const releasedYear = movie.released ? new Date(movie.released).getFullYear() : null;
  const safeReleasedYear = releasedYear && !Number.isNaN(releasedYear) ? releasedYear : null;

  return (
    <button
      type="button"
      disabled={!canOpenMovie}
      onClick={() => {
        if (!movie._id) {
          return;
        }
        onOpenMovie(movie._id);
      }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 text-left shadow-xl shadow-slate-950/40 transition duration-300 hover:-translate-y-1.5 hover:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        {hasPoster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            onError={() => setHasImageError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-6">
            <span className="text-2xl font-semibold text-slate-300">
              {movie.title.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30">
            <Play size={24} className="ml-1" />
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
          <span className="rounded-full border border-slate-200/20 bg-black/40 px-2 py-1">
            {movie.year ?? "Classic"}
          </span>
          {movie.runtime ? (
            <span className="rounded-full border border-slate-200/20 bg-black/40 px-2 py-1">
              {movie.runtime} min
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-xl font-semibold text-slate-100">{movie.title}</h3>
        <p className="mt-2 text-sm text-slate-300">{shortenedSummary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-xs text-slate-300">
          {movie.imdb?.rating ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-1 text-amber-300">
              <Star size={13} className="fill-current" />
              {movie.imdb.rating.toFixed(1)}
            </span>
          ) : null}
          {movie.runtime ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 size={13} />
              {movie.runtime} min
            </span>
          ) : null}
          {safeReleasedYear ? (
            <span className="inline-flex items-center gap-1">
              <Calendar size={13} />
              {safeReleasedYear}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

const LoadingGrid = () => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={`loading-movie-${index}`}
        className="h-[420px] animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60"
      />
    ))}
  </div>
);

const pageItemsFor = (page: number, totalPages: number): Array<number | "..."> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

const Pagination = ({
  page,
  totalPages,
  onPrev,
  onNext,
  onPageSelect
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (page: number) => void;
}) => (
  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
    <div className="text-sm text-slate-400">
      Page {page} of {totalPages}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-amber-300/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>

      {pageItemsFor(page, totalPages).map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-xs text-slate-500">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageSelect(item)}
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              item === page
                ? "border-amber-300/70 bg-amber-400/10 text-amber-300"
                : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-300/60 hover:text-amber-300"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-amber-300/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  </div>
);

export const MovieBrowserSection = ({
  movies,
  loading,
  isError,
  total,
  page,
  totalPages,
  onPrev,
  onNext,
  onPageSelect,
  onOpenMovie
}: MovieBrowserSectionProps) => {
  const items = movies ?? [];

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-4xl font-semibold text-white">All Movies</h2>
        <span className="text-2xl text-slate-400">{total} movies</span>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingGrid />
        ) : isError ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
            Failed to load movies. Check if backend is running.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-200">
            No movies found for this genre.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(movie => (
              <MovieCard
                key={movie._id ?? movie.title}
                movie={movie}
                onOpenMovie={onOpenMovie}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
          onPageSelect={onPageSelect}
        />
      ) : null}
    </section>
  );
};
