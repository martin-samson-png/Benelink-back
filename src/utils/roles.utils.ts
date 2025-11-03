import { Pool } from "mysql2/promise";

let cachedRoles: Record<string, number> = {};

export const getRoleIdByName = async (
  pool: Pool,
  roleName: string
): Promise<number | null> => {
  if (cachedRoles[roleName]) return cachedRoles[roleName];

  const [rows] = await pool.query(`SELECT id FROM roles WHERE name = ?`, [
    roleName,
  ]);
  const id = (rows as any[])[0]?.id ?? null;

  return id;
};
