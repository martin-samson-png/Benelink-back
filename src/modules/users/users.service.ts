import argon2 from "argon2";
import ArgumentRequiredException from "../../exceptions/argument.required";
import DataAlreadyExistException from "../../exceptions/data.already.exists";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UsersRepository } from "./users.repository";
import { RolesService } from "../roles/roles.services";
import DataNotFoundException from "./../../exceptions/data.not.found";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { User } from "../../models/user.model";
import { AuthUser } from "../../models/auth.models";
import ForbiddenException from "../../exceptions/forbidden";
import { ChangePasswordDTO } from "./dto/change-password.dto";

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService
  ) {}

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.usersRepository.getUserByEmail(email);
    return user;
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.getUserById(id);
    return user;
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    if (!data.firstname || !data.lastname || !data.email || !data.password)
      throw new ArgumentRequiredException("Informations manquantes");

    const isEmailExist = await this.getUserByEmail(data.email);
    if (isEmailExist) throw new DataAlreadyExistException("Email existant");

    const hashedPassword = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    const userId = crypto.randomUUID();
    const roleId = await this.rolesService.getRoleIdByName(
      data.role ?? "admin"
    );
    if (!roleId)
      throw new DataNotFoundException(`Rôle "${data.role}" introuvable `);

    return await this.usersRepository.createUser({
      id: userId,
      avatar: data.avatar,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      roleId: roleId,
    });
  }

  async getAllUsers() {
    const users = await this.usersRepository.getAllUsers();
    return users;
  }

  async updatePassword(data: ChangePasswordDTO & { userId: string }) {
    if (!data.oldPassword || !data.password)
      throw new ArgumentRequiredException("Champs obligatoire manquant");
    const currentUser = await this.usersRepository.getUserByIdRaw(data.userId);
    if (!currentUser) throw new DataNotFoundException("Utilisateur inexistant");

    const isOldPasswordValid = await argon2.verify(
      currentUser.password,
      data.oldPassword
    );
    if (!isOldPasswordValid)
      throw new ForbiddenException("Ancien mot de passe incorrect");

    const samePassord = await argon2.verify(
      currentUser.password,
      data.password
    );

    if (samePassord)
      throw new ArgumentRequiredException(
        "Le nouveau mot de passe doit être différent de l'ancien."
      );

    const hashedPassword = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    return await this.usersRepository.updatePassword({
      ...data,
      password: hashedPassword,
    });
  }

  async updateFields(data: UpdateUserDTO & { userId: string }) {
    const { userId, ...fields } = data;
    if (Object.keys(fields).length === 0)
      throw new ArgumentRequiredException("Champs obligatoire manquant");

    const currentUser = await this.getUserById(userId);
    if (!currentUser) throw new DataNotFoundException("Utilisateur inexistant");

    const updatePayload: UpdateUserDTO = {};

    if (fields.firstname && fields.firstname !== currentUser.firstname)
      updatePayload.firstname = fields.firstname;

    if (fields.lastname && fields.lastname !== currentUser.lastname)
      updatePayload.lastname = fields.lastname;

    if (fields.avatar && fields.avatar !== currentUser.avatar)
      updatePayload.avatar = fields.avatar;

    if (fields.phone && fields.phone !== currentUser.phone)
      updatePayload.phone = fields.phone;

    if (fields.email && fields.email !== currentUser.email) {
      const isEmailExist = await this.getUserByEmail(fields.email);
      if (isEmailExist && isEmailExist.id !== data.userId)
        throw new DataAlreadyExistException("Email existant");
      updatePayload.email = fields.email;
    }

    if (Object.keys(updatePayload).length === 0)
      throw new ArgumentRequiredException("Aucune donnée à mettre à jour");

    return await this.usersRepository.updateFields({
      ...updatePayload,
      userId,
    });
  }

  async deleteUserById({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }): Promise<{ ok: true }> {
    if (!password) throw new ArgumentRequiredException("Mot de passe requis");

    const currentUser = await this.usersRepository.getUserByIdRaw(userId);
    if (!currentUser) throw new Error("Utilisateur non trouvé");

    const isPasswordValid = await argon2.verify(currentUser.password, password);

    if (!isPasswordValid)
      throw new ForbiddenException("Mot de passe incorrect");

    return await this.usersRepository.deleteUserById(userId);
  }
}
