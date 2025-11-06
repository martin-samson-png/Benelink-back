import { Pool, RowDataPacket } from "mysql2/promise";

export class SkillsRepository {
  constructor(private readonly pool: Pool) {}

  async getSkillIdByName(skillName: string): Promise<number | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[] & { id: number }[]>(
        `SELECT id FROM skills WHERE name = ?`,
        [skillName]
      );

      const id = rows[0]?.id ?? null;
      return id;
    } catch {
      throw new Error("Erreur lors de la récupération des compétences.");
    }
  }
}
