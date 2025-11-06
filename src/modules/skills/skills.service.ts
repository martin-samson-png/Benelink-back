import { SkillsRepository } from "./skills.repository";

export class SkillsService {
  constructor(private readonly skillsRepository: SkillsRepository) {}

  async getSkillIdByName(skillName: string): Promise<number | null> {
    if (!skillName) throw new Error("Le nom de la compétence est requis.");

    const skillId = await this.skillsRepository.getSkillIdByName(skillName);
    if (!skillId) return null;

    return skillId;
  }
}
