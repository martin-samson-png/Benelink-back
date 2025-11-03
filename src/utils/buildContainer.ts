import { getPool } from "../config/db";
import { UserRepository } from "../repository/users.repository";
import { VolunteersRepository } from "../repository/volunteers.repository";
import { UserService } from "../services/users.service";
import { VolunteersService } from "../services/volunteers.service";
import { UserController } from "../controllers/users.controller";
import { VolunteersController } from "../controllers/volunteers.controller";
import { Pool } from "mysql2/promise";

export const buildContainer = () => {
  const pool: Pool = getPool();

  const userRepository = new UserRepository(pool);
  const volunteersRepository = new VolunteersRepository(pool);

  const userService = new UserService(userRepository, pool);
  const volunteersService = new VolunteersService(volunteersRepository, pool);

  const userController = new UserController(userService);
  const volunteersController = new VolunteersController(volunteersService);

  return { userController, volunteersController };
};
