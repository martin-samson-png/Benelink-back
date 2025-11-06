import { Router } from "express";
import { UserController } from "./users.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const userRoutes = (userController: UserController): Router => {
  const router = Router();

  router.delete("/", checkAuth, (req, res) =>
    userController.deleteUserById(req, res)
  );

  return router;
};
