import { Pool } from "mysql2/promise";
import { getPool } from "../config/db";
import { AuthRepository } from "../modules/auth/auth.repository";
import { UsersRepository } from "../modules/users/users.repository";
import { VolunteersRepository } from "../modules/volunteers/volunteers.repository";
import { AssociationsRepository } from "../modules/associations/associations.repository";
import { RolesRepository } from "../modules/roles/roles.repository";
import { SkillsRepository } from "../modules/skills/skills.repository";
import { InvitationsRepository } from "../modules/invitations/invitations.repository";
import { MissionsRepository } from "../modules/missions/missions.repository";
import { AuthService } from "../modules/auth/auth.service";
import { UsersService } from "../modules/users/users.service";
import { VolunteersService } from "../modules/volunteers/volunteers.service";
import { AssociationsService } from "../modules/associations/associations.service";
import { RolesService } from "../modules/roles/roles.services";
import { SkillsService } from "../modules/skills/skills.service";
import { InvitationsService } from "../modules/invitations/invitations.service";
import { MissionsService } from "../modules/missions/missions.service";
import { AuthController } from "../modules/auth/auth.controller";
import { UsersController } from "../modules/users/users.controller";
import { VolunteersController } from "../modules/volunteers/volunteers.controller";
import { AssociationsController } from "../modules/associations/associations.controller";
import { InvitationsController } from "./../modules/invitations/invitations.controller";
import { MissionsController } from "../modules/missions/missions.controller";
import { ApplicationsRepository } from "../modules/applications/applications.repository";
import { ApplicationsService } from "../modules/applications/applications.service";
import { ApplicationsController } from "../modules/applications/applications.controller";

export const buildContainer = () => {
  const pool: Pool = getPool();

  const authRepository = new AuthRepository(pool);
  const usersRepository = new UsersRepository(pool);
  const volunteersRepository = new VolunteersRepository(pool);
  const associationsRepository = new AssociationsRepository(pool);
  const rolesRepository = new RolesRepository(pool);
  const skillsRepository = new SkillsRepository(pool);
  const invitationsRepository = new InvitationsRepository(pool);
  const missionsRepository = new MissionsRepository(pool);
  const applicationsRepository = new ApplicationsRepository(pool);

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
  const invitationsService = new InvitationsService(
    invitationsRepository,
    userService,
    associationsService,
    rolesService
  );
  const missionsService = new MissionsService(
    missionsRepository,
    associationsService,
    userService
  );
  const applicationsService = new ApplicationsService(
    applicationsRepository,
    userService,
    missionsService
  );

  const authController = new AuthController(authService);
  const userController = new UsersController(userService);
  const volunteersController = new VolunteersController(volunteersService);
  const associationsController = new AssociationsController(
    associationsService
  );
  const invitationsController = new InvitationsController(invitationsService);
  const missionsController = new MissionsController(missionsService);
  const applicationsController = new ApplicationsController(
    applicationsService
  );

  return {
    userController,
    volunteersController,
    associationsController,
    authController,
    invitationsController,
    missionsController,
    applicationsController,
  };
};
