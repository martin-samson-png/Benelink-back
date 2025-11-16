import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { UserRow } from "../users/dto/user.row";

export class AuthRepository {
  constructor(private readonly pool: Pool) {}

  async getUserByResetToken(token: string): Promise<UserRow | null> {
    const [rows] = await this.pool.query<(UserRow & RowDataPacket)[]>(
      `SELECT * FROM users WHERE reset_token=?`,
      [token]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }): Promise<{ ok: true }> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET password=?, reset_token=NULL, reset_token_expiration=NULL
         WHERE reset_token=? AND reset_token_expiration > NOW()`,
      [password, token]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la mise a jour du mot de passe"
      );

    return { ok: true };
  }

  async saveResetToken({
    email,
    token,
  }: {
    email: string;
    token: string;
  }): Promise<{ ok: true }> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET reset_token=?, reset_token_expiration=NOW() + INTERVAL 15 MINUTE WHERE email=?`,
      [token, email]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de l'insertion des données"
      );
    return { ok: true };
  }
}
