import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JwtUserPayload } from "../types/auth";
import ForbiddenException from "../exceptions/forbidden";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) throw new ForbiddenException("Accès refusé");

  try {
    const decrypted = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtUserPayload;

    req.user = decrypted;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide" });
  }
};
