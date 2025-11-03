import { Role } from "./role.model";

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  roles: Role[];
  reset_token: string;
  reset_token_expiration: string;
}
