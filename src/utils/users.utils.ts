import { InternalServerException } from "../exceptions/internal.server.exception";
import { CleanUser, User } from "../models/users.model";

export const cleanUser = (user: User): CleanUser => {
  if (!user) throw new InternalServerException("Rien a nettoyer");

  const { password, reset_token, reset_token_expiration, ...safeUser } = user;

  return safeUser;
};
