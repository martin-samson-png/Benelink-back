import { User } from "./user.model";

export interface AuthUser extends User {
  password: string;
}
