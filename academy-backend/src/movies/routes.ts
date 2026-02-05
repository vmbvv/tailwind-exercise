import { Router, Request, Response } from "express";
import { Movies, type IMoviesDocument } from "./models";

export const movieRouter = Router();

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

movieRouter.post("/addMovie", async (req: Request, res: Response) => {
  try {
    const {
      title,
      year,
      runtime,
      genres,
      poster,
      plot,
      fullplot,
      imdbRating,
      released
    } = req.body as {
      title?: string;
      year?: number | string;
      runtime?: number | string;
      genres?: string[] | string;
      poster?: string;
      plot?: string;
      fullplot?: string;
      imdbRating?: number | string;
      released?: string;
    };

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    const parsedGenres = Array.isArray(genres)
      ? genres.map(item => item.trim()).filter(Boolean)
      : typeof genres === "string"
        ? genres
            .split(",")
            .map(item => item.trim())
            .filter(Boolean)
        : undefined;

    const parsedYear = year !== undefined ? Number(year) : Number.NaN;
    const parsedRuntime = runtime !== undefined ? Number(runtime) : Number.NaN;
    const parsedRating =
      imdbRating !== undefined ? Number(imdbRating) : Number.NaN;
    const parsedReleased = released ? new Date(released) : null;

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
    if (Number.isFinite(parsedRating)) {
      movieData.imdb = { rating: parsedRating };
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
