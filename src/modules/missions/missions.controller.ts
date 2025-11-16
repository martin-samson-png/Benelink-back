import { NextFunction, Request, Response } from "express";
import { MissionsService } from "./missions.service";

export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  async getMissionByAssociationId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { associationId } = req.params;
      const missions = await this.missionsService.getMissionByAssociationId(
        associationId
      );
      res.status(200).json(missions);
    } catch (err) {
      next(err);
    }
  }

  async getMissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mission = await this.missionsService.getMissionById(id);
      res.status(200).json(mission);
    } catch (err) {
      next(err);
    }
  }

  async getMissionByCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const { associationId } = req.params;
      const userId = req.user!.id;
      const missions = await this.missionsService.getMissionByCreator(
        userId,
        associationId
      );
      res.status(200).json(missions);
    } catch (err) {
      next(err);
    }
  }

  async getAllMissions(req: Request, res: Response, next: NextFunction) {
    try {
      const missions = await this.missionsService.getAllMissions();
      res.status(200).json(missions);
    } catch (err) {
      next(err);
    }
  }

  async getBrowsing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { associationId } = req.params;
      const browsing = await this.missionsService.getBrowsing(
        userId,
        associationId
      );
      res.status(200).json(browsing);
    } catch (err) {
      next(err);
    }
  }

  async createMission(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = { createdBy: userId, ...req.body };
      const mission = await this.missionsService.createMission(data);
      res.status(201).json(mission);
    } catch (err) {
      next(err);
    }
  }

  async updateMission(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = { userId, ...req.body };
      const mission = await this.missionsService.updateMission(data);
      res.status(200).json(mission);
    } catch (err) {
      next(err);
    }
  }

  async deleteMission(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { missionId } = req.body;
      await this.missionsService.deleteMission(userId, missionId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}
