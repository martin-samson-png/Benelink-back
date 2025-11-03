import { User } from "../models/users.model";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
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

  async getUserById(id: string): Promise<User | null> {
    try {
      const [rows] = await this.pool.query<RowDataPacket[] & User[]>(
        `SELECT * FROM users WHERE id=?`,
        [id]
      );
      return rows[0] || null;
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

  async register(user: Omit<User, "id" | "role">): Promise<User> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO users(firstname, lastname, email, password) VALUES (?, ?, ?, ?)`,
        [user.firstname, user.lastname, user.email, user.password]
      );
      const userId = result.insertId;
      const [rows] = await this.pool.query<RowDataPacket[] & User[]>(
        `SELECT * FROM users WHERE id=?`,
        [userId]
      );

      return rows[0];
    } catch {
      throw new Error("Erreur lors de la création de l'utilisateur");
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
}
