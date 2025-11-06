import { Request, Response } from "express";
import { UserService } from "./users.service";

export class UserController {
  constructor(private readonly userService: UserService) {}

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
