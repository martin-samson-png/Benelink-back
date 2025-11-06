import { AssociationsService } from "./associations.service";
import { Request, Response } from "express";

export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  async createAssociation(req: Request, res: Response) {
    try {
      const {
        asso_name,
        rna,
        descr,
        website_url,
        social_link,
        contact_email,
        city,
      } = req.body;
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      const data = {
        userId,
        asso_name,
        rna,
        descr,
        website_url,
        social_link,
        contact_email,
        city,
      };
      await this.associationsService.createAssociation(data);
      res.status(201).json({ message: "Association créé" });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }

  async createInvitation(req: Request, res: Response) {
    try {
      const { email, associationId } = req.body;
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      await this.associationsService.createInviation(
        email,
        associationId,
        userId
      );
      res.status(201).json({ message: "Invitation créé" });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }
}
