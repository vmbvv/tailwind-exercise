import { useNavigate, useParams } from "react-router-dom";
import { MovieDetails } from "./MovieDetails";

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.09),_transparent_45%)]" />
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1300px] px-6 py-10">
        {id ? (
          <MovieDetails movieId={id} onBack={() => navigate("/")} />
        ) : (
          <section className="mt-10 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
            Invalid movie id.
          </section>
        )}
      </div>
    </div>
  );
};
