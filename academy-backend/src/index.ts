import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import {
  getMovieGenresHandler,
  getMoviesHandler,
  movieRouter,
} from "./movies/routes.ts";
import { authRouter } from "./auth/routes.ts";
import { requireAuth } from "./auth/requireAuth.ts";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://enkhtuvshinej_db_user:7aLod5Z9aBfk23pu@backend-lesson.pfxqeun.mongodb.net/sample_mflix?appName=backend-lesson";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/auth", authRouter);
app.use("/movie", movieRouter);
app.get("/movies", requireAuth, getMoviesHandler);
app.get("/movies/genres", requireAuth, getMovieGenresHandler);

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err: Error) => {
    console.error("MongoDB connection error:", err);
  });
