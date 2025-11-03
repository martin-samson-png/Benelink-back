import { Router } from "express";
import { VolunteersController } from "../controllers/volunteers.controller";
import { checkAuth } from "../middlewares/checkAuth";

export const volunteersRoutes = (
  volunteersController: VolunteersController
): Router => {
  const router = Router();

  router.post("/", checkAuth, (req, res) =>
    volunteersController.createVolunteer(req, res)
  );

  return router;
};
