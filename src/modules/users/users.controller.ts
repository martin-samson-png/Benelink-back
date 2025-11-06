import { NextFunction, Request, Response } from "express";
import { UsersService } from "./users.service";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      await this.usersService.createUser(data);
      res.status(201).json({ message: "Utilisateur créé" });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });

      await this.usersService.updateUser(data, userId);
      res.status(200).json({ message: "Utilisateur modifié" });
    } catch (err) {
      next(err);
    }
  }

  async deleteUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });

      await this.usersService.deleteUserById(userId);
      res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (err) {
      next(err);
    }
  }
}
