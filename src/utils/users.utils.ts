import { User } from "../models/users.model";

export const cleanUser = (
  user: User | null
): Omit<User, "reset_token" | "reset_token_expiration" | "password"> | null => {
  if (!user) return null;

  const { password, reset_token, reset_token_expiration, ...safeUser } = user;

  return safeUser;
};
