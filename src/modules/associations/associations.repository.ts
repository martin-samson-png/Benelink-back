import {
  Pool,
  RowDataPacket,
  ResultSetHeader,
  PoolConnection,
} from "mysql2/promise";
import { Association, Invitation } from "../../models/association.model";

export class AssociationsRepository {
  constructor(private readonly pool: Pool) {}

  async getAssociationById(associationId: string): Promise<Association | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM associations WHERE id=?`,
      [associationId]
    );
    if (rows.length === 0) return null;

    return (rows[0] as Association) || null;
  }

  async createAssociation(
    data: Omit<
      Association,
      "created_at" | "updated_at" | "rate" | "verified"
    > & {
      role_id: number;
    }
  ) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [assoResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO associations(id, userId, asso_name, rna, description, website_url, social_link, contact_email, city)
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
      if (assoResult.affectedRows === 0)
        throw new Error("Echec de la création de l'association");

      const [assoMemberResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO association_members(associationId, userId, role, joined_at) VALUES (?, ?, ?, ?)`,
        [
          data.id,
          data.userId,
          "owner",
          new Date().toISOString().slice(0, 19).replace("T", " "),
        ]
      );
      if (assoMemberResult.affectedRows === 0)
        throw new Error(
          "Echec de l'affectation de l'utilisateur à une association"
        );

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(userId, role_id) VALUES (?, ?)`,
        [data.userId, data.role_id]
      );
      if (roleResult.affectedRows === 0)
        throw new Error("Echec de l'affectation du role");

      await connection.commit();
      return { ok: true };
    } catch (err) {
      if (connection) connection.rollback();
      console.error("Echec transaction: ", err);
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async createInvitation(
    data: Omit<Invitation, "id" | "used_by" | "expire_at">
  ) {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO invitations(token, associationId, created_by,  email) VALUES (?, ?, ?, ?)`,
        [data.token, data.associationId, data.created_by, data.email]
      );

      if (result.affectedRows === 0)
        throw new Error("Echec de la création de l'invitation");
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
