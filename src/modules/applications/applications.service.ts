import ArgumentRequiredException from "../../exceptions/argument.required";
import DataNotFoundException from "../../exceptions/data.not.found";
import ForbiddenException from "../../exceptions/forbidden";
import { MissionsService } from "../missions/missions.service";
import { UsersService } from "../users/users.service";
import { ApplicationsRepository } from "./applications.repository";

export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly usersService: UsersService,
    private readonly missionsService: MissionsService
  ) {}

  async getApplicationById(applicationId: string) {
    if (!applicationId)
      throw new ArgumentRequiredException("ApplicationId manquant");

    const application = await this.applicationsRepository.getApplicationById(
      applicationId
    );
    if (!application)
      throw new DataNotFoundException("Candidature introuvable");

    return application;
  }

  async getApplicationByUserId(userId: string) {
    const application =
      await this.applicationsRepository.getApplicationByUserId(userId);
    if (!application)
      throw new DataNotFoundException("Candidature introuvable");
    return application;
  }

  async getApplicationByMissionId(missionId: string) {
    if (!missionId) throw new ArgumentRequiredException("MissionId manquant");

    const application =
      await this.applicationsRepository.getApplicationByMissionId(missionId);
    if (!application)
      throw new DataNotFoundException("Candidature introuvable");
    return application;
  }

  async getAllApplication() {
    return await this.applicationsRepository.getAllApplication();
  }

  async createApplication(userId: string, missionId: string) {
    if (!missionId) throw new ArgumentRequiredException("MissionId manquant");

    const user = await this.usersService.findById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const mission = await this.missionsService.getMissionById(missionId);
    if (!mission) throw new DataNotFoundException("Mission introuvable");

    const isApplicationExist =
      await this.applicationsRepository.checkApplicationIsUnique(
        userId,
        missionId
      );
    if (isApplicationExist)
      throw new ForbiddenException("Vous avez déjà postulé a cette mission");

    const result = await this.applicationsRepository.createApplication(
      userId,
      missionId
    );

    const application = await this.getApplicationById(result.toString());

    return application;
  }

  async updateApplication(status: "accept" | "reject", applicationId: string) {
    if (!status || !applicationId)
      throw new ArgumentRequiredException("Champs manquants");

    const isApplicationExist = await this.getApplicationById(applicationId);
    if (!isApplicationExist)
      throw new DataNotFoundException("Candidature introuvable");

    const result = await this.applicationsRepository.updateApplication(
      status,
      applicationId
    );

    const application = await this.getApplicationById(result.toString());
    return application;
  }

  async deleteApplication(userId: string, applicationId: string) {
    if (!applicationId)
      throw new ArgumentRequiredException("ApplicationId manquant");
    const application = await this.getApplicationById(applicationId);
    if (!application)
      throw new DataNotFoundException("Candidature introuvable");
    if (application[0].userId !== userId)
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour supprimer cette candidature"
      );
    return await this.applicationsRepository.deleteApplication(applicationId);
  }
}
