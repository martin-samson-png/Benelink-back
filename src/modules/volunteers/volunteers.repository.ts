import { Volunteer } from "../../models/volunteer.model";
import {
  Pool,
  ResultSetHeader,
  PoolConnection,
  RowDataPacket,
} from "mysql2/promise";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { VolunteerRow } from "./dto/volunteer.rows";
import { mapVolunteer } from "../../mappers/volunteers.mapper";
import { CreateVolunteerRepositoryDTO } from "./dto/create-volunteer-repository.dto";
import { UpdateVolunteerRepositoryDTO } from "./dto/update-volunteer-repository.dto";

export class VolunteersRepository {
  constructor(private readonly pool: Pool) {}

  async getVolunteerById(volunteerId: string): Promise<Volunteer | null> {
    const [rows] = await this.pool.query<(RowDataPacket & VolunteerRow)[]>(
      `SELECT v.*, u.firstname, u.lastname, u.avatar, u.email, u.phone, JSON_ARRAYAGG(s.name) AS skills
      FROM volunteers v JOIN users u ON v.user_id = u.id JOIN volunteer_skills vs ON vs.volunteer_id = v.id 
      JOIN skills s ON vs.skills_id = s.id WHERE v.id=? GROUP BY v.id`,
      [volunteerId]
    );
    if (rows.length === 0) return null;

    return mapVolunteer(rows[0]);
  }

  async getVolunteerByUserId(userId: string): Promise<Volunteer | null> {
    const [rows] = await this.pool.query<(RowDataPacket & VolunteerRow)[]>(
      `SELECT v.*, u.firstname, u.lastname, u.avatar, u.email, u.phone, JSON_ARRAYAGG(s.name) AS skills
      FROM volunteers v JOIN users u ON v.user_id = u.id JOIN volunteer_skills vs ON vs.volunteer_id = v.id 
      JOIN skills s ON vs.skills_id = s.id WHERE v.user_id=? GROUP BY v.id`,
      [userId]
    );
    if (rows.length === 0) return null;

    return mapVolunteer(rows[0]);
  }

  async getAllVolunteers(): Promise<Volunteer[]> {
    const [rows] = await this.pool.query<(RowDataPacket & VolunteerRow)[]>(
      `SELECT v.*, u.firstname, u.lastname, u.avatar, u.email, u.phone, JSON_ARRAYAGG(s.name) AS skills
      FROM volunteers v JOIN users u ON v.user_id = u.id JOIN volunteer_skills vs ON vs.volunteer_id = v.id 
      JOIN skills s ON vs.skills_id = s.id`
    );
    return rows.map((r) => mapVolunteer(r));
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
    data: CreateVolunteerRepositoryDTO
  ): Promise<Volunteer> {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [volunteerResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO volunteers(id, user_id, city) VALUES (?, ?, ?)`,
        [data.id, data.userId, data.city]
      );
      if (volunteerResult.affectedRows === 0)
        throw new InternalServerException("Echec de la création du bénévole");

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, role_id) VALUES (?, ?)`,
        [data.userId, data.roleId]
      );

      if (roleResult.affectedRows === 0)
        throw new InternalServerException("Echec de l'affectation du role");

      await this.replaceSkills(connection, data.id, data.skillsId);

      await connection.commit();
      const [rows] = await this.pool.query<(RowDataPacket & VolunteerRow)[]>(
        `SELECT v.*, u.firstname, u.lastname, u.avatar, u.email, u.phone, JSON_ARRAYAGG(s.name) AS skills
        FROM volunteers v JOIN users u ON v.user_id = u.id JOIN volunteer_skills vs ON vs.volunteer_id = v.id 
        JOIN skills s ON vs.skills_id = s.id WHERE v.id=? GROUP BY v.id`,
        [data.id]
      );
      if (!rows.length)
        throw new InternalServerException(
          "Bénévole introuvable après insertion"
        );

      return mapVolunteer(rows[0]);
    } catch (err) {
      if (connection) await connection.rollback();
      console.error(err);

      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async updateVolunteer(
    data: UpdateVolunteerRepositoryDTO & { volunteerId: string }
  ) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      if (data.city) {
        const [result] = await connection.query<ResultSetHeader>(
          `UPDATE volunteers SET city=? WHERE id=?`,
          [data.city, data.volunteerId]
        );
        if (result.affectedRows === 0)
          throw new InternalServerException(
            "Erreur lors de la modification du bénévole"
          );
      }

      if (data.skillsId)
        await this.replaceSkills(connection, data.volunteerId, data.skillsId);

      await connection.commit();
      const [rows] = await this.pool.query<(RowDataPacket & VolunteerRow)[]>(
        `SELECT v.*, u.firstname, u.lastname, u.avatar, u.email, u.phone, JSON_ARRAYAGG(s.name) AS skills
        FROM volunteers v JOIN users u ON v.user_id = u.id JOIN volunteer_skills vs ON vs.volunteer_id = v.id 
        JOIN skills s ON vs.skills_id = s.id WHERE v.id=? GROUP BY v.id`,
        [data.volunteerId]
      );
      if (!rows.length)
        throw new InternalServerException(
          "Bénévole introuvable après insertion"
        );
      return mapVolunteer(rows[0]);
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async deleteVolunteerByUserId(
    userId: string,
    roleId: number
  ): Promise<{ ok: true }> {
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
      const [roleResult] = await connection.query<ResultSetHeader>(
        `DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`,
        [userId, roleId]
      );
      if (roleResult.affectedRows === 0)
        throw new InternalServerException(
          "Erreur lors de la suppression du role 'volunteer'"
        );

      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de la suppression du bénévole"
      );
    }
  }
}
