import { useState } from "react";
import { useGetMoviesTans } from "../hooks/useGetMoviesTans";
import { MoviesSection } from "./MoviesSection";

export const AllMovies = () => {
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const { movies, loading, isError, totalPages } = useGetMoviesTans(
    undefined,
    true,
    page,
    pageSize,
  );

  return (
    <MoviesSection
      eyebrow="All"
      title="All movies"
      description="Full list."
      emptyMessage="No items."
      movies={movies}
      loading={loading}
      isError={isError}
      page={page}
      totalPages={totalPages}
      onPrev={() => setPage((current) => Math.max(current - 1, 1))}
      onNext={() => {
        if (page < totalPages) {
          setPage((current) => current + 1);
        }
      }}
      onPageSelect={setPage}
    />
  );
};
