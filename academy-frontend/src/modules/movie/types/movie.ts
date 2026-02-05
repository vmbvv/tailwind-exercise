export interface IMovie {
  _id?: string;
  title: string;
  year?: number;
  genres?: string[];
  runtime?: number;
  poster?: string;
  plot?: string;
  fullplot?: string;
  imdb?: {
    rating?: number;
  };
}
