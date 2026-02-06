import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IMovieComment } from "../types/movie";

interface CommentsResponse {
  items: IMovieComment[];
}

interface AddMovieCommentPayload {
  author?: string;
  message: string;
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
    staleTime: 1000 * 30
  });

  return {
    comments: data?.items ?? [],
    loading: isLoading,
    isError
  };
};

export const useAddMovieComment = (movieId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: AddMovieCommentPayload) => {
      if (!movieId) {
        throw new Error("Movie id is required");
      }

      const response = await fetch(`http://localhost:3000/movie/${movieId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to add movie comment");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movie-comments", movieId] });
    }
  });

  return {
    addComment: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error
  };
};
