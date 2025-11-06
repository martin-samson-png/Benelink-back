import { Pool } from "mysql2/promise";
import { getPool } from "../config/db";
import { AuthRepository } from "../modules/auth/auth.repository";
import { UsersRepository } from "../modules/users/users.repository";
import { VolunteersRepository } from "../modules/volunteers/volunteers.repository";
import { AssociationsRepository } from "../modules/associations/associations.repository";
import { RolesRepository } from "../modules/roles/roles.repository";
import { SkillsRepository } from "../modules/skills/skills.repository";
import { AuthService } from "../modules/auth/auth.service";
import { UsersService } from "../modules/users/users.service";
import { VolunteersService } from "../modules/volunteers/volunteers.service";
import { AssociationsService } from "../modules/associations/associations.service";
import { RolesService } from "../modules/roles/roles.services";
import { SkillsService } from "../modules/skills/skills.service";
import { AuthController } from "../modules/auth/auth.controller";
import { UsersController } from "../modules/users/users.controller";
import { VolunteersController } from "../modules/volunteers/volunteers.controller";
import { AssociationsController } from "../modules/associations/associations.controller";

export const buildContainer = () => {
  const pool: Pool = getPool();

  const authRepository = new AuthRepository(pool);
  const usersRepository = new UsersRepository(pool);
  const volunteersRepository = new VolunteersRepository(pool);
  const associationsRepository = new AssociationsRepository(pool);
  const rolesRepository = new RolesRepository(pool);
  const skillsRepository = new SkillsRepository(pool);

  const rolesService = new RolesService(rolesRepository);
  const skillsService = new SkillsService(skillsRepository);
  const userService = new UsersService(usersRepository, rolesService);
  const authService = new AuthService(
    authRepository,
    userService,
    rolesService
  );
  const volunteersService = new VolunteersService(
    volunteersRepository,
    rolesService,
    skillsService
  );
  const associationsService = new AssociationsService(
    associationsRepository,
    rolesService,
    userService
  );

  const authController = new AuthController(authService);
  const userController = new UsersController(userService);
  const volunteersController = new VolunteersController(volunteersService);
  const assoicaitonsController = new AssociationsController(
    associationsService
  );

  return {
    userController,
    volunteersController,
    assoicaitonsController,
    authController,
  };
};
