import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/AuthContext";

interface GenresResponse {
  items: string[];
}

export const useGetGenres = (enabled = true) => {
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useQuery<GenresResponse>({
    queryKey: ["movie-genres"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/movies/genres", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch genres");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 10,
    enabled: enabled && isAuthenticated,
  });

  return {
    genres: data?.items ?? [],
    loading: isLoading,
    isError,
  };
};
