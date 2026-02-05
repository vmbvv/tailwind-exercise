import { useState } from "react";
import type { IMovie } from "../types/movie";

interface MoviesSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  emptyMessage: string;
  movies?: IMovie[];
  loading: boolean;
  isError: boolean;
  page?: number;
  totalPages?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onPageSelect?: (page: number) => void;
}

const MovieCard = ({ movie }: { movie: IMovie }) => {
  const genres = movie.genres?.slice(0, 3) ?? [];
  const summary = movie.fullplot ?? movie.plot;
  const rating = movie.imdb?.rating;
  const poster = movie.poster && movie.poster.startsWith("http");
  const initial = movie.title?.trim().charAt(0).toUpperCase() || "M";
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = Boolean(summary && summary.length > 180);
  const [hasImageError, setHasImageError] = useState(false);
  const hasPoster = Boolean(poster) && !hasImageError;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-teal-200/40 hover:bg-white/10">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        {hasPoster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            onError={() => setHasImageError(true)}
            className="h-full w-full object-contain bg-slate-950"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-900/60 text-center text-slate-200">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl font-semibold">
              {initial}
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/70">
              No poster
            </p>
            <p className="max-w-[180px] text-xs text-slate-400">No image.</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
          <span className="rounded-full bg-black/40 px-2 py-1">
            {movie.year ?? "Classic"}
          </span>
          {movie.runtime ? (
            <span className="rounded-full bg-black/40 px-2 py-1">
              {movie.runtime} min
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold leading-tight text-slate-100">
            {movie.title}
          </h3>
          {rating ? (
            <span className="rounded-full bg-teal-400/10 px-2 py-1 text-xs text-teal-200">
              IMDb {rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        {summary ? (
          <div>
            <p
              className={`text-sm text-slate-300 ${
                isExpanded ? "" : "line-clamp-4"
              }`}
            >
              {summary}
            </p>
            {canExpand ? (
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal-200 hover:text-teal-100"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            ) : null}
          </div>
        ) : null}
        {genres.length ? (
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <span
                key={genre}
                className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-200"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
};

const StateCard = ({
  title,
  message,
  hint
}: {
  title: string;
  message: string;
  hint?: string;
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-100">
    <p className="text-xs uppercase tracking-[0.3em] text-teal-200/60">
      {title}
    </p>
    <p className="mt-3 text-lg font-semibold">{message}</p>
    {hint ? <p className="mt-2 text-sm text-slate-300">{hint}</p> : null}
  </div>
);

const LoadingGrid = () => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`loading-${index}`}
        className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5"
      />
    ))}
  </div>
);

type PageItem = number | "...";

const PaginationControls = ({
  page,
  totalPages,
  pageItems,
  onPrev,
  onNext,
  onPageSelect
}: {
  page: number;
  totalPages: number;
  pageItems: PageItem[];
  onPrev?: () => void;
  onNext?: () => void;
  onPageSelect?: (page: number) => void;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
      Page {page} / {totalPages}
    </div>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={!onPrev || page <= 1}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-teal-200/40 hover:text-teal-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      {pageItems.map((item, index) =>
        item === "..." ? (
          <span
            key={`ellipsis-${page}-${index}`}
            className="px-2 text-xs text-slate-500"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageSelect?.(item)}
            aria-current={item === page ? "page" : undefined}
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              item === page
                ? "border-teal-200/60 bg-white/10 text-teal-200"
                : "border-white/10 bg-white/5 text-slate-200 hover:border-teal-200/40 hover:text-teal-200"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext || page >= totalPages}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-teal-200/40 hover:text-teal-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  </div>
);

export const MoviesSection = ({
  eyebrow,
  title,
  description,
  emptyMessage,
  movies,
  loading,
  isError,
  page,
  totalPages,
  onPrev,
  onNext,
  onPageSelect
}: MoviesSectionProps) => {
  const count = movies?.length ?? 0;
  const safePage = page ?? 1;
  const safeTotalPages = totalPages ?? 1;

  const pageItems: PageItem[] = (() => {
    if (safeTotalPages <= 1) {
      return [];
    }

    const neighborCount = 4;
    const fullWindow = neighborCount * 2 + 1;

    if (safeTotalPages <= fullWindow + 2) {
      return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }

    const items: PageItem[] = [];
    const pushPage = (value: PageItem) => {
      if (typeof value === "number") {
        if (value < 1 || value > safeTotalPages) {
          return;
        }
        const last = items[items.length - 1];
        if (last === value) {
          return;
        }
      }
      items.push(value);
    };

    const leftEdge = neighborCount + 2;
    const rightEdge = safeTotalPages - neighborCount - 1;

    pushPage(1);

    if (safePage <= leftEdge) {
      for (let i = 2; i <= leftEdge + neighborCount; i += 1) {
        pushPage(i);
      }
      pushPage("...");
    } else if (safePage >= rightEdge) {
      pushPage("...");
      for (let i = rightEdge - neighborCount; i < safeTotalPages; i += 1) {
        pushPage(i);
      }
    } else {
      pushPage("...");
      for (let i = safePage - neighborCount; i <= safePage + neighborCount; i += 1) {
        pushPage(i);
      }
      pushPage("...");
    }

    pushPage(safeTotalPages);

    return items;
  })();

  return (
    <section className="mt-10 animate-fade-up">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-200/60">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl text-slate-100">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {description}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          {count} items
        </div>
      </header>

      {safeTotalPages > 1 ? (
        <div className="mt-6">
          <PaginationControls
            page={safePage}
            totalPages={safeTotalPages}
            pageItems={pageItems}
            onPrev={onPrev}
            onNext={onNext}
            onPageSelect={onPageSelect}
          />
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <LoadingGrid />
        ) : isError ? (
          <StateCard
            title="Error"
            message="Failed to load."
            hint="Check the backend."
          />
        ) : count === 0 ? (
          <StateCard title="No results" message={emptyMessage} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {movies?.map(movie => (
              <MovieCard
                key={movie._id ?? movie.title}
                movie={movie}
              />
            ))}
          </div>
        )}
      </div>

      {safeTotalPages > 1 ? (
        <div className="mt-8">
          <PaginationControls
            page={safePage}
            totalPages={safeTotalPages}
            pageItems={pageItems}
            onPrev={onPrev}
            onNext={onNext}
            onPageSelect={onPageSelect}
          />
        </div>
      ) : null}
    </section>
  );
};
