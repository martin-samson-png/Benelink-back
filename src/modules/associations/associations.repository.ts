import {
  Pool,
  ResultSetHeader,
  PoolConnection,
  RowDataPacket,
} from "mysql2/promise";
import { Association } from "../../models/association.model";
import { CreateAssociationDTO } from "./dto/create-association.dto";
import { UpdateAssociationDTO } from "./dto/update-association.dto";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { AssociationRow } from "./dto/association.row";
import { associationMapper } from "../../mappers/association.mapper";

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

  async getAssociationByRNA(rna: string): Promise<{ id: string } | null> {
    const [rows] = await this.pool.query<(RowDataPacket & AssociationRow)[]>(
      `SELECT id FROM associations WHERE rna=?`,
      [rna]
    );
    if (!rows.length) return null;

    return rows[0];
  }

  async getAssociationById(associationId: string): Promise<Association | null> {
    const [rows] = await this.pool.query<(RowDataPacket & AssociationRow)[]>(
      `SELECT a.*, am.user_id, am.role, am.joined_at , u.firstname, u.avatar, u.lastname, u.email, u.phone 
        FROM associations a JOIN association_members am ON a.id = am.association_id 
        JOIN users u ON am.user_id = u.id WHERE a.id=? GROUP BY a.id`,
      [associationId]
    );
    if (rows.length === 0) return null;

    return associationMapper(rows);
  }

  async getAllAssociations(): Promise<Association[]> {
    const [rows] = await this.pool.query<(AssociationRow & RowDataPacket)[]>(
      `SELECT a.*, 
            am.user_id, am.role, am.joined_at,
            u.firstname, u.avatar, u.lastname, u.email, u.phone
     FROM associations a
     JOIN association_members am ON a.id = am.association_id
     JOIN users u ON am.user_id = u.id`
    );

    const groups = new Map<string, AssociationRow[]>();

    for (const row of rows) {
      if (!groups.has(row.id)) groups.set(row.id, []);
      groups.get(row.id)!.push(row);
    }

    return Array.from(groups.values()).map((rowsPerAsso) =>
      associationMapper(rowsPerAsso)
    );
  }

  async createAssociation(
    data: CreateAssociationDTO & {
      id: string;
      roleId: number;
      assoMemberId: string;
    }
  ) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [assoResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO associations(id, asso_name, rna, descr, website_url, social_link, contact_email, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.id,
          data.assoName,
          data.rna,
          data.descr,
          data.websiteUrl ?? null,
          data.socialLink ?? null,
          data.contactEmail,
          data.city,
        ]
      );
      if (assoResult.affectedRows === 0)
        throw new InternalServerException(
          "Erreur lors de l'insertion de l'association"
        );

      const [assoMemberResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO association_members(id, association_id, user_id, role) VALUES (?, ?, ?, ?)`,
        [data.assoMemberId, data.id, data.userId, "owner"]
      );
      if (assoMemberResult.affectedRows === 0)
        throw new InternalServerException(
          "Erreur lors de l'insertion de l'utilisateur dans l'association"
        );

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, role_id) VALUES (?, ?)`,
        [data.userId, data.roleId]
      );
      if (roleResult.affectedRows === 0)
        throw new InternalServerException(
          "Erreur lors de l'insertion des rôles"
        );

      await connection.commit();
      const [rows] = await this.pool.query<(RowDataPacket & AssociationRow)[]>(
        `SELECT a.*, am.user_id, am.role, am.joined_at , u.firstname, u.avatar, u.lastname, u.email, u.phone 
        FROM associations a JOIN association_members am ON a.id = am.association_id 
        JOIN users u ON am.user_id = u.id WHERE a.id=? GROUP BY a.id`,
        [data.id]
      );
      if (!rows.length)
        throw new InternalServerException(
          "Association introuvable après insertion"
        );
      return associationMapper(rows);
    } catch (err) {
      connection.rollback();
      console.error("Echec transaction: ", err);
      throw err;
    } finally {
      connection.release();
    }
  }

  async updateAssociation(
    data: UpdateAssociationDTO & { associationId: string }
  ): Promise<Association> {
    const { associationId, ...fields } = data;

    const fieldsToUpdate: any = {};

    if (data.assoName) fieldsToUpdate.asso_name = fields.assoName;
    if (data.descr) fieldsToUpdate.descr = fields.descr;
    if (data.websiteUrl) fieldsToUpdate.website_url = fields.websiteUrl;
    if (data.socialLink) fieldsToUpdate.social_link = fields.socialLink;
    if (data.contactEmail) fieldsToUpdate.contact_email = fields.contactEmail;
    if (data.city) fieldsToUpdate.city = fields.city;

    const key = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);
    const setKey = key.map((k) => `${k} = ?`).join(", ");

    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE associations SET ${setKey} where id=?`,
      [...values, associationId]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la modification de l'association"
      );

    const [rows] = await this.pool.query<(RowDataPacket & AssociationRow)[]>(
      `SELECT a.*, am.user_id, am.role, am.joined_at , u.firstname, u.avatar, u.lastname, u.email, u.phone 
        FROM associations a JOIN association_members am ON a.id = am.association_id 
        JOIN users u ON am.user_id = u.id WHERE a.id=? GROUP BY a.id`,
      [associationId]
    );
    if (!rows.length)
      throw new InternalServerException(
        "Association introuvable après insertion"
      );
    return associationMapper(rows);
  }

  async banAssoMember({
    banId,
    associationId,
  }: {
    banId: string;
    associationId: string;
  }): Promise<{ ok: true }> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE FROM association_members WHERE user_id=? AND association_id=?`,
      [banId, associationId]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la suppression du membres"
      );
    return { ok: true };
  }

  async deleteAssociation(associationId: string): Promise<{ ok: true }> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE FROM associations WHERE id=?`,
      [associationId]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la suppression de l'association"
      );
    return { ok: true };
  }
}
