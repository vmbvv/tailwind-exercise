import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Film,
  MessageCircle,
  Send,
  Star,
  UserCircle2
} from "lucide-react";
import { useGetMovieDetails } from "../hooks/useGetMovieDetails";
import { useAddMovieComment, useMovieComments } from "../hooks/useMovieComments";

interface MovieDetailsProps {
  movieId: string;
  onBack: () => void;
}

const formatAbsoluteDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
};

const formatRelativeTime = (value: string) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "just now";
  }

  const delta = Date.now() - timestamp;
  if (delta < 60_000) {
    return "just now";
  }

  const minutes = Math.floor(delta / 60_000);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export const MovieDetails = ({ movieId, onBack }: MovieDetailsProps) => {
  const { movie, loading, isError } = useGetMovieDetails(movieId);
  const { comments, loading: commentsLoading, isError: commentsError } = useMovieComments(movieId);
  const { addComment, isPending, isError: isCommentError, error } = useAddMovieComment(movieId);

  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [isMessageTouched, setIsMessageTouched] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const commentsSectionRef = useRef<HTMLElement | null>(null);

  const fullReleaseDate = useMemo(() => formatAbsoluteDate(movie?.released), [movie?.released]);
  const posterUrl = movie?.poster?.startsWith("http") ? movie.poster : "";
  const hasPoster = Boolean(posterUrl) && !hasImageError;
  const plot = movie?.fullplot ?? movie?.plot ?? "No plot is available yet.";
  const commentErrorMessage =
    error instanceof Error ? error.message : "Failed to post your comment.";

  const handleSubmitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsMessageTouched(true);

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    addComment(
      {
        author: author.trim() || "Anonymous",
        message: trimmedMessage
      },
      {
        onSuccess: () => {
          setMessage("");
          setIsMessageTouched(false);
        }
      }
    );
  };

  return (
    <section className="mt-10 animate-fade-up">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/70 hover:text-amber-300"
      >
        <ArrowLeft size={16} />
        Back to all movies
      </button>

      {loading ? (
        <div className="mt-6 h-80 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60" />
      ) : isError || !movie ? (
        <div className="mt-6 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
          Failed to load movie details.
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-slate-950/50">
              <div className="aspect-[2/3] w-full overflow-hidden bg-slate-950">
                {hasPoster ? (
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    onError={() => setHasImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                    <Film size={36} className="text-slate-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-semibold text-white md:text-5xl">{movie.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-base text-slate-300 md:text-xl">
                  {movie.imdb?.rating ? (
                    <span className="inline-flex items-center gap-2 text-amber-300">
                      <Star size={19} className="fill-current" />
                      {movie.imdb.rating.toFixed(1)}/10
                      {movie.imdb.votes ? (
                        <span className="text-slate-400">({movie.imdb.votes.toLocaleString()} votes)</span>
                      ) : null}
                    </span>
                  ) : null}

                  {movie.year ? (
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={18} />
                      {movie.year}
                    </span>
                  ) : null}

                  {movie.runtime ? (
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={18} />
                      {movie.runtime} min
                    </span>
                  ) : null}
                </div>
                {fullReleaseDate ? <p className="mt-2 text-sm text-slate-400">Released {fullReleaseDate}</p> : null}
                <button
                  type="button"
                  onClick={() => commentsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:border-amber-300/70 hover:bg-amber-400/20"
                >
                  <MessageCircle size={16} />
                  Show Reviews
                </button>
              </div>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6">
                <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-white">
                  <Film size={20} className="text-amber-300" />
                  Plot
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-200 md:text-lg">{plot}</p>
              </article>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5">
                  <h3 className="text-2xl font-semibold text-white">Genres</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {movie.genres?.length ? (
                      movie.genres.map(genre => (
                        <span
                          key={genre}
                          className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No genres available.</span>
                    )}
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5">
                  <h3 className="text-2xl font-semibold text-white">Directors</h3>
                  <ul className="mt-3 space-y-2 text-base text-slate-200 md:text-lg">
                    {movie.directors?.length ? (
                      movie.directors.map(director => (
                        <li key={director}>- {director}</li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-400">No director data.</li>
                    )}
                  </ul>
                </article>
              </div>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5">
                <h3 className="text-2xl font-semibold text-white">Cast</h3>
                {movie.cast?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {movie.cast.slice(0, 12).map(castName => (
                      <span
                        key={castName}
                        className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-200"
                      >
                        {castName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No cast list available.</p>
                )}
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5">
                <h3 className="text-2xl font-semibold text-white">Posters</h3>
                {hasPoster ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <img
                      src={posterUrl}
                      alt={`${movie.title} poster`}
                      className="w-full rounded-2xl border border-slate-700 object-cover"
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No poster available.</p>
                )}
              </article>
            </div>
          </div>

          <section ref={commentsSectionRef} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6">
            <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-white md:text-4xl">
              <MessageCircle size={24} className="text-amber-300" />
              Comments
            </h2>

            <form onSubmit={handleSubmitComment} className="mt-5 space-y-3">
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <input
                  type="text"
                  value={author}
                  onChange={event => setAuthor(event.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
                />
                <textarea
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  onBlur={() => setIsMessageTouched(true)}
                  placeholder="Share your thoughts about this movie..."
                  rows={2}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
                />
              </div>

              {isMessageTouched && !message.trim() ? (
                <p className="text-sm text-rose-200">Comment message is required.</p>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={16} />
                {isPending ? "Posting..." : "Post Comment"}
              </button>
            </form>

            {isCommentError ? <p className="mt-3 text-sm text-rose-200">{commentErrorMessage}</p> : null}

            <div className="mt-6 space-y-3">
              {commentsLoading ? (
                <div className="h-24 animate-pulse rounded-2xl border border-slate-800 bg-slate-950/40" />
              ) : commentsError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                  Failed to load comments.
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                  No comments yet. Be the first to comment.
                </div>
              ) : (
                comments.map(comment => (
                  <article
                    key={comment._id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/70 text-slate-200">
                        <UserCircle2 size={17} />
                      </span>
                      <p className="text-base font-semibold text-white md:text-lg">{comment.author}</p>
                      <span className="text-sm text-slate-500">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-3 text-base text-slate-200 md:text-lg">{comment.message}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};



