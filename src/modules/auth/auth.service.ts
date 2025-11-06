import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { UserService } from "../users/users.service";
import { AuthRepository } from "./auth.repository";
import { RolesService } from "../roles/roles.services";
import { User } from "./../../models/users.model";
import { cleanUser } from "../../utils/users.utils";
import { sendEmail } from "../../utils/sendEmail";
import { requestResetPassword } from "../email/requestResetPassword";
import { passwordResetEmail } from "../email/resetPassword";
import DataNotFoundException from "../../exceptions/data.not.found";
import ArgumentRequiredException from "../../exceptions/argument.required";
import DataAlreadyExistException from "../../exceptions/data.already.exists";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import UnauthorizedException from "../../exceptions/unauthorized";
import { RegisterDTO } from "./dto/register.dto";
import { LoginDTO, LoginResponseDTO } from "./dto/login.dto";

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UserService,
    private readonly rolesService: RolesService
  ) {}

  async getAuthenticatedUser(
    userId: string
  ): Promise<Omit<
    User,
    "reset_token" | "reset_token_expiration" | "password"
  > | null> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur inexistant");

    return cleanUser(user);
  }

  async register(user: RegisterDTO) {
    if (!user.firstname || !user.lastname || !user.email || !user.password)
      throw new ArgumentRequiredException("Informations manquantes");

    const isEmailExist = await this.usersService.findByEmail(user.email);
    if (isEmailExist) throw new DataAlreadyExistException("Email existant");

    const hashedPassword = await argon2.hash(user.password, {
      type: argon2.argon2id,
    });

    const userId = crypto.randomUUID();
    const roleId = await this.rolesService.getRoleIdByName("user");
    if (!roleId) throw new DataNotFoundException("Role 'user' introuvable");

    await this.authRepository.register({
      id: userId,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: hashedPassword,
      roleId: roleId,
    });

    return { ok: true };
  }

  async login({ email, password }: LoginDTO): Promise<LoginResponseDTO> {
    if (!email || !password)
      throw new ArgumentRequiredException("Informations manquantes");

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const verifyPassword = await argon2.verify(user.password, password);
    if (!verifyPassword)
      throw new ArgumentRequiredException("Identifiants incorrects");

    const token = jwt.sign(
      { id: user.id, role: user.roles },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const safeUser = cleanUser(user);
    if (!safeUser)
      throw new InternalServerException(
        "Erreur lors du nettoyage de l'utilisateur"
      );

    return { token, user: safeUser };
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) {
    if (!token) throw new ArgumentRequiredException("Token manquant");
    if (!password) throw new ArgumentRequiredException("Mot de passe requis");

    const user = await this.authRepository.getUserByResetToken(token);
    if (!user) throw new UnauthorizedException("Token invalide");
    if (
      user.reset_token_expiration &&
      new Date(user.reset_token_expiration) < new Date()
    )
      throw new UnauthorizedException("Le liens de réinitialisation à expiré");

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

    return await this.authRepository.resetPassword({
      token,
      password: hashedPassword,
    });
  }

  async saveResetToken(email: string) {
    if (!email) throw new ArgumentRequiredException("Email manquant");

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new DataNotFoundException("Email inexistant");

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

    return { ok: true };
  }
}
