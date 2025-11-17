import crypto from "node:crypto";
import { VolunteersRepository } from "./volunteers.repository";
import { RolesService } from "../roles/roles.services";
import { SkillsService } from "../skills/skills.service";
import { CreateVolunteerDTO } from "./dto/create-volunteer.dto";
import DataNotFoundException from "../../exceptions/data.not.found";
import ArgumentRequiredException from "../../exceptions/argument.required";
import DataAlreadyExistException from "../../exceptions/data.already.exists";
import { Volunteer } from "../../models/volunteer.model";
import { UpdateVolunteerDTO } from "./dto/update-volunteer.dto";
import { UpdateVolunteerRepositoryDTO } from "./dto/update-volunteer-repository.dto";

export class VolunteersService {
  constructor(
    private readonly volunteersRepository: VolunteersRepository,
    private readonly rolesService: RolesService,
    private readonly skillsService: SkillsService
  ) {}

  async getVolunteerById(volunteerId: string): Promise<Volunteer> {
    if (!volunteerId)
      throw new ArgumentRequiredException("VolunteerId manquant");

    const volunteer = await this.volunteersRepository.getVolunteerById(
      volunteerId
    );
    if (!volunteer) throw new DataNotFoundException("Bénévole introuvable");
    return volunteer;
  }

  async getVolunteerByUserId(userId: string): Promise<Volunteer> {
    const volunteer = await this.volunteersRepository.getVolunteerByUserId(
      userId
    );
    if (!volunteer) throw new DataNotFoundException("Bénévole introuvable");
    return volunteer;
  }

  async getAllVolunteers() {
    return await this.volunteersRepository.getAllVolunteers();
  }

  async createVolunteer(data: CreateVolunteerDTO): Promise<Volunteer> {
    const { city, skills, userId } = data;

    if (!city || !skills?.length || !userId)
      throw new ArgumentRequiredException("Champs obligatoires manquants");

    const existingVolunteer =
      await this.volunteersRepository.getVolunteerByUserId(userId);
    if (existingVolunteer)
      throw new DataAlreadyExistException("Bénévole déjà existant");

    const roleId = await this.rolesService.getRoleIdByName("volunteer");
    if (
      !Array.isArray(skills) ||
      skills.some((skill) => typeof skill !== "string")
    )
      throw new ArgumentRequiredException(
        "Toutes les compétences doivent être des chaînes de caractères"
      );

    const skillRows = await this.skillsService.getSkillsIdByNames(skills);
    if (!skillRows)
      throw new DataNotFoundException("Aucune compétence valide trouvée");

    const skillsNames = skillRows.map((row) => row.name);
    const missingSkills = skills.filter(
      (skill) => !skillsNames.includes(skill)
    );

    if (missingSkills.length > 0)
      throw new DataNotFoundException(
        `Compétences introuvables : ${missingSkills.join(", ")}`
      );

    const skillsId = skillRows.map((row) => row.id);
    const id = crypto.randomUUID();

    return await this.volunteersRepository.createVolunteer({
      id,
      userId,
      city,
      skillsId,
      roleId,
    });
  }

  async updateVolunteer(data: UpdateVolunteerDTO & { userId: string }) {
    const { userId, ...fields } = data;

    if (!fields.city && !fields.skills)
      throw new ArgumentRequiredException("Aucun champ valide à mettre à jour");

    const currentVolunteer = await this.getVolunteerByUserId(userId);

    if (!currentVolunteer)
      throw new DataNotFoundException("Bénévole introuvable");

    const updatePayload: UpdateVolunteerRepositoryDTO = {};

    if (fields.city && fields.city !== currentVolunteer.city)
      updatePayload.city = fields.city;

    if (fields.skills && fields.skills.length > 0) {
      const oldNames = [...currentVolunteer.skills].sort();
      const newNames = [...fields.skills].sort();

      const isSameSkills =
        oldNames.length == newNames.length &&
        oldNames.every((name, i) => name === newNames[i]);

      if (!isSameSkills) {
        const skillRows = await this.skillsService.getSkillsIdByNames(
          fields.skills
        );
        if (!skillRows)
          throw new DataNotFoundException("Aucune compétence valide trouvée");

        const skillsNames = skillRows.map((r) => r.name);

        const missingSkills = fields.skills.filter(
          (s) => !skillsNames.includes(s)
        );

        if (missingSkills.length > 0)
          throw new DataNotFoundException(
            `Compétences introuvables : ${missingSkills.join(", ")}`
          );
        updatePayload.skillsId = skillRows.map((row) => row.id);
      }
    }
    if (Object.keys(updatePayload).length === 0)
      throw new ArgumentRequiredException("Aucun champ à mettre à jour");
    return await this.volunteersRepository.updateVolunteer({
      ...updatePayload,
      volunteerId: currentVolunteer.id,
    });
  }

  async deleteVolunteerByUserId(userId: string): Promise<{ ok: true }> {
    const volunteer = await this.getVolunteerByUserId(userId);
    if (!volunteer) throw new DataNotFoundException("Bénévole introuvable");

    const roleId = await this.rolesService.getRoleIdByName("volunteer");
    if (!roleId)
      throw new DataNotFoundException("Rôle 'volunteer' introuvable");

    return await this.volunteersRepository.deleteVolunteerByUserId(
      userId,
      roleId
    );
  }
}
