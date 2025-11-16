import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class ApplicationsRepository {
  constructor(private readonly pool: Pool) {}

  async checkApplicationIsUnique(userId: string, missionId: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM applications WHERE user_id=? AND mission_id=?`,
      [userId, missionId]
    );
    return rows[0];
  }

  async getApplicationById(applicationId: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT a.id, a.status, a.created_at, a.updated_at, u.id AS userId, u.firstname, u.lastname, u.email, m.title, 
      v.city, v.experience, v.rate, m.descr,m.city, m.start_date, m.end_date, m.status AS statusMission, 
      JSON_ARRAYAGG (s.name) AS skills, a2.asso_name  
      FROM applications a JOIN users u  ON a.user_id = u.id 
      JOIN missions m ON a.mission_id = m.id
      JOIN volunteers v ON u.id = v.user_id
      JOIN volunteer_skills vs ON v.id = vs.volunteer_id
      JOIN skills s ON vs.skills_id = s.id
      JOIN associations a2 ON m.association_id = a2.id 
      WHERE a.id=?`,
      [applicationId]
    );
    const application = rows.map((r) => ({
      ...r,
      skills: r.skills ? JSON.parse(r.skills) : [],
    }));
    return application[0];
  }

  async getApplicationByUserId(userId: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT a.id, a.status, a.created_at, a.updated_at, u.id AS userId, u.firstname, u.lastname, u.email, m.title, 
      v.city, v.experience, v.rate, m.descr,m.city, m.start_date, m.end_date, m.status AS statusMission, 
      JSON_ARRAYAGG (s.name) AS skills, a2.asso_name  
      FROM applications a JOIN users u  ON a.user_id = u.id 
      JOIN missions m ON a.mission_id = m.id
      JOIN volunteers v ON u.id = v.user_id
      JOIN volunteer_skills vs ON v.id = vs.volunteer_id
      JOIN skills s ON vs.skills_id = s.id
      JOIN associations a2 ON m.association_id = a2.id 
      WHERE a.user_id=?`,
      [userId]
    );

    return rows.map((r) => ({
      ...r,
      skills: r.skills ? JSON.parse(r.skills) : [],
    }));
  }

  async getApplicationByMissionId(missionId: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT a.id, a.status, a.created_at, a.updated_at, u.id AS userId, u.firstname, u.lastname, u.email, m.title, 
      v.city, v.experience, v.rate, m.descr,m.city, m.start_date, m.end_date, m.status AS statusMission, 
      JSON_ARRAYAGG (s.name) AS skills, a2.asso_name  
      FROM applications a JOIN users u  ON a.user_id = u.id 
      JOIN missions m ON a.mission_id = m.id
      JOIN volunteers v ON u.id = v.user_id
      JOIN volunteer_skills vs ON v.id = vs.volunteer_id
      JOIN skills s ON vs.skills_id = s.id
      JOIN associations a2 ON m.association_id = a2.id 
      WHERE a.mission_id=?`,
      [missionId]
    );
    const application = rows.map((r) => ({
      ...r,
      skills: r.skills ? JSON.parse(r.skills) : [],
    }));
    return application.length > 0 ? application : application[0];
  }

  async getAllApplication() {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT a.id, a.status, a.created_at, a.updated_at, u.id AS userId, u.firstname, u.lastname, u.email, m.title, 
      v.city, v.experience, v.rate, m.descr,m.city, m.start_date, m.end_date, m.status AS statusMission, 
      JSON_ARRAYAGG (s.name) AS skills, a2.asso_name  
      FROM applications a JOIN users u  ON a.user_id = u.id 
      JOIN missions m ON a.mission_id = m.id
      JOIN volunteers v ON u.id = v.user_id
      JOIN volunteer_skills vs ON v.id = vs.volunteer_id
      JOIN skills s ON vs.skills_id = s.id
      JOIN associations a2 ON m.association_id = a2.id `
    );
    return rows.map((r) => ({
      ...r,
      skills: r.skills ? JSON.parse(r.skills) : [],
    }));
  }

  async createApplication(userId: string, missionId: string): Promise<number> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO applications(user_id, mission_id) VALUES (?, ?)`,
      [userId, missionId]
    );

    return result.insertId;
  }

  async updateApplication(status: "accept" | "reject", applicationId: string) {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE applications SET status=? WHERE id=?`,
      [status, applicationId]
    );

    return result.insertId;
  }

  async deleteApplication(applicationId: string) {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE FROM applications WHERE id=?`,
      [applicationId]
    );
    return result.affectedRows > 0;
  }
}
