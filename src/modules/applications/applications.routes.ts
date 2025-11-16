import { Router } from "express";
import { ApplicationsController } from "./applications.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const applicationRoutes = (
  applicationsController: ApplicationsController
): Router => {
  const router = Router();

  router.get("/", (req, res, next) =>
    applicationsController.getAllApplication(req, res, next)
  );
  router.get("/me", checkAuth, (req, res, next) =>
    applicationsController.getApplicationByUserId(req, res, next)
  );
  router.get("/mission/:missionId", checkAuth, (req, res, next) =>
    applicationsController.getApplicationByMissionId(req, res, next)
  );
  router.get("/:applicationId", (req, res, next) =>
    applicationsController.getApplicationById(req, res, next)
  );
  router.post("/create", checkAuth, (req, res, next) =>
    applicationsController.createApplication(req, res, next)
  );
  router.patch("/update", (req, res, next) =>
    applicationsController.updateApplication(req, res, next)
  );
  router.delete("/delete", checkAuth, (req, res, next) =>
    applicationsController.deleteApplication(req, res, next)
  );

  return router;
};
