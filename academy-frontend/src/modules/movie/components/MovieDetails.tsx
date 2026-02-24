import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Film, Heart, MessageCircle, Star } from "lucide-react";
import { useAuth } from "@/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useGetMovieDetails } from "../hooks/useGetMovieDetails";
import { useAddMovieComment, useMovieComments } from "../hooks/useMovieComments";
import { useLikeMovie, useRateMovie } from "../hooks/useMovieInteractions";

interface MovieDetailsProps {
  movieId: string;
  onBack: () => void;
}

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
  const {
    comments,
    loading: commentsLoading,
    isError: commentsError,
  } = useMovieComments(movieId);
  const {
    addComment,
    isPending: commentPending,
    isError: isCommentError,
    error: commentError,
  } = useAddMovieComment(movieId);

  const { toggleLike, isPending: likePending, error: likeError } = useLikeMovie(movieId);
  const { rateMovie, isPending: ratePending, error: rateError } = useRateMovie(movieId);

  const { user, isAuthenticated } = useAuth();

  const [message, setMessage] = useState("");
  const [hasImageError, setHasImageError] = useState(false);
  const commentsSectionRef = useRef<HTMLElement | null>(null);

  const posterUrl = movie?.poster?.startsWith("http") ? movie.poster : "";
  const hasPoster = Boolean(posterUrl) && !hasImageError;
  const plot = movie?.fullplot ?? movie?.plot ?? "No plot is available yet.";

  const likeCount = movie?.likeCount ?? movie?.likes?.length ?? 0;

  const hasLiked = useMemo(() => {
    if (!user || !movie?.likes?.length) {
      return false;
    }

    return movie.likes.some((id) => String(id) === user.id);
  }, [movie?.likes, user]);

  const myRating = useMemo(() => {
    if (!user || !movie?.ratings?.length) {
      return 0;
    }

    const existing = movie.ratings.find((item) => String(item.userId) === user.id);
    return existing?.value ?? 0;
  }, [movie?.ratings, user]);

  const averageRating = useMemo(() => {
    if (typeof movie?.averageUserRating === "number") {
      return movie.averageUserRating;
    }

    if (!movie?.ratings?.length) {
      return 0;
    }

    return Number(
      (
        movie.ratings.reduce((sum, item) => sum + Number(item.value), 0) /
        movie.ratings.length
      ).toFixed(1),
    );
  }, [movie]);

  const totalRatings = movie?.totalUserRatings ?? movie?.ratings?.length ?? 0;

  const handleSubmitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    addComment(
      { text: trimmedMessage },
      {
        onSuccess: () => {
          setMessage("");
        },
      },
    );
  };

  const handleRate = (value: number) => {
    if (!isAuthenticated) {
      return;
    }

    rateMovie({ value });
  };

  return (
    <section className="mt-10 animate-fade-up">
      <Button type="button" variant="outline" onClick={onBack} className="inline-flex items-center gap-2">
        <ArrowLeft size={16} />
        Back to all movies
      </Button>

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

            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-semibold text-white md:text-5xl">{movie.title}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.imdb?.rating ? <Badge>IMDb {movie.imdb.rating.toFixed(1)}</Badge> : null}
                  {movie.year ? <Badge variant="secondary">Year {movie.year}</Badge> : null}
                  {movie.runtime ? <Badge variant="secondary">{movie.runtime} min</Badge> : null}
                  <Badge variant="secondary">Avg rating {averageRating}</Badge>
                  <Badge variant="secondary">Likes {likeCount}</Badge>
                </div>

                <Button
                  type="button"
                  onClick={() => commentsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                  variant="outline"
                  className="mt-4 inline-flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Show comments
                </Button>
              </div>

              <Card className="border-slate-800 bg-slate-900/75">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white">Plot</h2>
                  <p className="mt-3 text-base leading-relaxed text-slate-200 md:text-lg">{plot}</p>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/75">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white">Your rating</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!isAuthenticated || ratePending}
                        onClick={() => handleRate(value)}
                      >
                        <Star
                          size={18}
                          className={
                            value <= myRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-400"
                          }
                        />
                      </Button>
                    ))}
                    <span className="text-sm text-slate-400">{totalRatings} total ratings</span>
                  </div>

                  <Button
                    type="button"
                    variant={hasLiked ? "default" : "outline"}
                    disabled={!isAuthenticated || likePending}
                    onClick={() => toggleLike()}
                    className="mt-4 inline-flex items-center gap-2"
                  >
                    <Heart size={16} className={hasLiked ? "fill-current" : ""} />
                    {hasLiked ? "Unlike" : "Like"}
                  </Button>

                  {!isAuthenticated ? (
                    <p className="mt-3 text-sm text-amber-300">
                      Login required for like, rating and comments.
                    </p>
                  ) : null}

                  {likeError ? (
                    <p className="mt-2 text-sm text-rose-300">
                      {likeError instanceof Error ? likeError.message : "Failed to like movie."}
                    </p>
                  ) : null}

                  {rateError ? (
                    <p className="mt-2 text-sm text-rose-300">
                      {rateError instanceof Error ? rateError.message : "Failed to rate movie."}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>

          <section
            ref={commentsSectionRef}
            className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6"
          >
            <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-white md:text-4xl">
              <MessageCircle size={24} className="text-amber-300" />
              Comments
            </h2>

            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="mt-5 space-y-3">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share your thoughts about this movie..."
                  rows={3}
                  className="bg-slate-950/70 text-slate-100"
                />
                <Button type="submit" disabled={commentPending}>
                  {commentPending ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Login to post a comment.</p>
            )}

            {isCommentError ? (
              <p className="mt-3 text-sm text-rose-200">
                {commentError instanceof Error ? commentError.message : "Failed to post your comment."}
              </p>
            ) : null}

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
                comments.map((comment) => (
                  <article
                    key={comment._id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.user.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-base font-semibold text-white md:text-lg">
                        {comment.user.name}
                      </p>
                      <span className="text-sm text-slate-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-base text-slate-200 md:text-lg">{comment.text}</p>
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
