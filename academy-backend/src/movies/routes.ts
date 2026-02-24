import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { requireAuth, type AuthRequest } from "../auth/requireAuth";
import { MovieComments } from "./commentModel";
import { Movies, type IMoviesDocument } from "./models";

export const movieRouter = Router();

const parseMovieObjectId = (movieId?: string) => {
  if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
    return null;
  }

  return new mongoose.Types.ObjectId(movieId);
};

const parseStringList = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    const normalized = value.map((item) => item.trim()).filter(Boolean);
    return normalized.length ? normalized : undefined;
  }

  if (typeof value === "string") {
    const normalized = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }

  return undefined;
};

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sortFieldMap = {
  title: "title",
  year: "year",
  rating: "imdb.rating",
} as const;

movieRouter.get("/movies/genres", async (_req: Request, res: Response) => {
  try {
    const genres = await Movies.distinct("genres");
    const normalizedGenres = genres
      .filter(
        (genre): genre is string =>
          typeof genre === "string" && Boolean(genre.trim()),
      )
      .sort((a, b) => a.localeCompare(b));

    return res.json({ items: normalizedGenres });
  } catch (error) {
    console.error("Genres fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch genres." });
  }
});

movieRouter.get("/movies", async (req: Request, res: Response) => {
  try {
    const genre = asString(req.query.genre);
    const pageRaw = asString(req.query.page);
    const limitRaw = asString(req.query.limit);
    const sortByRaw = asString(req.query.sortBy);
    const orderRaw = asString(req.query.order);
    const searchRaw = asString(req.query.search);

    const pageNumber = Math.max(Number(pageRaw) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limitRaw) || 24, 1), 50);
    const sortOrder: 1 | -1 = orderRaw === "desc" ? -1 : 1;

    const sortBy =
      sortByRaw && sortByRaw in sortFieldMap
        ? (sortByRaw as keyof typeof sortFieldMap)
        : "title";

    const query: Record<string, unknown> = {};

    if (genre?.trim()) {
      query.genres = genre.trim();
    }

    if (searchRaw?.trim()) {
      const regex = new RegExp(escapeRegex(searchRaw.trim().slice(0, 80)), "i");

      query.$or = [
        { title: regex },
        { directors: regex },
        { cast: regex },
        { plot: regex },
        { fullplot: regex },
        { description: regex },
      ];
    }

    const [movies, total] = await Promise.all([
      Movies.find(query)
        .sort({ [sortFieldMap[sortBy]]: sortOrder, _id: 1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Movies.countDocuments(query),
    ]);

    return res.json({
      items: movies,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    });
  } catch (error) {
    console.error("Movies fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch movies." });
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
      awardsNominations,
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
    const parsedRating =
      imdbRating !== undefined ? Number(imdbRating) : Number.NaN;
    const parsedVotes = imdbVotes !== undefined ? Number(imdbVotes) : Number.NaN;
    const parsedImdbId = imdbId !== undefined ? Number(imdbId) : Number.NaN;
    const parsedAwardsWins =
      awardsWins !== undefined ? Number(awardsWins) : Number.NaN;
    const parsedAwardsNominations =
      awardsNominations !== undefined ? Number(awardsNominations) : Number.NaN;
    const parsedReleased = released ? new Date(released) : null;
    const normalizedAwardsText = awardsText?.trim();

    const movieData: Partial<IMoviesDocument> = {
      title: title.trim(),
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

    return res.status(201).json(movie);
  } catch (error) {
    console.error("Add movie error:", error);
    return res.status(500).json({ error: "Failed to add movie." });
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
      .limit(200)
      .populate("userId", "name email");

    const items = comments.map((comment) => {
      const populatedUser = comment.userId as unknown as {
        _id?: mongoose.Types.ObjectId;
        name?: string;
        email?: string;
      };

      return {
        _id: String(comment._id),
        movieId: String(comment.movieId),
        user: {
          id: populatedUser?._id ? String(populatedUser._id) : "",
          name: populatedUser?.name || "Unknown",
          email: populatedUser?.email || "",
        },
        text: comment.text,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });

    return res.json({ items });
  } catch (error) {
    console.error("Comments fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch comments." });
  }
});

