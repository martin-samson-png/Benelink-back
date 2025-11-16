import { Router } from "express";
import { UsersController } from "./users.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const userRoutes = (usersController: UsersController): Router => {
  const router = Router();

  router.post("/create-admin", (req, res, next) =>
    usersController.createUser(req, res, next)
  );
  router.get("/:id", (req, res, next) =>
    usersController.getUserById(req, res, next)
  );
  router.get("/", (req, res, next) =>
    usersController.getAllUsers(req, res, next)
  );

  router.patch("/update/password", checkAuth, (req, res, next) =>
    usersController.updatePassword(req, res, next)
  );

  router.patch("/update/fields", checkAuth, (req, res, next) =>
    usersController.updateFields(req, res, next)
  );

  router.delete("/delete", checkAuth, (req, res, next) =>
    usersController.deleteUserById(req, res, next)
  );

  return router;
};
