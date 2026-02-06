export interface IMovie {
  _id?: string;
  title: string;
  year?: number;
  released?: string;
  genres?: string[];
  runtime?: number;
  directors?: string[];
  cast?: string[];
  languages?: string[];
  poster?: string;
  plot?: string;
  fullplot?: string;
  awards?: {
    text?: string;
    wins?: number;
    nominations?: number;
  };
  imdb?: {
    rating?: number;
    votes?: number;
    id?: number;
  };
}

export interface IMovieComment {
  _id: string;
  movieId: string;
  author: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}
