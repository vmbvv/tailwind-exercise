import { Document, Schema, Types, model } from "mongoose";

export interface IMovieCommentDocument extends Document {
  movieId: Types.ObjectId;
  author: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const MovieCommentSchema = new Schema<IMovieCommentDocument>(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "movies"
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600
    }
  },
  { timestamps: true }
);

export const MovieComments = model<IMovieCommentDocument>(
  "movie_comments",
  MovieCommentSchema
);
