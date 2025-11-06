import { User } from "../../models/users.model";
import { Pool, ResultSetHeader } from "mysql2/promise";
import { CreateUserDTO } from "./dto/create-user.dto";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { UpdateUserDTO } from "./dto/update-user.dto";

export class UsersRepository {
  constructor(private readonly pool: Pool) {}

  async getUserByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [rows] = await this.pool.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  async createUser(data: CreateUserDTO & { id: string; roleId: number }) {
    const connection = await this.pool.getConnection();
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
        throw new InternalServerException("Echec de l'attribution du rôle");

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

  async updateUser(data: Omit<UpdateUserDTO, "oldPassword">, userId: string) {
    try {
      const key = Object.keys(data);
      const values = Object.values(data);
      const setkey = key.map((k) => `${k} = ?`).join(", ");
      await this.pool.query<ResultSetHeader>(
        `UPDATE users SET ${setkey} WHERE id=?`,
        [...values, userId]
      );
      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de la modification de l'utilisateur"
      );
    }
  }

  async deleteUserById(userId: string) {
    try {
      await this.pool.query<ResultSetHeader>(`DELETE FROM users WHERE id=?`, [
        userId,
      ]);
      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de la suppression de l'utilisateur"
      );
    }
  }
}
