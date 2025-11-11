import { Request, Response, NextFunction } from "express";
import { InvitationsService } from "./invitations.service";

export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  async createInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const associationId = req.params.id;
      const { email } = req.body;
      const userId = req.user!.id;
      const invitation = await this.invitationsService.createInviation({
        email,
        associationId,
        createdBy: userId,
      });
      res.status(201).json(invitation);
    } catch (err) {
      next(err);
    }
  }
}
