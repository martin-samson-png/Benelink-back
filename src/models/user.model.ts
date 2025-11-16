import { Role } from "./role.model";

export interface User {
  id: string;
  avatar?: string | null;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}
