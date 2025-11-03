import { Pool } from "mysql2/promise";

let cachedSkills: Record<string, number> = {};

export const getSkillIdByName = async (
  pool: Pool,
  skillName: string
): Promise<number | null> => {
  if (cachedSkills[skillName]) return cachedSkills[skillName];

  const [rows] = await pool.query(`SELECT id FROM skills WHERE name = ?`, [
    skillName,
  ]);
  const id = (rows as any[])[0]?.id ?? null;

  return id;
};
