import { useState, type FormEvent } from "react";
import { useAddMovie, type AddMoviePayload } from "../hooks/useAddMovie";

interface AddMovieProps {
  onSuccess?: () => void;
}

export const AddMovie = ({ onSuccess }: AddMovieProps) => {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [runtime, setRuntime] = useState("");
  const [genres, setGenres] = useState("");
  const [cast, setCast] = useState("");
  const [directors, setDirectors] = useState("");
  const [languages, setLanguages] = useState("");
  const [poster, setPoster] = useState("");
  const [plot, setPlot] = useState("");
  const [fullplot, setFullplot] = useState("");
  const [imdbRating, setImdbRating] = useState("");
  const [imdbVotes, setImdbVotes] = useState("");
  const [imdbId, setImdbId] = useState("");
  const [awardsText, setAwardsText] = useState("");
  const [awardsWins, setAwardsWins] = useState("");
  const [awardsNominations, setAwardsNominations] = useState("");
  const [released, setReleased] = useState("");
  const [touched, setTouched] = useState(false);
  const { addMovie, isPending, isSuccess, isError, error } = useAddMovie();

  const resetForm = () => {
    setTitle("");
    setYear("");
    setRuntime("");
    setGenres("");
    setCast("");
    setDirectors("");
    setLanguages("");
    setPoster("");
    setPlot("");
    setFullplot("");
    setImdbRating("");
    setImdbVotes("");
    setImdbId("");
    setAwardsText("");
    setAwardsWins("");
    setAwardsNominations("");
    setReleased("");
    setTouched(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    const value = title.trim();
    if (!value) {
      return;
    }

    const parsedYear = Number(year);
    const parsedRuntime = Number(runtime);
    const parsedRating = Number(imdbRating);
    const parsedVotes = Number(imdbVotes);
    const parsedImdbId = Number(imdbId);
    const parsedAwardsWins = Number(awardsWins);
    const parsedAwardsNominations = Number(awardsNominations);
    const parsedGenres = genres
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    const parsedCast = cast
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    const parsedDirectors = directors
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    const parsedLanguages = languages
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    const payload: AddMoviePayload = {
      title: value,
      year: Number.isFinite(parsedYear) ? parsedYear : undefined,
      runtime: Number.isFinite(parsedRuntime) ? parsedRuntime : undefined,
      genres: parsedGenres.length ? parsedGenres : undefined,
      cast: parsedCast.length ? parsedCast : undefined,
      directors: parsedDirectors.length ? parsedDirectors : undefined,
      languages: parsedLanguages.length ? parsedLanguages : undefined,
      poster: poster.trim() || undefined,
      plot: plot.trim() || undefined,
      fullplot: fullplot.trim() || undefined,
      imdbRating: Number.isFinite(parsedRating) ? parsedRating : undefined,
      imdbVotes: Number.isFinite(parsedVotes) ? parsedVotes : undefined,
      imdbId: Number.isFinite(parsedImdbId) ? parsedImdbId : undefined,
      awardsText: awardsText.trim() || undefined,
      awardsWins: Number.isFinite(parsedAwardsWins) ? parsedAwardsWins : undefined,
      awardsNominations: Number.isFinite(parsedAwardsNominations)
        ? parsedAwardsNominations
        : undefined,
      released: released || undefined
    };

    addMovie(payload, {
      onSuccess: () => {
        resetForm();
        onSuccess?.();
      }
    });
  };

  const showValidation = touched && !title.trim();
  const errorMessage =
    error instanceof Error ? error.message : "Something went wrong.";

  return (
    <section className="animate-fade-up">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-slate-950/60 md:p-6"
      >
        <h2 className="text-2xl text-slate-100 md:text-3xl">Add Movie</h2>
        <p className="mt-2 text-sm text-slate-300">Create a new title in your collection.</p>

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Title
        </label>
        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="Movie title"
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />
        {showValidation ? (
          <p className="mt-2 text-sm text-rose-200">
            Please enter a movie title.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={event => setYear(event.target.value)}
              placeholder="2021"
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Runtime
            </label>
            <input
              type="number"
              value={runtime}
              onChange={event => setRuntime(event.target.value)}
              placeholder="98"
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">
              IMDb
            </label>
            <input
              type="number"
              step="0.1"
              value={imdbRating}
              onChange={event => setImdbRating(event.target.value)}
              placeholder="7.8"
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">
              IMDb Votes
            </label>
            <input
              type="number"
              value={imdbVotes}
              onChange={event => setImdbVotes(event.target.value)}
              placeholder="12450"
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">
              IMDb ID
            </label>
            <input
              type="number"
              value={imdbId}
              onChange={event => setImdbId(event.target.value)}
              placeholder="12345"
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Released
            </label>
            <input
              type="date"
              value={released}
              onChange={event => setReleased(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Genres
        </label>
        <input
          value={genres}
          onChange={event => setGenres(event.target.value)}
          placeholder="Drama, Romance"
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Cast
        </label>
        <input
          value={cast}
          onChange={event => setCast(event.target.value)}
          placeholder="Actor 1, Actor 2"
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Directors
        </label>
        <input
          value={directors}
          onChange={event => setDirectors(event.target.value)}
          placeholder="Director 1, Director 2"
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Languages
        </label>
        <input
          value={languages}
          onChange={event => setLanguages(event.target.value)}
          placeholder="English, French"
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Awards Summary
        </label>
        <input
          value={awardsText}
          onChange={event => setAwardsText(event.target.value)}
          placeholder="Won 3 Oscars."
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Awards Wins
            </label>
            <input
              type="number"
              value={awardsWins}
              onChange={event => setAwardsWins(event.target.value)}
              placeholder="3"
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Awards Nominations
            </label>
            <input
              type="number"
              value={awardsNominations}
              onChange={event => setAwardsNominations(event.target.value)}
              placeholder="8"
              className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Poster
        </label>
        <input
          value={poster}
          onChange={event => setPoster(event.target.value)}
          placeholder="Poster URL"
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Plot
        </label>
        <textarea
          value={plot}
          onChange={event => setPlot(event.target.value)}
          placeholder="Short plot"
          rows={2}
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <label className="mt-4 block text-sm font-medium text-slate-200">
          Full plot
        </label>
        <textarea
          value={fullplot}
          onChange={event => setFullplot(event.target.value)}
          placeholder="Full plot"
          rows={3}
          className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
        />

        <button
          type="submit"
          disabled={isPending}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Movie"}
        </button>

        {isSuccess ? (
          <p className="mt-4 text-sm text-amber-200">Movie saved.</p>
        ) : null}
        {isError ? (
          <p className="mt-4 text-sm text-rose-200">{errorMessage}</p>
        ) : null}
      </form>
    </section>
  );
};
