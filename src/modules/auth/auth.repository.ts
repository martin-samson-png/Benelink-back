import { Pool, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { User } from "../../models/users.model";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { RegisterDTO } from "./dto/register.dto";

export class AuthRepository {
  constructor(private readonly pool: Pool) {}

  async register(data: RegisterDTO & { id: string; roleId: number }) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [userResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO users(id, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`,
        [data.id, data.firstname, data.lastname, data.email, data.password]
      );

      if (userResult.affectedRows === 0)
        throw new InternalServerException(
          "Echec de la création de l'utilisateur"
        );

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, role_id) VALUES (? , ?)`,
        [data.id, data.roleId]
      );

      if (roleResult.affectedRows === 0)
        throw new InternalServerException("Echec de l'attribution du role");

      await connection.commit();
      return { ok: true };
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Erreur transaction", err);
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    try {
      const [rows] = await this.pool.query(
        `SELECT * FROM users WHERE reset_token=?`,
        [token]
      );

      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } catch {
      throw new InternalServerException(
        "Erreur lors de la récuperation de l'utilisateur"
      );
    }
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) {
    try {
      await this.pool.query<ResultSetHeader>(
        `UPDATE users SET password=?, reset_token=NULL, reset_token_expiration=NULL
         WHERE reset_token=? AND reset_token_expiration > NOW()`,
        [password, token]
      );

      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de la mise a jour du mot de passe"
      );
    }
  }

  async saveResetToken({ email, token }: { email: string; token: string }) {
    try {
      await this.pool.query<ResultSetHeader>(
        `UPDATE users SET reset_token=?, reset_token_expiration=NOW() + INTERVAL 15 MINUTE WHERE email=?`,
        [token, email]
      );
      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de l'insertion des données"
      );
    }
  }
}
