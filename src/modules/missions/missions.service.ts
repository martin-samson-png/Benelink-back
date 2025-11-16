import ArgumentRequiredException from "../../exceptions/argument.required";
import DataAlreadyExistException from "../../exceptions/data.already.exists";
import DataNotFoundException from "../../exceptions/data.not.found";
import { AssociationsService } from "../associations/associations.service";
import { CreateMissionDTO } from "./dto/create-mission.dto";
import { MissionsRepository } from "./missions.repository";
import { UsersService } from "../users/users.service";
import ForbiddenException from "../../exceptions/forbidden";
import { MissionWithDetailsDTO } from "./dto/mission-with-details.dto";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { UpdateMissionDTO } from "./dto/update-mission.dto";

export class MissionsService {
  constructor(
    private readonly missionsRepository: MissionsRepository,
    private readonly associationsService: AssociationsService,
    private readonly usersService: UsersService
  ) {}

  async getMissionByAssociationId(
    associationId: string
  ): Promise<MissionWithDetailsDTO[]> {
    if (!associationId)
      throw new ArgumentRequiredException("AssociationId manquant");
    const association = await this.associationsService.getAssociationById(
      associationId
    );
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    return await this.missionsRepository.getMissionByAssociationId(
      associationId
    );
  }

  async getMissionByCreator(
    userId: string,
    associationId: string
  ): Promise<MissionWithDetailsDTO[]> {
    if (!associationId)
      throw new ArgumentRequiredException("AssociationId manquant");

    const association = await this.associationsService.getAssociationById(
      associationId
    );
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    const user = await this.usersService.findById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    return await this.missionsRepository.getMissionByCreator(
      userId,
      associationId
    );
  }

  async getMissionById(missionId: string): Promise<MissionWithDetailsDTO> {
    if (!missionId) throw new ArgumentRequiredException("MissionId manquante");

    const mission = await this.missionsRepository.getMissionById(missionId);

    if (!mission) throw new DataNotFoundException("Mission introuvable");

    return mission;
  }

  async getAllMissions(): Promise<MissionWithDetailsDTO[]> {
    return await this.missionsRepository.getAllMissions();
  }

  async getBrowsing(
    userId: string,
    associationId: string
  ): Promise<MissionWithDetailsDTO[]> {
    if (!associationId)
      throw new ArgumentRequiredException("AssociationId manquant");

    const user = await this.usersService.findById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const association = await this.associationsService.getAssociationById(
      associationId
    );
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    await this.associationsService.findMemberInAssociation(
      userId,
      associationId
    );

    return await this.missionsRepository.getBrowsing(associationId);
  }

  async createMission(data: CreateMissionDTO): Promise<MissionWithDetailsDTO> {
    if (
      !data.associationId ||
      !data.title ||
      !data.startDate ||
      !data.endDate ||
      !data.city
    )
      throw new ArgumentRequiredException("Champs obligatoire manquant");

    const user = await this.usersService.findById(data.createdBy);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const association = await this.associationsService.getAssociationById(
      data.associationId
    );
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    const membership = await this.associationsService.findMemberInAssociation(
      data.createdBy,
      data.associationId
    );
    if (!["owner", "admin_asso"].includes(membership.role))
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour créer des missions"
      );
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate)
      throw new ArgumentRequiredException(
        "La date de début doit être ulterieur a la date de fin"
      );

    if (startDate < new Date())
      throw new ArgumentRequiredException(
        "La mission ne peut pas commencer dans le passé"
      );
    const { descr, ...fields } = data;
    const isMissionUnique = await this.missionsRepository.isMissionUnique({
      ...fields,
      startDate,
      endDate,
    });
    if (isMissionUnique)
      throw new DataAlreadyExistException("Missions déjà existante");

    const missionId = await this.missionsRepository.createMission({
      ...data,
      startDate,
      endDate,
    });

    const mission = await this.getMissionById(missionId.toString());
    if (!mission)
      throw new InternalServerException(
        "Impossible de récuperer la mission créée"
      );
    return mission;
  }

  async updateMission(
    data: UpdateMissionDTO & { userId: string }
  ): Promise<MissionWithDetailsDTO> {
    const { userId, missionId, ...fields } = data;
    if (!Object.keys(fields).length)
      throw new ArgumentRequiredException("Aucune donnée à mettre à jour");

    const oldMission = await this.getMissionById(data.missionId);
    if (!oldMission) throw new DataNotFoundException("Mission introuvable");

    const user = await this.usersService.findById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const membership = await this.associationsService.findMemberInAssociation(
      userId,
      oldMission.assoId
    );
    if (!["owner", "admin_asso"].includes(membership.role))
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour modifer des missions"
      );
    const finalStartDateRow = data.startDate ?? oldMission.startDate;
    const finalEndDateRow = data.endDate ?? oldMission.endDate;

    const finalStartDate = new Date(finalStartDateRow);
    const finalEndDate = new Date(finalEndDateRow);

    if (finalStartDate >= finalEndDate)
      throw new ArgumentRequiredException(
        "La date de début doit être ulterieur a la date de fin"
      );

    if (finalStartDate < new Date())
      throw new ArgumentRequiredException(
        "La mission ne peut pas commencer dans le passé"
      );

    await this.missionsRepository.updateMission({
      ...fields,
      missionId,
      startDate: finalStartDate,
      endDate: finalEndDate,
    });

    const mission = await this.missionsRepository.getMissionById(missionId);
    if (!mission)
      throw new InternalServerException(
        "Impossible de récuperer la mission mise à jour"
      );
    return mission;
  }

  async deleteMission(userId: string, missionId: string) {
    if (!missionId) throw new ArgumentRequiredException("MissionId manquante");

    const mission = await this.getMissionById(missionId);
    if (!mission) throw new DataNotFoundException("Mission introuvable");

    const user = await this.usersService.findById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const membership = await this.associationsService.findMemberInAssociation(
      userId,
      mission.assoId
    );
    if (!["owner", "admin_asso"].includes(membership.role))
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour supprimer des missions"
      );

    return await this.missionsRepository.deleteMission(missionId);
  }
}
