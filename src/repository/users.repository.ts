import { Role } from "../models/role.model";
import { User } from "../models/users.model";
import {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

export class UserRepository {
  constructor(private readonly pool: Pool) {}

  async getRoleIdByName(roleName: string): Promise<Role | null> {
    const [rows] = await this.pool.query<RowDataPacket[] & Role[]>(
      `SELECT id FROM roles WHERE name = ?`,
      [roleName]
    );
    return rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[] & User[]>(
        `SELECT * FROM users WHERE email=?`,
        [email]
      );
      return rows[0] || null;
    } catch {
      throw new Error("Erreur lors de la récuperation de l'utilisateur");
    }
  }

  async getUserById(
    id: string
  ): Promise<Omit<
    User,
    "reset_token" | "reset_token_expiration" | "password"
  > | null> {
    try {
      const [rows] = await this.pool.query<any[]>(
        `
        SELECT u.id AS user_id, u.firstname, u.lastname, u.email, r.id AS role_id, r.name AS role_name
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = ?`,
        [id]
      );
      if (rows.length === 0) return null;

      const user: Omit<
        User,
        "reset_token" | "reset_token_expiration" | "password"
      > = {
        id: rows[0].user_id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        email: rows[0].email,
        roles: rows.map((row) => ({
          id: row.role_id,
          name: row.role_name,
        })),
      };

      return user;
    } catch {
      throw new Error("Erreur lors de la récuperation de l'utilisateur");
    }
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[] & User[]>(
        `SELECT * FROM users WHERE reset_token=?`,
        [token]
      );
      return rows[0] || null;
    } catch {
      throw new Error("Erreur lors de la récuperation de l'utilisateur");
    }
  }

  async register(
    user: Omit<User, "role" | "reset_token_expiration" | "reset_token"> & {
      role_id: number;
    }
  ) {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [userResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO users(id, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.firstname, user.lastname, user.email, user.password]
      );

      if (userResult.affectedRows === 0)
        throw new Error("Echec de la création de l'utilisateur");

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, role_id) VALUES (? , ?)`,
        [user.id, user.role_id]
      );

      if (roleResult.affectedRows === 0)
        throw new Error("Echec de l'attribution du role");

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
      throw new Error("Erreur lors de la mise a jour du mot de passe");
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
      throw new Error("Erreur lors de l'insertion des données");
    }
  }

  async deleteUserById(id: string) {
    try {
      await this.pool.query<ResultSetHeader>(`DELETE FROM users WHERE id=?`, [
        id,
      ]);
      return { ok: true };
    } catch {
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    }
  }
}
