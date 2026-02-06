import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Movies, type IMoviesDocument } from "./models";
import { MovieComments } from "./commentModel";

export const movieRouter = Router();

const parseMovieObjectId = (movieId?: string) => {
  if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
    return null;
  }

  return new mongoose.Types.ObjectId(movieId);
};

const parseStringList = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    const normalized = value.map(item => item.trim()).filter(Boolean);
    return normalized.length ? normalized : undefined;
  }

  if (typeof value === "string") {
    const normalized = value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }

  return undefined;
};

movieRouter.get("/movies/genres", async (_req: Request, res: Response) => {
  try {
    const genres = await Movies.distinct("genres");
    const normalizedGenres = genres
      .filter((genre): genre is string => typeof genre === "string" && Boolean(genre.trim()))
      .sort((a, b) => a.localeCompare(b));

    res.json({ items: normalizedGenres });
  } catch (error) {
    console.error("Genres fetch error:", error);
    res.status(500).json({ error: "Failed to fetch genres." });
  }
});

movieRouter.get("/movies", async (req: Request, res: Response) => {
  const { genre, page, limit } = req.query;

  const query = {} as any;

  if (genre) {
    query.genres = genre;
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 25, 1), 50);

  const [movies, total] = await Promise.all([
    Movies.find(query)
      .sort({ _id: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Movies.countDocuments(query)
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  res.json({
    items: movies,
    total,
    page: pageNumber,
    pageSize,
    totalPages
  });
});

movieRouter.get("/:movieId", async (req: Request, res: Response) => {
  const movieObjectId = parseMovieObjectId(req.params.movieId);

  if (!movieObjectId) {
    return res.status(400).json({ error: "Invalid movie id." });
  }

  try {
    const movie = await Movies.findById(movieObjectId);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found." });
    }

    res.json(movie);
  } catch (error) {
    console.error("Movie fetch error:", error);
    res.status(500).json({ error: "Failed to fetch movie." });
  }
});

movieRouter.post("/addMovie", async (req: Request, res: Response) => {
  try {
    const {
      title,
      year,
      runtime,
      genres,
      cast,
      directors,
      languages,
      poster,
      plot,
      fullplot,
      imdbRating,
      imdbVotes,
      imdbId,
      released,
      awardsText,
      awardsWins,
      awardsNominations
    } = req.body as {
      title?: string;
      year?: number | string;
      runtime?: number | string;
      genres?: string[] | string;
      cast?: string[] | string;
      directors?: string[] | string;
      languages?: string[] | string;
      poster?: string;
      plot?: string;
      fullplot?: string;
      imdbRating?: number | string;
      imdbVotes?: number | string;
      imdbId?: number | string;
      released?: string;
      awardsText?: string;
      awardsWins?: number | string;
      awardsNominations?: number | string;
    };

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    const parsedGenres = parseStringList(genres);
    const parsedCast = parseStringList(cast);
    const parsedDirectors = parseStringList(directors);
    const parsedLanguages = parseStringList(languages);

    const parsedYear = year !== undefined ? Number(year) : Number.NaN;
    const parsedRuntime = runtime !== undefined ? Number(runtime) : Number.NaN;
    const parsedRating = imdbRating !== undefined ? Number(imdbRating) : Number.NaN;
    const parsedVotes = imdbVotes !== undefined ? Number(imdbVotes) : Number.NaN;
    const parsedImdbId = imdbId !== undefined ? Number(imdbId) : Number.NaN;
    const parsedAwardsWins = awardsWins !== undefined ? Number(awardsWins) : Number.NaN;
    const parsedAwardsNominations =
      awardsNominations !== undefined ? Number(awardsNominations) : Number.NaN;
    const parsedReleased = released ? new Date(released) : null;
    const normalizedAwardsText = awardsText?.trim();

    const movieData: Partial<IMoviesDocument> = {
      title: title.trim()
    };

    if (Number.isFinite(parsedYear)) {
      movieData.year = parsedYear;
    }
    if (Number.isFinite(parsedRuntime)) {
      movieData.runtime = parsedRuntime;
    }
    if (parsedGenres?.length) {
      movieData.genres = parsedGenres;
    }
    if (parsedCast?.length) {
      movieData.cast = parsedCast;
    }
    if (parsedDirectors?.length) {
      movieData.directors = parsedDirectors;
    }
    if (parsedLanguages?.length) {
      movieData.languages = parsedLanguages;
    }
    const trimmedPoster = poster?.trim();
    if (trimmedPoster) {
      movieData.poster = trimmedPoster;
    }
    const trimmedPlot = plot?.trim();
    if (trimmedPlot) {
      movieData.plot = trimmedPlot;
    }
    const trimmedFullplot = fullplot?.trim();
    if (trimmedFullplot) {
      movieData.fullplot = trimmedFullplot;
    }
    if (
      Number.isFinite(parsedRating) ||
      Number.isFinite(parsedVotes) ||
      Number.isFinite(parsedImdbId)
    ) {
      movieData.imdb = {};

      if (Number.isFinite(parsedRating)) {
        movieData.imdb.rating = parsedRating;
      }
      if (Number.isFinite(parsedVotes)) {
        movieData.imdb.votes = parsedVotes;
      }
      if (Number.isFinite(parsedImdbId)) {
        movieData.imdb.id = parsedImdbId;
      }
    }
    if (
      normalizedAwardsText ||
      Number.isFinite(parsedAwardsWins) ||
      Number.isFinite(parsedAwardsNominations)
    ) {
      movieData.awards = {};

      if (normalizedAwardsText) {
        movieData.awards.text = normalizedAwardsText;
      }
      if (Number.isFinite(parsedAwardsWins)) {
        movieData.awards.wins = parsedAwardsWins;
      }
      if (Number.isFinite(parsedAwardsNominations)) {
        movieData.awards.nominations = parsedAwardsNominations;
      }
    }
    if (parsedReleased && !Number.isNaN(parsedReleased.valueOf())) {
      movieData.released = parsedReleased;
    }

    const movie = await Movies.create(movieData);

    res.status(201).json(movie);
  } catch (error) {
    console.error("Add movie error:", error);
    res.status(500).json({ error: "Failed to add movie." });
  }
});

movieRouter.get("/:movieId/comments", async (req: Request, res: Response) => {
  const movieObjectId = parseMovieObjectId(req.params.movieId);

  if (!movieObjectId) {
    return res.status(400).json({ error: "Invalid movie id." });
  }

  try {
    const comments = await MovieComments.find({ movieId: movieObjectId })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ items: comments });
  } catch (error) {
    console.error("Comments fetch error:", error);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

movieRouter.post("/:movieId/comments", async (req: Request, res: Response) => {
  const movieObjectId = parseMovieObjectId(req.params.movieId);

  if (!movieObjectId) {
    return res.status(400).json({ error: "Invalid movie id." });
  }

  const { author, message } = req.body as {
    author?: string;
    message?: string;
  };

  const normalizedMessage = message?.trim();
  if (!normalizedMessage) {
    return res.status(400).json({ error: "Comment message is required." });
  }

  try {
    const movieExists = await Movies.exists({ _id: movieObjectId });
    if (!movieExists) {
      return res.status(404).json({ error: "Movie not found." });
    }

    const normalizedAuthor = author?.trim() || "Anonymous";
    const comment = await MovieComments.create({
      movieId: movieObjectId,
      author: normalizedAuthor.slice(0, 40),
      message: normalizedMessage.slice(0, 600)
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Failed to post comment." });
  }
});
