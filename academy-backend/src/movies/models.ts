import { Document, Schema, Types, model } from "mongoose";

interface IRating {
  rating: number;
  numReviews: number;
  meter: number;
}

interface ITomatoes extends Document {
  viewer: IRating;
  fresh?: number;
  critic?: IRating;
  rotten?: number;
  lastUpdated?: Date;
}

interface IMovieUserRating {
  userId: Types.ObjectId;
  value: number;
  createdAt: Date;
}

export interface IMoviesDocument extends Document {
  title: string;
  year?: number;
  plot?: string;
  fullplot?: string;
  genres?: string[];
  runtime?: number;
  cast?: string[];
  poster?: string;
  released?: Date;
  languages?: string[];
  directors?: string[];
  awards?: {
    wins?: number;
    nominations?: number;
    text?: string;
  };
  imdb?: {
    rating?: number;
    votes?: number;
    id?: number;
  };
  tomatoes?: ITomatoes;
  ratings?: IMovieUserRating[];
  likes?: Types.ObjectId[];
}

const TomatoesSchema: Schema<ITomatoes> = new Schema(
  {
    viewer: {
      rating: { type: Number },
      numReviews: { type: Number },
      meter: { type: Number },
    },
    critic: {
      rating: { type: Number },
      numReviews: { type: Number },
      meter: { type: Number },
    },
    rotten: Number,
    lastUpdated: Date,
  },
  { _id: false },
);

const MovieRatingSchema = new Schema<IMovieUserRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const MovieSchema: Schema<IMoviesDocument> = new Schema({
  title: { type: String, required: true },
  year: Number,
  plot: String,
  fullplot: String,
  genres: [String],
  runtime: Number,
  cast: [String],
  poster: String,
  released: Date,
  languages: [String],
  directors: [String],
  awards: {
    wins: Number,
    nominations: Number,
    text: String,
  },
  imdb: {
    rating: Number,
    votes: Number,
    id: Number,
  },
  tomatoes: TomatoesSchema,
  ratings: { type: [MovieRatingSchema], default: [] },
  likes: { type: [Schema.Types.ObjectId], ref: "users", default: [] },
});

export const Movies = model<IMoviesDocument>("movies", MovieSchema);
