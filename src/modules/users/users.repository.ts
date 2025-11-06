import { User } from "../../models/users.model";
import { Pool, ResultSetHeader } from "mysql2/promise";
import { CreateUserDTO } from "./dto/create-user.dto";
import { InternalServerException } from "../../exceptions/internal.server.exception";

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
        `INSERT INTO user(id, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`,
        [data.id, data.firstname, data.lastname, data.email, data.password]
      );
      if (userResult.affectedRows === 0)
        throw new InternalServerException(
          "Echec de la création de l'utilisateur"
        );

      const [roleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO user_roles(user_id, roleId) VALUES (? , ?)`,
        [data.id, data.roleId]
      );
      if (roleResult.affectedRows === 0)
        throw new InternalServerException("Echec de l'attribution du rôle");

      await connection.commit();
      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de la création de l'utilisateur"
      );
    }
  }

  async deleteUserById(id: string) {
    try {
      await this.pool.query<ResultSetHeader>(`DELETE FROM users WHERE id=?`, [
        id,
      ]);
      return { ok: true };
    } catch {
      throw new InternalServerException(
        "Erreur lors de la suppression de l'utilisateur"
      );
    }
  }
}
