import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/AuthContext";

export interface AddMoviePayload {
  title: string;
  year?: number;
  runtime?: number;
  genres?: string[];
  cast?: string[];
  directors?: string[];
  languages?: string[];
  poster?: string;
  plot?: string;
  fullplot?: string;
  imdbRating?: number;
  imdbVotes?: number;
  imdbId?: number;
  awardsText?: string;
  awardsWins?: number;
  awardsNominations?: number;
  released?: string;
}

export const useAddMovie = () => {
  const queryClient = useQueryClient();
  const { token, getAuthHeaders } = useAuth();

  const mutation = useMutation({
    mutationFn: async (payload: AddMoviePayload) => {
      if (!token) {
        throw new Error("Login required");
      }

      const response = await fetch(`http://localhost:3000/movie/addMovie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to add movie");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
      await queryClient.invalidateQueries({ queryKey: ["movie-genres"] });
    }
  });

  return {
    addMovie: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error
  };
};
