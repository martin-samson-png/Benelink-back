import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { CreateMissionDTO } from "./dto/create-mission.dto";
import { mapRow, mapRows, toSnake } from "../../utils/caseMapper";
import { MissionWithDetailsDTO } from "./dto/mission-with-details.dto";
import { UpdateMissionDTO } from "./dto/update-mission.dto";

export class MissionsRepository {
  constructor(private readonly pool: Pool) {}

  async getMissionByAssociationId(
    associationId: string
  ): Promise<MissionWithDetailsDTO[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT m.id AS missionId, m.title, m.descr, m.city AS missionCity, m.start_date, m.end_date, m.status, m.rate, m.created_at, m.updated_at, 
        u.id AS userId, u.firstname, u.lastname, u.email, 
        a.id AS assoId, a.asso_name, a.description, a.city AS assoCity, a.website_url, a.social_link 
        FROM missions m JOIN users u ON m.created_by=u.id JOIN associations a ON m.association_id=a.id
        WHERE association_id=?`,
      [associationId]
    );
    return mapRows<MissionWithDetailsDTO>(rows);
  }

  async getMissionByCity(city: string): Promise<MissionWithDetailsDTO[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT m.id AS missionId, m.title, m.descr, m.city AS missionCity, m.start_date, m.end_date, m.status, m.rate, m.created_at, m.updated_at, 
        u.id AS userId, u.firstname, u.lastname, u.email, 
        a.id AS assoId, a.asso_name, a.description, a.city AS assoCity, a.website_url, a.social_link 
        FROM missions m JOIN users u ON m.created_by=u.id JOIN associations a ON m.association_id=a.id
        WHERE association_id=?`,
      [city]
    );
    return mapRows<MissionWithDetailsDTO>(rows);
  }

  async getMissionById(
    missionId: string
  ): Promise<MissionWithDetailsDTO | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT m.id AS missionId, m.title, m.descr, m.city AS missionCity, m.start_date, m.end_date, m.status, m.rate, m.created_at, m.updated_at, 
        u.id AS userId, u.firstname, u.lastname, u.email, 
        a.id AS assoId, a.asso_name, a.description, a.city AS assoCity, a.website_url, a.social_link 
        FROM missions m JOIN users u ON m.created_by=u.id JOIN associations a ON m.association_id=a.id
         WHERE m.id=?`,
        [missionId]
      );
      return rows.length > 0 ? mapRow<MissionWithDetailsDTO>(rows[0]) : null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getMissionByCreator(
    userId: string,
    associationId: string
  ): Promise<MissionWithDetailsDTO[]> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT m.id AS missionId, m.title, m.descr, m.city AS missionCity, m.start_date, m.end_date, m.status, m.rate, m.created_at, m.updated_at, 
         u.id AS userId, u.firstname, u.lastname, u.email, 
         a.id AS assoId, a.asso_name, a.description, a.city AS assoCity, a.website_url, a.social_link 
         FROM missions m JOIN users u ON m.created_by=u.id JOIN associations a ON m.association_id=a.id 
         WHERE created_by=? AND association_id=?`,
        [userId, associationId]
      );

      return mapRows<MissionWithDetailsDTO>(rows);
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  async getAllMissions(): Promise<MissionWithDetailsDTO[]> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT m.id AS missionId, m.title, m.descr, m.city AS missionCity, m.start_date, m.end_date, m.status, m.rate, m.created_at, m.updated_at, 
        u.id AS userId, u.firstname, u.lastname, u.email, 
        a.id AS assoId, a.asso_name, a.description, a.city AS assoCity, a.website_url, a.social_link 
        FROM missions m JOIN users u ON m.created_by=u.id JOIN associations a ON m.association_id=a.id`
      );

      return mapRows<MissionWithDetailsDTO>(rows);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getBrowsing(associationId: string): Promise<MissionWithDetailsDTO[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT m.id AS missionId, m.title, m.descr, m.city AS missionCity, m.start_date, m.end_date, m.status, m.rate, m.created_at, m.updated_at, 
         u.id AS userId, u.firstname, u.lastname, u.email, 
         a.id AS assoId, a.asso_name, a.description, a.city AS assoCity, a.website_url, a.social_link 
         FROM missions m JOIN users u ON m.created_by=u.id JOIN associations a ON m.association_id=a.id 
         WHERE association_id=? AND status="close"`,
      [associationId]
    );

    return mapRows<MissionWithDetailsDTO>(rows);
  }

  async isMissionUnique(
    data: Omit<CreateMissionDTO, "descr">
  ): Promise<MissionWithDetailsDTO | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT m.id AS missionId, m.title, m.descr, m.city AS missionCity, m.start_date, m.end_date, m.status, m.rate, m.created_at, m.updated_at, 
        u.id AS userId, u.firstname, u.lastname, u.email, 
        a.id AS assoId, a.asso_name, a.description, a.city AS assoCity, a.website_url, a.social_link 
        FROM missions m JOIN users u ON m.created_by=u.id JOIN associations a ON m.association_id=a.id
         WHERE association_id = ? AND title = ? AND start_date = ? AND end_date = ?`,
        [data.associationId, data.title, data.startDate, data.endDate]
      );

      return rows.length > 0 ? mapRow<MissionWithDetailsDTO>(rows[0]) : null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createMission(data: CreateMissionDTO): Promise<number> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO missions(association_id, created_by, title, city, descr, start_date, end_date) VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [
          data.associationId,
          data.createdBy,
          data.title,
          data.city,
          data.descr,
          data.startDate,
          data.endDate,
        ]
      );
      return result.insertId;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async updateMission(data: UpdateMissionDTO): Promise<boolean> {
    try {
      const { missionId, ...fields } = data;
      const cleanData = toSnake(fields);
      const keys = Object.keys(cleanData);
      const values = Object.values(cleanData);
      const setkeys = keys.map((k) => `${k} = ?`).join(", ");

      const [result] = await this.pool.query<ResultSetHeader>(
        `UPDATE missions SET ${setkeys} WHERE id=?`,
        [...values, missionId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async deleteMission(missionId: string): Promise<boolean> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM missions WHERE id=?`,
        [missionId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
