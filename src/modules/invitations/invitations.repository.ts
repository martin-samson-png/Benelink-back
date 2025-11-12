import { AcceptInvitationDTO } from "./dto/accept-invitation.dto";
import { CreateInvitationDTO } from "./dto/create-invitation.dto";
import { Invitations } from "./../../models/invitation.model";
import {
  ResultSetHeader,
  Pool,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";

export class InvitationsRepository {
  constructor(private readonly pool: Pool) {}

  async countUserInvitation(
    associationId: string,
    email: string
  ): Promise<number> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS count FROM invitations WHERE association_id = ? AND email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)`,
        [associationId, email]
      );

      return rows[0]?.count ?? 0;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getMemberAssociationById(userId: string, associationId: string) {
    try {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT * FROM association_members WHERE user_id=? AND association_id=?`,
        [userId, associationId]
      );
      return rows[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getInvitationByToken(token: string): Promise<Invitations | null> {
    try {
      const [row] = await this.pool.query(
        `SELECT * FROM invitations WHERE token=?`,
        [token]
      );
      const invitation = row as Invitations[];
      return invitation.length > 0 ? invitation[0] : null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createInvitation(data: CreateInvitationDTO & { token: string }) {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO invitations(token, association_id, created_by,  email) VALUES (?, ?, ?, ?)`,
        [data.token, data.associationId, data.createdBy, data.email]
      );
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async acceptInvitation(data: AcceptInvitationDTO) {
    const connection: PoolConnection = await this.pool.getConnection();

    try {
      await connection.query<ResultSetHeader>(
        `UPDATE invitations SET used_by=?, status="accepted", accepted_at = NOW(0) WHERE token=?`,
        [data.userId, data.token]
      );
      await connection.query<ResultSetHeader>(
        `INSERT INTO association_members (association_id, user_id, role) VALUES (?, ?, ?)`,
        [data.associationId, data.userId, "member"]
      );
      if (data.option?.shouldAddRole && data.roleId) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO user_roles(user_id, role_id) VALUES (?, ?)`,
          [data.userId, data.roleId]
        );
      }
      await connection.commit();
      return { ok: true, message: "Invitation acceptée avec succès" };
    } catch (err) {
      connection.rollback();
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }
}
