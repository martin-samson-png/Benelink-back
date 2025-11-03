import { Pool } from "mysql2/promise";
import { Volunteer } from "../models/volunteers.model";
import { VolunteersRepository } from "./../repository/volunteers.repository";
import crypto from "node:crypto";
import { getRoleIdByName } from "../utils/roles.utils";
import { getSkillIdByName } from "../utils/skills.utils";

export class VolunteersService {
  constructor(
    private readonly volunteersRepository: VolunteersRepository,
    private readonly pool: Pool
  ) {}

  async createVolunteer(
    data: Omit<
      Volunteer,
      "id" | "experience" | "createdAt" | "updatedAt" | "rate"
    >
  ) {
    if (!data.city || !data.skills || !data.userId)
      throw new Error("Champs obligatoire manquante");

    const isVolunteerExisting =
      await this.volunteersRepository.getVolunteerByUserId(data.userId);
    if (isVolunteerExisting) throw new Error("Bénévoles déjà existant");

    const volunteerId = crypto.randomUUID();
    const roleId = await getRoleIdByName(this.pool, "volunteer");
    if (!roleId) throw new Error("Role 'volunteer' introuvable");

    const arrSkillsId = await Promise.all(
      data.skills.map(async (skill) => {
        if (typeof skill !== "string")
          throw new Error(
            `Compétence invalide (${JSON.stringify(
              skill
            )}). Une chaîne de caractères est attendue.`
          );

        const skillId = await getSkillIdByName(this.pool, skill);

        if (!skillId) throw new Error(`Skill "${skill}" introuvable`);

        return skillId;
      })
    );

    await this.volunteersRepository.createVolunteer({
      id: volunteerId,
      userId: data.userId,
      city: data.city,
      skills_id: arrSkillsId,
      role_id: roleId,
    });

    return { ok: true };
  }
}
