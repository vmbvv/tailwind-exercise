export interface IMovieRating {
  userId: string;
  value: number;
  createdAt: string;
}

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
  ratings?: IMovieRating[];
  likes?: string[];
  averageUserRating?: number;
  totalUserRatings?: number;
  likeCount?: number;
}

export interface IMovieComment {
  _id: string;
  movieId: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
}
