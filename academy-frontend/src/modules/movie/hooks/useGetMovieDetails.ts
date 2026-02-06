import { useQuery } from "@tanstack/react-query";
import type { IMovie } from "../types/movie";

export const useGetMovieDetails = (movieId?: string) => {
  const { data, isLoading, isError } = useQuery<IMovie>({
    queryKey: ["movie-details", movieId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/movie/${movieId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      return response.json();
    },
    enabled: Boolean(movieId),
    staleTime: 1000 * 60 * 5
  });

  return {
    movie: data,
    loading: isLoading,
    isError
  };
};
