import { User } from "../models/users.model";

export const cleanUser = (user: User | null): Omit<User, "password"> | null => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};
