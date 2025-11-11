import { Pool } from "mysql2/promise";

export class SkillsRepository {
  constructor(private readonly pool: Pool) {}

  async getSkillsIdByNames(
    names: string[]
  ): Promise<{ id: number; name: string }[]> {
    const [rows] = await this.pool.query(
      `SELECT id, name FROM skills WHERE name IN (?)`,
      [names]
    );
    return rows as { id: number; name: string }[];
  }
}
