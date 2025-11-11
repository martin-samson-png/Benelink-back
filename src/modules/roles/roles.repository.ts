import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class RolesRepository {
  constructor(private readonly pool: Pool) {}

  async getRoleIdByName(roleName: string): Promise<number | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[] & { id: number }>(
        `SELECT id FROM roles WHERE name = ?`,
        [roleName]
      );
      const id = rows[0]?.id ?? null;

      return id;
    } catch {
      throw new Error("Erreur lors de la récuperation des rôles");
    }
  }

  async deleteUserRoleByName(userId: string, roleName: string) {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE ur FROM user_roles ur
     JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = ? AND r.name = ?`,
      [userId, roleName]
    );
    return result;
  }
}
