import { Router } from "express";
import { VolunteersController } from "./volunteers.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const volunteersRoutes = (
  volunteersController: VolunteersController
): Router => {
  const router = Router();

  router.post("/create", checkAuth, (req, res, next) =>
    volunteersController.createVolunteer(req, res, next)
  );

  router.get("/", (req, res, next) =>
    volunteersController.getAllVolunteers(req, res, next)
  );

  router.get("/me", checkAuth, (req, res, next) =>
    volunteersController.getVolunteerByUserId(req, res, next)
  );

  router.get("/:id", (req, res, next) =>
    volunteersController.getVolunteerById(req, res, next)
  );

  router.patch("/", checkAuth, (req, res, next) =>
    volunteersController.updateVolunteer(req, res, next)
  );

  router.delete("/", checkAuth, (req, res, next) =>
    volunteersController.deleteVolunteer(req, res, next)
  );

  return router;
};
