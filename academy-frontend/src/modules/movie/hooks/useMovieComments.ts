import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/AuthContext";
import type { IMovieComment } from "../types/movie";

interface CommentsResponse {
  items: IMovieComment[];
}

interface AddMovieCommentPayload {
  text: string;
}

export const useMovieComments = (movieId?: string) => {
  const { data, isLoading, isError } = useQuery<CommentsResponse>({
    queryKey: ["movie-comments", movieId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/movie/${movieId}/comments`);

      if (!response.ok) {
        throw new Error("Failed to fetch movie comments");
      }

      return response.json();
    },
    enabled: Boolean(movieId),
    staleTime: 1000 * 30,
  });

  return {
    comments: data?.items ?? [],
    loading: isLoading,
    isError,
  };
};

export const useAddMovieComment = (movieId?: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const mutation = useMutation({
    mutationFn: async (payload: AddMovieCommentPayload) => {
      if (!movieId) {
        throw new Error("Movie id is required");
      }

      if (!token) {
        throw new Error("Login required");
      }

      const response = await fetch(`http://localhost:3000/movie/${movieId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to add movie comment");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movie-comments", movieId] });
    },
  });

  return {
    addComment: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};
