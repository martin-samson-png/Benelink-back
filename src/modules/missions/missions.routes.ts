import { Router } from "express";
import { MissionsController } from "./missions.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const missionsRoutes = (
  missionsController: MissionsController
): Router => {
  const router = Router();

  router.post("/create", checkAuth, (req, res, next) =>
    missionsController.createMission(req, res, next)
  );
  router.get("/association/:associationId", (req, res, next) =>
    missionsController.getMissionByAssociationId(req, res, next)
  );
  router.get("/:id", (req, res, next) =>
    missionsController.getMissionById(req, res, next)
  );
  router.get("/me/:associationId", checkAuth, (req, res, next) =>
    missionsController.getMissionByCreator(req, res, next)
  );
  router.get("/", (req, res, next) =>
    missionsController.getAllMissions(req, res, next)
  );
  router.patch("/update", checkAuth, (req, res, next) =>
    missionsController.updateMission(req, res, next)
  );
  router.delete("/delete", checkAuth, (req, res, next) =>
    missionsController.deleteMission(req, res, next)
  );
  return router;
};
