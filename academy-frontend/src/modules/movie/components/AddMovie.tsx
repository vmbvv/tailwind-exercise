import { useEffect, useState, type FormEvent } from "react";
import { useAddMovie, type AddMoviePayload } from "../hooks/useAddMovie";

export const AddMovie = () => {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [runtime, setRuntime] = useState("");
  const [genres, setGenres] = useState("");
  const [poster, setPoster] = useState("");
  const [plot, setPlot] = useState("");
  const [fullplot, setFullplot] = useState("");
  const [imdbRating, setImdbRating] = useState("");
  const [released, setReleased] = useState("");
  const [touched, setTouched] = useState(false);
  const { addMovie, isPending, isSuccess, isError, error } = useAddMovie();

  useEffect(() => {
    if (isSuccess) {
      setTitle("");
      setYear("");
      setRuntime("");
      setGenres("");
      setPoster("");
      setPlot("");
      setFullplot("");
      setImdbRating("");
      setReleased("");
      setTouched(false);
    }
  }, [isSuccess]);

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
    const parsedGenres = genres
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    const payload: AddMoviePayload = {
      title: value,
      year: Number.isFinite(parsedYear) ? parsedYear : undefined,
      runtime: Number.isFinite(parsedRuntime) ? parsedRuntime : undefined,
      genres: parsedGenres.length ? parsedGenres : undefined,
      poster: poster.trim() || undefined,
      plot: plot.trim() || undefined,
      fullplot: fullplot.trim() || undefined,
      imdbRating: Number.isFinite(parsedRating) ? parsedRating : undefined,
      released: released || undefined
    };

    addMovie(payload);
  };

  const showValidation = touched && !title.trim();
  const errorMessage =
    error instanceof Error ? error.message : "Something went wrong.";

  return (
    <section className="mt-10 animate-fade-up">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur"
      >
        <h2 className="text-2xl text-slate-100">Add movie</h2>
        <p className="mt-2 text-sm text-slate-300">Submit a title.</p>

        <label className="mt-6 block text-sm font-medium text-slate-200">
          Title
        </label>
        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="Movie title"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
        />
        {showValidation ? (
          <p className="mt-2 text-sm text-rose-200">
            Please enter a movie title.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={event => setYear(event.target.value)}
              placeholder="2021"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
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
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
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
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
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
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
            />
          </div>
        </div>

        <label className="mt-6 block text-sm font-medium text-slate-200">
          Genres
        </label>
        <input
          value={genres}
          onChange={event => setGenres(event.target.value)}
          placeholder="Drama, Romance"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
        />

        <label className="mt-6 block text-sm font-medium text-slate-200">
          Poster
        </label>
        <input
          value={poster}
          onChange={event => setPoster(event.target.value)}
          placeholder="Poster URL"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
        />

        <label className="mt-6 block text-sm font-medium text-slate-200">
          Plot
        </label>
        <textarea
          value={plot}
          onChange={event => setPlot(event.target.value)}
          placeholder="Short plot"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
        />

        <label className="mt-6 block text-sm font-medium text-slate-200">
          Full plot
        </label>
        <textarea
          value={fullplot}
          onChange={event => setFullplot(event.target.value)}
          placeholder="Full plot"
          rows={4}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
        />

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>

        {isSuccess ? (
          <p className="mt-4 text-sm text-teal-200">Saved.</p>
        ) : null}
        {isError ? (
          <p className="mt-4 text-sm text-rose-200">{errorMessage}</p>
        ) : null}
      </form>
    </section>
  );
};
