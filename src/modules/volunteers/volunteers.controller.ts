import { Request, Response } from "express";
import { VolunteersService } from "./volunteers.service";

export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  async createVolunteer(req: Request, res: Response) {
    const city = req.body.city;
    const skills = req.body.skills;
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Utilisateur non authentifié" });

    const data = { city, skills, userId };
    try {
      const newVolunteer = await this.volunteersService.createVolunteer(data);
      res.status(201).json(newVolunteer);
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }
}
