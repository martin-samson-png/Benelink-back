import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = await this.authService.register(data);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, user } = await this.authService.login(req.body);

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

  async getAuthentificated(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await this.authService.getAuthentificated(userId);
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
      res.status(200).json({ message: "Déconnexion réussie" });
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
      res
        .status(200)
        .json({
          message:
            "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
        });
    } catch (err) {
      next(err);
    }
  }
}
