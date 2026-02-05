import { useQuery } from "@tanstack/react-query";

import type { IMovie } from "../types/movie";

interface MoviesResponse {
  items: IMovie[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useGetMoviesTans = (
  genre?: string,
  enabled = true,
  page = 1,
  pageSize = 25
) => {
  const { data, isLoading, isError } = useQuery<MoviesResponse>({
    queryKey: ["movies", genre, page, pageSize],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/movie/movies?genre=${genre || ""}&page=${page}&limit=${pageSize}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled
  });

  //   const [movies, setMovies] = useState<IMovie[]>([]);
  //   const [loading, setLoading] = useState<boolean>(true);

  //   useEffect(() => {

  //   }, [genre]);

  return {
    movies: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    isError
  };
};
