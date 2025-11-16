import { NextFunction, Request, Response } from "express";
import { ApplicationsService } from "./applications.service";

export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      console.log(applicationId);

      const application = await this.applicationsService.getApplicationById(
        applicationId
      );
      res.status(200).json(application);
    } catch (err) {
      next(err);
    }
  }

  async getApplicationByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.id;
      const application = await this.applicationsService.getApplicationByUserId(
        userId
      );
      res.status(201).json(application);
    } catch (err) {
      next(err);
    }
  }

  async getApplicationByMissionId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { missionId } = req.params;

      const application =
        await this.applicationsService.getApplicationByMissionId(missionId);
      res.status(200).json(application);
    } catch (err) {
      next(err);
    }
  }

  async getAllApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await this.applicationsService.getAllApplication();

      res.status(200).json(applications);
    } catch (err) {
      next(err);
    }
  }

  async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.body;
      const userId = req.user!.id;
      const application = await this.applicationsService.createApplication(
        userId,
        missionId
      );
      res.status(201).json(application);
    } catch (err) {
      next(err);
    }
  }

  async updateApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, applicationId } = req.body;
      const application = await this.applicationsService.updateApplication(
        status,
        applicationId
      );
      res.status(200).json(application);
    } catch (err) {
      next(err);
    }
  }

  async deleteApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.body;
      const userId = req.user!.id;
      await this.applicationsService.deleteApplication(userId, applicationId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}
