import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const authRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post("/register", (req, res, next) =>
    authController.register(req, res, next)
  );
  router.post("/login", (req, res, next) =>
    authController.login(req, res, next)
  );
  router.post("/logout", (req, res, next) =>
    authController.logout(req, res, next)
  );
  router.get("/me", checkAuth, (req, res, next) =>
    authController.authentification(req, res, next)
  );

  router.put("/reset-password", (req, res, next) =>
    authController.resetPassword(req, res, next)
  );
  router.put("/request-reset", (req, res, next) =>
    authController.saveResetToken(req, res, next)
  );
  return router;
};
