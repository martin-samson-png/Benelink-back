import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { UsersService } from "../users/users.service";
import { AuthRepository } from "./auth.repository";
import { User } from "../../models/user.model";
import { sendEmail } from "../../utils/sendEmail";
import { requestResetPassword } from "../email/requestResetPassword";
import { passwordResetEmail } from "../email/resetPassword";
import DataNotFoundException from "../../exceptions/data.not.found";
import ArgumentRequiredException from "../../exceptions/argument.required";
import UnauthorizedException from "../../exceptions/unauthorized";
import { CreateUserDTO } from "../users/dto/create-user.dto";
import { cleanUser } from "../../utils/cleanUser";
import { AuthUser } from "../../models/auth.models";

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService
  ) {}

  async getAuthentificated(userId: string): Promise<User> {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur inexistant");
    return user;
  }

  async register(data: Omit<CreateUserDTO, "role">) {
    const user = await this.usersService.createUser({
      ...data,
      role: "user",
    });

    return user;
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: Omit<AuthUser, "password"> }> {
    if (!email || !password)
      throw new ArgumentRequiredException("Informations manquantes");

    const user = await this.usersService.getUserByEmail(email);

    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const verifyPassword = await argon2.verify(user.password, password);
    if (!verifyPassword)
      throw new ArgumentRequiredException("Identifiants incorrects");

    const safeUser = cleanUser(user);

    const token = jwt.sign(
      { id: user.id, roles: user.roles },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { token, user: safeUser };
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }): Promise<{ ok: true }> {
    if (!token) throw new ArgumentRequiredException("Token manquant");
    if (!password) throw new ArgumentRequiredException("Mot de passe requis");

    const user = await this.authRepository.getUserByResetToken(token);

    if (!user) throw new UnauthorizedException("Token invalide");
    if (
      user.reset_token_expiration &&
      new Date(user.reset_token_expiration) < new Date()
    )
      throw new UnauthorizedException("Le lien de réinitialisation à expiré");

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const result = await this.authRepository.resetPassword({
      token,
      password: hashedPassword,
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

    return result;
  }

  async saveResetToken(email: string): Promise<{ ok: true }> {
    if (!email) throw new ArgumentRequiredException("Email manquant");

    const user = await this.usersService.getUserByEmail(email);
    if (user) {
      const token = crypto.randomUUID();

      await this.authRepository.saveResetToken({ email, token });

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
    }
    return { ok: true };
  }
}
