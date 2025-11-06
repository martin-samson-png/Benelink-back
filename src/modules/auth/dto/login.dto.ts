import { User } from "../../../models/users.model";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  user: Omit<User, "password" | "reset_token" | "reset_token_expiration">;
}
