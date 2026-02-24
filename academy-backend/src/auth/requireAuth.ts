import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const getTokenFromHeader = (authHeader?: string) => {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

const isJwtPayload = (value: unknown): value is JwtPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.id === "string" &&
    typeof payload.email === "string" &&
    typeof payload.name === "string"
  );
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({ error: "Authorization token is required." });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (!isJwtPayload(payload)) {
      res.status(401).json({ error: "Invalid token payload." });
      return;
    }

    (req as AuthRequest).user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };

    next();
    return;
  } catch (_error) {
    res.status(401).json({ error: "Invalid or expired token." });
    return;
  }
};
