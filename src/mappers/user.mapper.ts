import { User } from "../models/user.model";
import { UserRow } from "../modules/users/dto/user.row";

export const mapUser = (row: UserRow): User => ({
  id: row.id,
  firstname: row.firstname,
  lastname: row.lastname,
  email: row.email,
  avatar: row.avatar,
  phone: row.phone,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  roles: JSON.parse(row.roles).map((name: string) => ({ name })) ?? [],
});
