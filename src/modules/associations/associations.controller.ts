import { AssociationsService } from "./associations.service";
import { NextFunction, Request, Response } from "express";

export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  async getAssociationById(req: Request, res: Response, next: NextFunction) {
    try {
      const assoId = req.params.id;
      const association = await this.associationsService.getAssociationById(
        assoId
      );
      res.status(200).json(association);
    } catch (err) {
      next(err);
    }
  }

  async getAllAssociations(req: Request, res: Response, next: NextFunction) {
    try {
      const associations = await this.associationsService.getAllAssociations();
      res.status(200).json(associations);
    } catch (err) {
      next(err);
    }
  }

  async createAssociation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = {
        userId,
        ...req.body,
      };
      const association = await this.associationsService.createAssociation(
        data
      );
      res.status(201).json(association);
    } catch (err) {
      next(err);
    }
  }

  async updateAssociation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const data = { id, userId, ...req.body };
      const updated = await this.associationsService.updateAssociation(data);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteAssociation(req: Request, res: Response, next: NextFunction) {
    try {
      const associationId = req.params.id;
      const userId = req.user!.id;

      await this.associationsService.deleteAssociation(userId, associationId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}
