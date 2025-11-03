import { Request, Response } from "express";
import { UserService } from "../services/users.service";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async register(req: Request, res: Response) {
    try {
      const user = req.body;
      await this.userService.register(user);
      res.status(201).json({ message: "Utilisateur créé" });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { token, user } = await this.userService.login({
        email,
        password,
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(Date.now() + 3600000),
      });
      res.status(200).json(user);
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }

  async authentification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.cookie("token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        expires: new Date(0),
      });
      res.status(200).json({ message: "Deconnexion réussie" });
    } catch {
      res.json({ message: "Erreur lors de la deconnexion" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      await this.userService.resetPassword({ token, password });
      res.status(200).json({ message: "Mot de passe réinitialisé" });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }

  async saveResetToken(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await this.userService.saveResetToken(email);
      res.status(200).json({ message: "Email envoyé" });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }

  async deleteUserById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      await this.userService.deleteUserById(userId);
      res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }
}
