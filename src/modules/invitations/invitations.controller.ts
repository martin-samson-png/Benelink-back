import { Request, Response, NextFunction } from "express";
import { InvitationsService } from "./invitations.service";

export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  async createInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const associationId = req.params.id;
      const { email } = req.body;
      const userId = req.user!.id;
      const invitation = await this.invitationsService.createInvitation({
        email,
        associationId,
        createdBy: userId,
      });
      res.status(201).json(invitation);
    } catch (err) {
      next(err);
    }
  }

  async acceptInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const userId = req.user!.id;

      const accept = await this.invitationsService.acceptInvitation({
        token,
        userId,
      });
      res.status(200).json(accept);
    } catch (err) {
      next(err);
    }
  }
}
