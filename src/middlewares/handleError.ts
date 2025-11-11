import { NextFunction, Request, Response } from "express";

export const handleError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (err.name) {
    case "ArgumentRequiredException":
      return res.status(400).json({ status: 400, error: err.message });
    case "UnauthorizedException":
      return res.status(401).json({ status: 401, error: err.message });
    case "ForbiddenException":
      return res.status(403).json({ status: 403, error: err.message });
    case "DataNotFoundException":
      return res.status(404).json({ status: 404, error: err.message });
    case "DataAlreadyExistException":
      return res.status(409).json({ status: 409, error: err.message });
    case "TooManyRequestsException":
      return res.status(429).json({ status: 429, error: err.message });
    case "InternalServerException":
      return res.status(500).json({
        status: 500,
        error: err.message || "Erreur de base de données",
      });
    default:
      return res
        .status(500)
        .json({ status: 500, error: "Une erreur inattendue s'est produite" });
  }
};
