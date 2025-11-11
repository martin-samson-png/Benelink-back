import { Invitation } from "../../models/association.model";
import { CreateInvitationDTO } from "./dto/create-invitation.dto";
import { ResultSetHeader, Pool, RowDataPacket } from "mysql2/promise";

export class InvitationsRepository {
  constructor(private readonly pool: Pool) {}

  async countUserInvitation(
    associationId: string,
    email: string
  ): Promise<number> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS count
     FROM invitations
     WHERE association_id = ?
       AND email = ?
       AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)`,
        [associationId, email]
      );

      return rows[0]?.count ?? 0;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    try {
      const [row] = await this.pool.query(
        `SELECT * FROM invitations WHERE token=?`,
        [token]
      );
      const invitation = row as Invitation[];
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
}
