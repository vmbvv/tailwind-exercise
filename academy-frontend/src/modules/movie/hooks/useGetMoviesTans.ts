import { useQuery } from "@tanstack/react-query";
import type { IMovie } from "../types/movie";

interface MoviesResponse {
  items: IMovie[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type MovieSortBy = "title" | "year" | "rating";
export type MovieOrder = "asc" | "desc";

export interface MovieQueryParams {
  genre?: string;
  page: number;
  limit: number;
  sortBy: MovieSortBy;
  order: MovieOrder;
  search?: string;
}

export const useGetMoviesTans = (params: MovieQueryParams, enabled = true) => {
  const { data, isLoading, isError } = useQuery<MoviesResponse>({
    queryKey: ["movies", params],
    queryFn: async () => {
      const qs = new URLSearchParams();

      if (params.genre?.trim()) {
        qs.set("genre", params.genre.trim());
      }

      if (params.search?.trim()) {
        qs.set("search", params.search.trim());
      }

      qs.set("page", String(params.page));
      qs.set("limit", String(params.limit));
      qs.set("sortBy", params.sortBy);
      qs.set("order", params.order);

      const response = await fetch(
        `http://localhost:3000/movie/movies?${qs.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  return {
    movies: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? params.page,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    isError,
  };
};
