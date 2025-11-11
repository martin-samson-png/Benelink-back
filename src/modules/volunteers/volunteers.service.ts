import crypto from "node:crypto";
import { VolunteersRepository } from "./volunteers.repository";
import { RolesService } from "../roles/roles.services";
import { SkillsService } from "../skills/skills.service";
import { CreateVolunteerDTO } from "./dto/create-volunteer.dto";
import DataNotFoundException from "../../exceptions/data.not.found";
import ArgumentRequiredException from "../../exceptions/argument.required";
import DataAlreadyExistException from "../../exceptions/data.already.exists";

export class VolunteersService {
  constructor(
    private readonly volunteersRepository: VolunteersRepository,
    private readonly rolesService: RolesService,
    private readonly skillsService: SkillsService
  ) {}

  async getVolunteerById(volunteerId: string) {
    if (!volunteerId) throw new ArgumentRequiredException("Id manquante");

    return await this.volunteersRepository.getVolunteerById(volunteerId);
  }

  async getVolunteerByUserId(userId: string) {
    return await this.volunteersRepository.getVolunteerByUserId(userId);
  }

  async getAllVolunteers() {
    return await this.volunteersRepository.getAllVolunteers();
  }

  async createVolunteer(data: CreateVolunteerDTO) {
    const { city, skills, userId } = data;

    if (!city || !skills?.length || !userId)
      throw new ArgumentRequiredException("Champs obligatoires manquants");

    const existingVolunteer = await this.getVolunteerByUserId(userId);
    if (existingVolunteer)
      throw new DataAlreadyExistException("Bénévole déjà existant");

    const roleId = await this.rolesService.getRoleIdByName("volunteer");
    if (!roleId)
      throw new DataNotFoundException("Rôle 'volunteer' introuvable");

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
    const volunteerId = crypto.randomUUID();

    await this.volunteersRepository.createVolunteer({
      volunteerId,
      userId,
      city,
      skillsId,
      roleId,
    });

    return {
      message: "Bénévole créé avec succès",
      volunteerId,
      city,
      skills: skillsNames,
    };
  }

  async updateVolunteer(city: string, skills: string[], userId: string) {
    const volunteer = await this.getVolunteerByUserId(userId);
    if (!volunteer) throw new DataNotFoundException("Bénévole introuvable");

    let skillsId: number[] | null = null;
    let skillsNames: string[] | null = null;

    if (skills) {
      if (
        !Array.isArray(skills) ||
        skills.some((skill) => typeof skill !== "string")
      )
        throw new ArgumentRequiredException(
          "Toutes les compétences doivent être des chaînes de caractères"
        );

      const skillRows = await this.skillsService.getSkillsIdByNames(skills);
      console.log("skillrows:", skillRows);

      if (!skillRows)
        throw new DataNotFoundException("Aucune compétence valide trouvée");

      skillsNames = skillRows.map((row) => row.name);
      console.log("skillsNames:", skillsNames);

      const missingSkills = skills.filter(
        (skill) => !skillsNames!.includes(skill)
      );
      console.log("missingSkills:", missingSkills);

      if (missingSkills.length > 0)
        throw new DataNotFoundException(
          `Compétences introuvables : ${missingSkills.join(", ")}`
        );
      skillsId = skillRows.map((row) => row.id);
    }
    await this.volunteersRepository.updateVolunteer(
      volunteer.id,
      city,
      skillsId
    );
    return { id: volunteer.id, city, skills: skillsNames };
  }

  async deleteVolunteerByUserId(userId: string) {
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
