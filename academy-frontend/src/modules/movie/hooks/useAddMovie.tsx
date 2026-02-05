import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface AddMoviePayload {
  title: string;
  year?: number;
  runtime?: number;
  genres?: string[];
  poster?: string;
  plot?: string;
  fullplot?: string;
  imdbRating?: number;
  released?: string;
}

export const useAddMovie = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: AddMoviePayload) => {
      const response = await fetch(`http://localhost:3000/movie/addMovie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to add movie");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
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
