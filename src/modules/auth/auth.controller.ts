import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body;
      await this.authService.register(user);
      res.status(201).json({ message: "Utilisateur créé" });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { token, user } = await this.authService.login({ email, password });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(Date.now() + 3600000),
      });
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async authentification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      const user = await this.authService.getAuthenticatedUser(userId);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie("token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        expires: new Date(0),
      });
      res.status(200).json({ message: "Deconnexion réussie" });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword({ token, password });
      res.status(200).json({ message: "Mot de passe réinitialisé" });
    } catch (err) {
      next(err);
    }
  }

  async saveResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await this.authService.saveResetToken(email);
      res.status(200).json({ message: "Email envoyé" });
    } catch (err) {
      next(err);
    }
  }
}