movieRouter.post(
  "/:movieId/comments",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const movieObjectId = parseMovieObjectId(req.params.movieId);

    if (!movieObjectId) {
      return res.status(400).json({ error: "Invalid movie id." });
    }

    const { text } = req.body as { text?: string };

    const normalizedText = text?.trim();

    if (!normalizedText) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    try {
      const movieExists = await Movies.exists({ _id: movieObjectId });

      if (!movieExists) {
        return res.status(404).json({ error: "Movie not found." });
      }

      const comment = await MovieComments.create({
        movieId: movieObjectId,
        userId: new mongoose.Types.ObjectId(req.user!.id),
        text: normalizedText.slice(0, 600),
      });

      await comment.populate("userId", "name email");

      const populatedUser = comment.userId as unknown as {
        _id?: mongoose.Types.ObjectId;
        name?: string;
        email?: string;
      };

      return res.status(201).json({
        _id: String(comment._id),
        movieId: String(comment.movieId),
        user: {
          id: populatedUser?._id ? String(populatedUser._id) : req.user!.id,
          name: populatedUser?.name || req.user!.name,
          email: populatedUser?.email || req.user!.email,
        },
        text: comment.text,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      });
    } catch (error) {
      console.error("Add comment error:", error);
      return res.status(500).json({ error: "Failed to post comment." });
    }
  },
);

movieRouter.post("/:movieId/rate", requireAuth, async (req: AuthRequest, res: Response) => {
  const movieObjectId = parseMovieObjectId(req.params.movieId);

  if (!movieObjectId) {
    return res.status(400).json({ error: "Invalid movie id." });
  }

  const value = Number((req.body as { value?: number }).value);

  if (!Number.isFinite(value) || value < 1 || value > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  try {
    const movie = await Movies.findById(movieObjectId);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found." });
    }

    const userId = req.user!.id;
    const ratings = (movie.ratings ?? []) as Array<{
      userId: mongoose.Types.ObjectId;
      value: number;
      createdAt: Date;
    }>;

    const existing = ratings.find((item) => String(item.userId) === userId);

    if (existing) {
      existing.value = value;
      existing.createdAt = new Date();
    } else {
      ratings.push({
        userId: new mongoose.Types.ObjectId(userId),
        value,
        createdAt: new Date(),
      });
    }

    movie.ratings = ratings as any;
    await movie.save();

    const totalRatings = movie.ratings?.length ?? 0;
    const averageRating =
      totalRatings > 0
        ? Number(
            (
              (movie.ratings ?? []).reduce(
                (sum: number, item: any) => sum + Number(item.value),
                0,
              ) / totalRatings
            ).toFixed(1),
          )
        : 0;

    return res.json({
      averageRating,
      totalRatings,
      myRating: value,
    });
  } catch (error) {
    console.error("Rate movie error:", error);
    return res.status(500).json({ error: "Failed to rate movie." });
  }
});

movieRouter.post("/:movieId/like", requireAuth, async (req: AuthRequest, res: Response) => {
  const movieObjectId = parseMovieObjectId(req.params.movieId);

  if (!movieObjectId) {
    return res.status(400).json({ error: "Invalid movie id." });
  }

  try {
    const movie = await Movies.findById(movieObjectId);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found." });
    }

    const userId = req.user!.id;
    const likes = (movie.likes ?? []) as mongoose.Types.ObjectId[];
    const likeIndex = likes.findIndex((id) => String(id) === userId);

    let liked = false;

    if (likeIndex >= 0) {
      likes.splice(likeIndex, 1);
      liked = false;
    } else {
      likes.push(new mongoose.Types.ObjectId(userId));
      liked = true;
    }

    movie.likes = likes as any;
    await movie.save();

    return res.json({
      liked,
      likeCount: movie.likes?.length ?? 0,
    });
  } catch (error) {
    console.error("Like movie error:", error);
    return res.status(500).json({ error: "Failed to like movie." });
  }
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

    const ratings = movie.ratings ?? [];
    const totalUserRatings = ratings.length;
    const averageUserRating =
      totalUserRatings > 0
        ? Number(
            (
              ratings.reduce(
                (sum: number, item: any) => sum + Number(item.value),
                0,
              ) / totalUserRatings
            ).toFixed(1),
          )
        : 0;

    const likeCount = movie.likes?.length ?? 0;

    return res.json({
      ...movie.toObject(),
      averageUserRating,
      totalUserRatings,
      likeCount,
    });
  } catch (error) {
    console.error("Movie fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch movie." });
  }
});
