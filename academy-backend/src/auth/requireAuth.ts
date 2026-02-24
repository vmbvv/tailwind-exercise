import { NextFunction, Request, Response } from "express";
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

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Authorization token is required." });
  }

  const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
