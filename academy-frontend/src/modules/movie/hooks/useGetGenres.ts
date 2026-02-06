import { useQuery } from "@tanstack/react-query";

interface GenresResponse {
  items: string[];
}

export const useGetGenres = () => {
  const { data, isLoading, isError } = useQuery<GenresResponse>({
    queryKey: ["movie-genres"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/movie/movies/genres");

      if (!response.ok) {
        throw new Error("Failed to fetch genres");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 10
  });

  return {
    genres: data?.items ?? [],
    loading: isLoading,
    isError
  };
};
