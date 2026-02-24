import { Router, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Users } from "./userModel";
import { requireAuth, type AuthRequest } from "./requireAuth";

export const authRouter = Router();

const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const signToken = (user: { _id: unknown; email: string; name: string }) =>
  jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );

authRouter.post("/signup", async (req, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json({ error: "Name, email and password are required." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Users.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Email already exists." });
    }

    return res.status(500).json({ error: "Failed to sign up." });
  }
});

authRouter.post("/login", async (req, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json({ error: "Email and password are required." });
  }

  try {
    const user = await Users.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to login." });
  }
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await Users.findById(req.user?.id).select("_id name email");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to fetch current user." });
  }
});
