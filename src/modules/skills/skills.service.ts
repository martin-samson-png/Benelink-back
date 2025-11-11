import { SkillsRepository } from "./skills.repository";

export class SkillsService {
  constructor(private readonly skillsRepository: SkillsRepository) {}

  async getSkillsIdByNames(
    skillName: string[]
  ): Promise<{ id: number; name: string }[] | null> {
    if (!skillName) throw new Error("Le nom de la compétence est requis.");

    const skillId = await this.skillsRepository.getSkillsIdByNames(skillName);
    if (!skillId) return null;

    return skillId;
  }
}
