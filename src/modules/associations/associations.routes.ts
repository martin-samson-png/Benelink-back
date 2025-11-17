import { Router } from "express";
import { AssociationsController } from "./associations.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const AssociationsRouter = (
  associationsController: AssociationsController
): Router => {
  const router = Router();

  router.get("/", (req, res, next) =>
    associationsController.getAllAssociations(req, res, next)
  );

  router.get("/:id", (req, res, next) =>
    associationsController.getAssociationById(req, res, next)
  );

  router.post("/", checkAuth, (req, res, next) =>
    associationsController.createAssociation(req, res, next)
  );

  router.patch("/update", checkAuth, (req, res, next) =>
    associationsController.updateAssociation(req, res, next)
  );

  router.delete("/delete", checkAuth, (req, res, next) =>
    associationsController.deleteAssociation(req, res, next)
  );

  return router;
};
