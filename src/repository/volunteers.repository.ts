import { Volunteer } from "../models/volunteers.model";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class VolunteersRepository {
  private pool: Pool;
  constructor(pool: Pool) {
    this.pool = pool;
  }

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
      "id" | "experience" | "createdAt" | "updatedAt" | "rate"
    >
  ): Promise<Volunteer> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO volunteers(user_id, city, skills) VALUES (?, ?, ?)`,
        [data.userId, data.city, JSON.stringify(data.skills)]
      );
      const userId = result.insertId;
      const [rows] = await this.pool.query<RowDataPacket[] & Volunteer[]>(
        `SELECT * FROM volunteers v WHERE user_id=?`,
        [userId]
      );
      return rows[0];
    } catch {
      throw new Error("Erreur lors de la création du bénévole");
    }
  }
}
