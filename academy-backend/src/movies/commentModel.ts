import { Document, Schema, Types, model } from "mongoose";

export interface IMovieCommentDocument extends Document {
  movieId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MovieCommentSchema = new Schema<IMovieCommentDocument>(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "movies",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "users",
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
  },
  { timestamps: true },
);

MovieCommentSchema.index({ movieId: 1, createdAt: -1 });

export const MovieComments = model<IMovieCommentDocument>(
  "movie_comments",
  MovieCommentSchema,
);
