import { Volunteer } from "../../models/volunteers.model";
import {
  Pool,
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";

export class VolunteersRepository {
  constructor(private readonly pool: Pool) {}

  async getVolunteerByUserId(userId: string): Promise<Volunteer | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[] & Volunteer[]>(
        `SELECT * FROM volunteers v WHERE user_id=?`,
        [userId]
      );
      return rows[0] || null;
    } catch (err: any) {
      console.log(err.message);

      throw new Error(
        "Erreur lors de la récuperation du bénévole",
        err.message
      );
    }
  }

  async createVolunteer(
    data: Omit<
      Volunteer,
      "experience" | "createdAt" | "updatedAt" | "rate" | "skills"
    > & { role_id: number; skills_id: number[] | null }
  ) {
    const connection: PoolConnection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      console.log(data);

      const [volunteerResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO volunteers(id, user_id, city) VALUES (?, ?, ?)`,
        [data.id, data.userId, data.city]
      );
      if (volunteerResult.affectedRows === 0)
        throw new Error("Echec de la création du bénévole");

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, role_id) VALUES (?, ?)`,
        [data.userId, data.role_id]
      );
      if (roleResult.affectedRows === 0)
        throw new Error("Echec de l'affectation du role");

      for (const skill_id of data.skills_id!) {
        const [skillsResult] = await connection.query<ResultSetHeader>(
          `INSERT INTO volunteer_skills(volunteer_id, skills_id) VALUES (?, ?)`,
          [data.id, skill_id]
        );
        if (skillsResult.affectedRows === 0)
          throw new Error("Echec de l'affectation des skills");
      }

      const [rows] = await connection.query<RowDataPacket[] & Volunteer[]>(
        "SELECT * FROM volunteers WHERE id=?",
        [data.id]
      );
      await connection.commit();
      return rows[0];
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Erreur transaction", err);
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }
}
