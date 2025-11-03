import { Router } from "express";
import { UserController } from "../controllers/users.controller";
import { checkAuth } from "../middlewares/checkAuth";

export const userRoutes = (userController: UserController): Router => {
  const router = Router();

  router.post("/register", (req, res) => userController.register(req, res));
  router.post("/login", (req, res) => userController.login(req, res));
  router.get("/auth", checkAuth, (req, res) => {
    userController.authentification(req, res);
  });
  router.put("/reset-password", (req, res) =>
    userController.resetPassword(req, res)
  );
  router.put("/request-reset", (req, res) =>
    userController.saveResetToken(req, res)
  );

  return router;
};
