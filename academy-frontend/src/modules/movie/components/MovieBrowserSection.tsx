import { useMemo, useState } from "react";
import { Calendar, Clock3, Heart, Play, Star } from "lucide-react";
import { useAuth } from "@/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useLikeMovie, useRateMovie } from "../hooks/useMovieInteractions";
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
  onOpenMovie,
}: {
  movie: IMovie;
  onOpenMovie: (movieId: string) => void;
}) => {
  const { user } = useAuth();
  const { toggleLike, isPending: likePending } = useLikeMovie(movie._id);
  const { rateMovie, isPending: ratePending } = useRateMovie(movie._id);
  const [hasImageError, setHasImageError] = useState(false);

  const hasPoster = Boolean(movie.poster?.startsWith("http")) && !hasImageError;
  const summary = movie.plot ?? movie.fullplot ?? "No plot available for this movie.";
  const shortenedSummary =
    summary.length > 90 ? `${summary.slice(0, 90).trim()}...` : summary;
  const ratings = movie.ratings ?? [];
  const likeCount = movie.likeCount ?? movie.likes?.length ?? 0;
  const hasLiked = Boolean(user && movie.likes?.some((id) => String(id) === user.id));
  const myRating = user
    ? (ratings.find((item) => String(item.userId) === user.id)?.value ?? 0)
    : 0;
  const averageRating =
    typeof movie.averageUserRating === "number"
      ? movie.averageUserRating
      : ratings.length
        ? Number(
            (ratings.reduce((sum, item) => sum + Number(item.value), 0) / ratings.length).toFixed(1),
          )
        : 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-slate-800 bg-slate-900/70 transition hover:-translate-y-1 hover:border-amber-300/60">
      <button
        type="button"
        disabled={!movie._id}
        onClick={() => {
          if (movie._id) {
            onOpenMovie(movie._id);
          }
        }}
        className="flex flex-1 flex-col text-left disabled:cursor-not-allowed"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
          {hasPoster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              onError={() => setHasImageError(true)}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <span className="text-3xl font-semibold text-slate-400">
                {movie.title.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30">
              <Play size={22} className="ml-0.5" />
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

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-xl text-slate-100">{movie.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-300">{shortenedSummary}</p>
        </CardContent>
      </button>

      <CardFooter className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-300">
        {movie.imdb?.rating ? (
          <Badge variant="secondary" className="gap-1 text-amber-200">
            <Star size={13} className="fill-current" />
            {movie.imdb.rating.toFixed(1)}
          </Badge>
        ) : null}

        {movie.runtime ? (
          <span className="inline-flex items-center gap-1">
            <Clock3 size={13} />
            {movie.runtime} min
          </span>
        ) : null}

        {movie.year ? (
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} />
            {movie.year}
          </span>
        ) : null}

        <Badge variant="secondary">Avg {averageRating.toFixed(1)}</Badge>
        <Badge variant="secondary">Likes {likeCount}</Badge>
      </CardFooter>

      <div className="flex items-center justify-between gap-3 px-6 pb-6">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="icon"
              disabled={!movie._id || ratePending}
              onClick={(event) => {
                event.stopPropagation();
                rateMovie({ value });
              }}
              className="h-7 w-7"
            >
              <Star
                size={15}
                className={value <= myRating ? "fill-amber-400 text-amber-400" : "text-slate-500"}
              />
            </Button>
          ))}
        </div>

        <Button
          type="button"
          size="sm"
          variant={hasLiked ? "default" : "outline"}
          disabled={!movie._id || likePending}
          onClick={(event) => {
            event.stopPropagation();
            toggleLike();
          }}
          className="inline-flex items-center gap-1"
        >
          <Heart size={14} className={hasLiked ? "fill-current" : ""} />
          {hasLiked ? "Unlike" : "Like"}
        </Button>
      </div>
    </Card>
  );
};

const LoadingGrid = () => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <Skeleton
        key={`loading-movie-${index}`}
        className="h-[460px] rounded-3xl border border-slate-800 bg-slate-900/60"
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
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

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
  onOpenMovie,
}: MovieBrowserSectionProps) => {
  const items = movies ?? [];

  const pageItems = useMemo(() => pageItemsFor(page, totalPages), [page, totalPages]);

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
            No movies found for current filter.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((movie) => (
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
        <Pagination className="mt-8 justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page > 1) {
                    onPrev();
                  }
                }}
              />
            </PaginationItem>

            {pageItems.map((item, index) =>
              item === "..." ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === page}
                    onClick={(event) => {
                      event.preventDefault();
                      onPageSelect(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page < totalPages) {
                    onNext();
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </section>
  );
};
