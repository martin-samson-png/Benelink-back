import { Router } from "express";
import { InvitationsController } from "./invitations.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const inviationRoutes = (
  invitationsController: InvitationsController
): Router => {
  const router = Router();

  router.post("/:id", checkAuth, (req, res, next) =>
    invitationsController.createInvitation(req, res, next)
  );

  router.post("/accept/:token", checkAuth, (req, res, next) =>
    invitationsController.acceptInvitation(req, res, next)
  );

  return router;
};
