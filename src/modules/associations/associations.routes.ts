import { Router } from "express";
import { AssociationsController } from "./associations.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const AssociationsRouter = (
  associationsController: AssociationsController
): Router => {
  const router = Router();

  router.post("/asso", checkAuth, (req, res) =>
    associationsController.createAssociation(req, res)
  );
  router.post("/invitation", checkAuth, (req, res) =>
    associationsController.createInvitation(req, res)
  );

  return router;
};
