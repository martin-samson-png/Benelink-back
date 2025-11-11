import { NextFunction, Request, Response } from "express";
import { VolunteersService } from "./volunteers.service";

export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  async getVolunteerById(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteerId = req.params.id;
      const volunteer = await this.volunteersService.getVolunteerById(
        volunteerId
      );
      res.status(200).json(volunteer);
    } catch (err) {
      next(err);
    }
  }

  async getVolunteerByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });

      const volunteer = await this.volunteersService.getVolunteerByUserId(
        userId
      );
      res.status(200).json(volunteer);
    } catch (err) {
      next(err);
    }
  }

  async getAllVolunteers(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteers = await this.volunteersService.getAllVolunteers();
      res.status(200).json(volunteers);
    } catch (err) {
      next(err);
    }
  }

  async createVolunteer(req: Request, res: Response, next: NextFunction) {
    try {
      const city = req.body.city;
      const skills = req.body.skills;
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });

      const data = { city, skills, userId };

      const newVolunteer = await this.volunteersService.createVolunteer(data);
      res.status(201).json(newVolunteer);
    } catch (err) {
      next(err);
    }
  }

  async updateVolunteer(req: Request, res: Response, next: NextFunction) {
    try {
      const { city, skills } = req.body;
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });

      const volunteer = await this.volunteersService.updateVolunteer(
        city,
        skills,
        userId
      );

      res.status(200).json(volunteer);
    } catch (err) {
      next(err);
    }
  }

  async deleteVolunteer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });

      await this.volunteersService.deleteVolunteerByUserId(userId);
      res.status(200).json({ message: "Bénévole supprimé" });
    } catch (err) {
      next(err);
    }
  }
}
