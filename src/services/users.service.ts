import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model";
import { UserRepository } from "../repository/users.repository";
import { cleanUser } from "../utils/cleanUser";
import { sendEmail } from "../utils/sendEmail";
import { passwordResetEmail } from "../email/resetPassword";
import crypto from "node:crypto";
import { requestResetPassword } from "../email/requestResetPassword";
import { getRoleIdByName } from "../utils/roles.utils";
import { Pool } from "mysql2/promise";

type LoginInput = {
  email: string;
  password: string;
};
type LoginResponse = {
  user: Omit<User, "password">;
  token: string;
};

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly pool: Pool
  ) {}

  async getUserById(id: string): Promise<Omit<User, "password">> {
    if (!id) {
      throw new Error("Champ obligatoire manquant");
    }
    const user = await this.userRepository.getUserById(id);
    if (!user) throw new Error("Utilisateur non trouvé");

    const safeUser = cleanUser(user);
    if (!safeUser) throw new Error("Erreur lors du nettoyage de l'utilisateur");

    return safeUser;
  }

  async register(user: Omit<User, "id" | "role">) {
    if (!user.firstname || !user.lastname || !user.email || !user.password)
      throw new Error("Informations manquantes ou rôle invalide");

    const isEmailExist = await this.userRepository.getUserByEmail(user.email);
    if (isEmailExist) throw new Error("Email existant");

    const hashedPassword = await argon2.hash(user.password, {
      type: argon2.argon2id,
    });

    const userId = crypto.randomUUID();
    const roleId = await getRoleIdByName(this.pool, "user");
    if (!roleId) throw new Error("Role 'user' introuvable");

    await this.userRepository.register({
      id: userId,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: hashedPassword,
      role_id: roleId,
    });

    return { ok: true };
  }

  async login({ email, password }: LoginInput): Promise<LoginResponse> {
    if (!email || !password) throw new Error("Informations manquantes");

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new Error("Identifiants incorrects");

    const verifyPassword = await argon2.verify(user.password, password);
    if (!verifyPassword) throw new Error("Identifiants incorrects");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const safeUser = cleanUser(user);
    if (!safeUser) throw new Error("Erreur lors du nettoyage de l'utilisateur");

    return { token, user: safeUser };
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) {
    if (!token) throw new Error("Token manquant");
    if (!password) throw new Error("Mot de passe requis");

    const user = await this.userRepository.getUserByResetToken(token);
    if (!user) throw new Error("Token invalide");
    if (
      user.reset_token_expiration &&
      new Date(user.reset_token_expiration) < new Date()
    )
      throw new Error("Le liens de réinitialisation à expiré");

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const { html, text } = passwordResetEmail(user);

    await sendEmail({
      to: user.email,
      subject: "Confirmation de réinitialisation de votre mot de passe",
      html,
      text,
      replyTo: process.env.OWNER_EMAIL,
      tags: [{ name: "type", value: "password_reset_confirmation" }],
    });

    return await this.userRepository.resetPassword({
      token,
      password: hashedPassword,
    });
  }

  async saveResetToken(email: string) {
    if (!email) throw new Error("Email manquant");

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new Error("Email inexistant");

    const token = crypto.randomUUID();

    await this.userRepository.saveResetToken({ email, token });

    const resetLink = `${process.env.FRONT_URL}/reset-password?token=${token}`;

    const { html, text } = requestResetPassword({ user, resetLink });

    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html,
      text,
      replyTo: process.env.OWNER_EMAIL,
      tags: [{ name: "type", value: "password_reset_request" }],
    });

    return { ok: true };
  }

  async deleteUserById(userId: string) {
    if (!userId) throw new Error("Utilisateur non connecté");

    const user = await this.getUserById(userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    return await this.userRepository.deleteUserById(userId);
  }
}
