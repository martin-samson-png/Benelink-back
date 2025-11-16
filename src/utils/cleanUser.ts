import { AuthUser } from "../models/auth.models";

export const cleanUser = (user: AuthUser): Omit<AuthUser, "password"> => {
  const { password, ...fields } = user;
  return fields;
};
