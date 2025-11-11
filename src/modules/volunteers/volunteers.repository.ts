import { Volunteer } from "../../models/volunteers.model";
import { Pool, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { CreateVolunteerDTO } from "./dto/create-volunteer.dto";
import { InternalServerException } from "../../exceptions/internal.server.exception";

export class VolunteersRepository {
  constructor(private readonly pool: Pool) {}

  async getVolunteerById(volunteerId: string): Promise<Volunteer | null> {
    try {
      const [row] = await this.pool.query(
        `SELECT * FROM volunteers WHERE id=?`,
        [volunteerId]
      );
      const volunteer = row as Volunteer[];
      return volunteer.length > 0 ? volunteer[0] : null;
    } catch (err: any) {
      console.log(err.message);
      throw new InternalServerException(
        "Erreur lors de la récuperation du bénévole"
      );
    }
  }

  async getVolunteerByUserId(userId: string): Promise<Volunteer | null> {
    try {
      const [row] = await this.pool.query(
        `SELECT * FROM volunteers v WHERE user_id=?`,
        [userId]
      );
      const volunteer = row as Volunteer[];
      return volunteer.length > 0 ? volunteer[0] : null;
    } catch (err: any) {
      console.log(err.message);

      throw new InternalServerException(
        "Erreur lors de la récuperation du bénévole"
      );
    }
  }

  async getAllVolunteers(): Promise<Volunteer[]> {
    try {
      const [rows] = await this.pool.query(`SELECT * FROM volunteers`);
      return rows as Volunteer[];
    } catch {
      throw new InternalServerException(
        "Erreur lors de la récuperation des bénévoles"
      );
    }
  }

  private async updateCity(
    connection: PoolConnection,
    volunteer_id: string,
    city: string
  ) {
    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE volunteers SET city=? WHERE id=?`,
      [city, volunteer_id]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la modification du bénévole"
      );
  }

  private async replaceSkills(
    connection: PoolConnection,
    volunteerId: string,
    skillsId: number[]
  ) {
    await connection.query(
      `DELETE FROM volunteer_skills WHERE volunteer_id=?`,
      [volunteerId]
    );
    for (const skill_id of skillsId) {
      const [skillsResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO volunteer_skills(volunteer_id, skills_id) VALUES (?, ?)`,
        [volunteerId, skill_id]
      );
      if (skillsResult.affectedRows === 0)
        throw new InternalServerException("Echec de l'affectation des skills");
    }
  }

  async createVolunteer(
    data: Omit<CreateVolunteerDTO, "skills"> & {
      volunteerId: string;
      roleId: number;
      skillsId: number[];
    }
  ) {
    const connection: PoolConnection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [volunteerResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO volunteers(id, user_id, city) VALUES (?, ?, ?)`,
        [data.volunteerId, data.userId, data.city]
      );
      if (volunteerResult.affectedRows === 0)
        throw new InternalServerException("Echec de la création du bénévole");

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, role_id) VALUES (?, ?)`,
        [data.userId, data.roleId]
      );

      if (roleResult.affectedRows === 0)
        throw new InternalServerException("Echec de l'affectation du role");

      await this.replaceSkills(connection, data.volunteerId, data.skillsId);

      await connection.commit();
      return { ok: true };
    } catch (err) {
      if (connection) await connection.rollback();
      console.error(err);

      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async updateVolunteer(
    volunteerId: string,
    city: string,
    skillsId: number[] | null
  ) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      if (city) await this.updateCity(connection, volunteerId, city);

      if (skillsId) await this.replaceSkills(connection, volunteerId, skillsId);

      await connection.commit();
      return { ok: true };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async deleteVolunteerByUserId(userId: string, roleId: number) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      const [volunteerResult] = await connection.query<ResultSetHeader>(
        `DELETE FROM volunteers WHERE user_id=?`,
        [userId]
      );
      if (volunteerResult.affectedRows === 0)
        throw new InternalServerException(
          "Erreur lors de la suppression du bénévole"
        );

      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de la suppression du bénévole"
      );
    }
  }
}
