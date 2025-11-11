import { Pool, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { Association } from "../../models/association.model";
import { CreateAssociationDTO } from "./dto/create-association";
import { UpdateAssociationDTO } from "./dto/update-association";

export class AssociationsRepository {
  constructor(private readonly pool: Pool) {}

  async countAssociationsByUser(userId: string): Promise<number> {
    const [rows] = await this.pool.query(
      `SELECT COUNT(*) AS total
     FROM association_members
     WHERE user_id = ?`,
      [userId]
    );
    return (rows as { total: number }[])[0].total;
  }

  async findMemberInAssociation(
    userId: string,
    associationId: string
  ): Promise<{ role: string } | null> {
    try {
      const [row] = await this.pool.query(
        `SELECT role FROM association_members WHERE user_id=? AND association_id=?`,
        [userId, associationId]
      );

      return (row as { role: string }[])[0] || null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getAssociationByRNA(rna: string): Promise<Association | null> {
    try {
      const [row] = await this.pool.query(
        `SELECT * FROM associations WHERE rna=?`,
        [rna]
      );
      const association = row as Association[];

      return association.length > 0 ? association[0] : null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getAssociationById(associationId: string): Promise<Association | null> {
    try {
      const [row] = await this.pool.query(
        `SELECT * FROM associations WHERE id=?`,
        [associationId]
      );

      const association = row as Association[];

      return association.length > 0 ? association[0] : null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getAllAssociations(): Promise<Association[]> {
    try {
      const [rows] = await this.pool.query(`SELECT * FROM associations`);
      return rows as Association[];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getMembersByAssociation(associationId: string) {
    const [rows] = await this.pool.query(
      `SELECT user_id FROM association_members WHERE association_id = ?`,
      [associationId]
    );
    return rows as { user_id: string }[];
  }

  async createAssociation(
    data: CreateAssociationDTO & { id: string; role_id: number }
  ) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [assoResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO associations(id, user_id, asso_name, rna, description, website_url, social_link, contact_email, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.id,
          data.userId,
          data.asso_name,
          data.rna,
          data.descr,
          data.website_url,
          data.social_link,
          data.contact_email,
          data.city,
        ]
      );

      const [assoMemberResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO association_members(association_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`,
        [
          data.id,
          data.userId,
          "owner",
          new Date().toISOString().slice(0, 19).replace("T", " "),
        ]
      );

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, role_id) VALUES (?, ?)`,
        [data.userId, data.role_id]
      );

      await connection.commit();
      return {
        associationCreated: assoResult.affectedRows > 0,
        memberLinked: assoMemberResult.affectedRows > 0,
        roleLinked: roleResult.affectedRows > 0,
      };
    } catch (err) {
      connection.rollback();
      console.error("Echec transaction: ", err);
      throw err;
    } finally {
      connection.release();
    }
  }

  async updateAssociation(data: UpdateAssociationDTO) {
    try {
      const { id, ...fields } = data;
      const key = Object.keys(fields);
      if (!key.length) return { affectedRows: 0 } as ResultSetHeader;

      const values = Object.values(fields);
      const setKey = key.map((k) => `${k} = ?`).join(", ");

      const [result] = await this.pool.query<ResultSetHeader>(
        `UPDATE associations SET ${setKey} where id=?`,
        [...values, id]
      );

      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async deleteAssociation(associationId: string) {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM associations WHERE id=?`,
        [associationId]
      );
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
