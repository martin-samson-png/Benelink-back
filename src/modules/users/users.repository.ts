import { User } from "../../models/user.model";
import {
  Pool,
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { mapUser } from "../../mappers/user.mapper";
import { UserRow } from "./dto/user.row";
import { CreateUserRepositoryDTO } from "./dto/create-user-repository.dto";
import { AuthUser } from "../../models/auth.models";
import { mapAuthUser } from "../../mappers/auth.mapper";
import { ChangePasswordDTO } from "./dto/change-password.dto";

export class UsersRepository {
  constructor(private readonly pool: Pool) {}

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const [rows] = await this.pool.query<(UserRow & RowDataPacket)[]>(
      `SELECT u.*, JSON_ARRAYAGG(r.name) AS roles FROM users u JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id WHERE u.email=? GROUP BY u.id`,
      [email]
    );

    if (rows.length === 0) return null;

    return mapAuthUser(rows[0]);
  }

  async getUserByIdRaw(id: string): Promise<AuthUser | null> {
    const [rows] = await this.pool.query<(UserRow & RowDataPacket)[]>(
      `SELECT u.*, JSON_ARRAYAGG(r.name) AS roles FROM users u JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id WHERE u.id=? GROUP BY u.id`,
      [id]
    );
    if (rows.length === 0) return null;
    return mapAuthUser(rows[0]);
  }

  async getUserById(id: string): Promise<User | null> {
    const [rows] = await this.pool.query<(UserRow & RowDataPacket)[]>(
      `SELECT u.*, JSON_ARRAYAGG(r.name) AS roles FROM users u JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id WHERE u.id=? GROUP BY u.id`,
      [id]
    );
    if (rows.length === 0) return null;
    return mapUser(rows[0]);
  }

  async getAllUsers(): Promise<User[]> {
    const [rows] = await this.pool.query<(RowDataPacket & UserRow)[]>(
      `SELECT u.*, JSON_ARRAYAGG(r.name) AS roles FROM users u JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id GROUP BY u.id`
    );
    return rows.map((r) => mapUser(r));
  }

  async createUser(data: CreateUserRepositoryDTO): Promise<User> {
    const connection: PoolConnection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [userResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO users(id, avatar, firstname, lastname, email, password, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          data.avatar ?? null,
          data.firstname,
          data.lastname,
          data.email,
          data.password,
          data.phone ?? null,
        ]
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

      const [rows] = await this.pool.query<(RowDataPacket & UserRow)[]>(
        `SELECT u.*, JSON_ARRAYAGG(r.name) AS roles FROM users u JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id WHERE u.id=? GROUP BY u.id`,
        [data.id]
      );

      if (!rows.length)
        throw new InternalServerException(
          "Utilisateur introuvable après insertion"
        );

      return mapUser(rows[0]);
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Erreur transaction", err);
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async updatePassword(
    data: ChangePasswordDTO & { userId: string }
  ): Promise<User> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET password=? WHERE id=?`,
      [data.password, data.userId]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la mise à jour du mot de passe"
      );
    const [rows] = await this.pool.query<(RowDataPacket & UserRow)[]>(
      `SELECT u.*, JSON_ARRAYAGG(r.name) AS roles FROM users u JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id WHERE u.id=? GROUP BY u.id`,
      [data.userId]
    );
    if (rows.length === 0)
      throw new InternalServerException(
        "Utilisateur introuvable après modification"
      );
    return mapUser(rows[0]);
  }

  async updateFields(data: UpdateUserDTO & { userId: string }): Promise<User> {
    const { userId, ...fields } = data;
    const key = Object.keys(fields);
    const values = Object.values(fields);
    const setkey = key.map((k) => `${k} = ?`).join(", ");
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET ${setkey} WHERE id=?`,
      [...values, userId]
    );

    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la modification de l'utilisateur"
      );
    const [rows] = await this.pool.query<(RowDataPacket & UserRow)[]>(
      `SELECT u.*, JSON_ARRAYAGG(r.name) AS roles FROM users u JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id WHERE u.id=? GROUP BY u.id`,
      [userId]
    );
    if (rows.length === 0)
      throw new InternalServerException(
        "Utilisateur introuvable après modification de l'utilisateur"
      );
    return mapUser(rows[0]);
  }

  async deleteUserById(userId: string): Promise<{ ok: true }> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE FROM users WHERE id=?`,
      [userId]
    );
    if (result.affectedRows === 0)
      throw new InternalServerException(
        "Erreur lors de la suppression de l'utilisateur"
      );
    return { ok: true };
  }
}
