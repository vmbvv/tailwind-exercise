import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/AuthContext";

export const useLikeMovie = (movieId?: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!movieId) {
        throw new Error("Movie id is required");
      }

      if (!token) {
        throw new Error("Login required");
      }

      const response = await fetch(`http://localhost:3000/movie/${movieId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to toggle like");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movie-details", movieId] });
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  return {
    toggleLike: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useRateMovie = (movieId?: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ value }: { value: number }) => {
      if (!movieId) {
        throw new Error("Movie id is required");
      }

      if (!token) {
        throw new Error("Login required");
      }

      const response = await fetch(`http://localhost:3000/movie/${movieId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to rate movie");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movie-details", movieId] });
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  return {
    rateMovie: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
