import { useGetMoviesTans } from "./useGetMoviesTans";

export const useGetMovies = (genre?: string) => {
  const { movies, loading, isError } = useGetMoviesTans({
    genre: genre?.trim() || undefined,
    page: 1,
    limit: 24,
    sortBy: "title",
    order: "asc",
  });

  return { movies, loading, isError };
};
