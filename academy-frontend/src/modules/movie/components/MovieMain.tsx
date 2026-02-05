import { useState } from "react";
import { AllMovies } from "./AllMovies";
import { GenreMovies } from "./GenreMovies";
import { AddMovie } from "./AddMovie";

type MovieView = "all" | "genre" | "addMovie";

const tabs: Array<{
  id: MovieView;
  label: string;
  description: string;
}> = [
  {
    id: "all",
    label: "All",
    description: "Full list."
  },
  {
    id: "genre",
    label: "Genre",
    description: "Filter."
  },
  {
    id: "addMovie",
    label: "Add",
    description: "Submit a title."
  }
];

export const MovieContent = ({ dataType }: { dataType: MovieView }) => {
  if (dataType === "all") {
    return <AllMovies />;
  }
  if (dataType === "genre") {
    return <GenreMovies />;
  }
  return <AddMovie />;
};

export const MovieMain = () => {
  const [dataType, setDataType] = useState<MovieView>("all");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-80 w-80 animate-float rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-float rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 animate-fade-in bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.15),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <nav className="mt-10 grid gap-4 md:grid-cols-3 animate-fade-up">
          {tabs.map(tab => {
            const isActive = dataType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDataType(tab.id)}
                aria-pressed={isActive}
                className={`group relative w-full rounded-3xl border px-5 py-5 text-left transition duration-300 ${
                  isActive
                    ? "border-teal-200/60 bg-white/10 shadow-glow"
                    : "border-white/10 bg-white/5 hover:border-teal-200/30 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold text-slate-100">
                    {tab.label}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-teal-200" : "bg-slate-600"
                    }`}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {tab.description}
                </p>
              </button>
            );
          })}
        </nav>

        <MovieContent dataType={dataType} />
      </div>
    </div>
  );
};
