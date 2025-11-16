import { AuthUser } from "../models/auth.models";
import { UserRow } from "../modules/users/dto/user.row";

export const mapAuthUser = (row: UserRow): AuthUser => ({
  id: row.id,
  firstname: row.firstname,
  lastname: row.lastname,
  email: row.email,
  avatar: row.avatar ?? null,
  phone: row.phone ?? null,
  password: row.password,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  roles: JSON.parse(row.roles).map((name: string) => ({ name })),
});
