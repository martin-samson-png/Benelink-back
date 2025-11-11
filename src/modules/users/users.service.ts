import argon2 from "argon2";
import ArgumentRequiredException from "../../exceptions/argument.required";
import DataAlreadyExistException from "../../exceptions/data.already.exists";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UsersRepository } from "./users.repository";
import { RolesService } from "../roles/roles.services";
import DataNotFoundException from "./../../exceptions/data.not.found";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { cleanUser } from "../../utils/users.utils";
import { CleanUser } from "../../models/users.model";

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService
  ) {}

  async findByEmail(email: string) {
    const user = await this.usersRepository.getUserByEmail(email);

    return user;
  }

  async findById(id: string) {
    const user = await this.usersRepository.getUserById(id);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    return user;
  }

  async createUser(data: CreateUserDTO) {
    if (!data.firstname || !data.lastname || !data.email || !data.password)
      throw new ArgumentRequiredException("Champs manquant obligatoire");

    const isEmailExist = await this.findByEmail(data.email);
    if (isEmailExist) throw new DataAlreadyExistException("Email existant");

    const hashedPassword = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    const id = crypto.randomUUID();
    const roleId = await this.rolesService.getRoleIdByName("admin");
    if (!roleId) throw new DataNotFoundException("Rôle 'admin' introuvable");

    await this.usersRepository.createUser({
      id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: hashedPassword,
      roleId,
    });
  }

  async getUserById(userId: string) {
    if (!userId) throw new ArgumentRequiredException("Champs manquant");

    const user = await this.findById(userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    return cleanUser(user);
  }

  async getAllUsers(): Promise<CleanUser[]> {
    const users = await this.usersRepository.getAllUsers();

    return users.map(cleanUser);
  }

  async updateUser(data: UpdateUserDTO, userId: string) {
    if (!data || Object.keys(data).length === 0)
      throw new ArgumentRequiredException("Champs obligatoire manquant");

    if (!data.oldPassword)
      throw new ArgumentRequiredException("Ancien mot de passe requis");

    const currentUser = await this.findById(userId);
    if (!currentUser) throw new DataNotFoundException("Utilisateur inexistant");

    const verifyPassword = await argon2.verify(
      currentUser.password,
      data.oldPassword
    );
    if (!verifyPassword)
      throw new ArgumentRequiredException("Mot de passe incorrect");

    const updatePayload: Partial<UpdateUserDTO> = {};

    if (data.firstname) updatePayload.firstname = data.firstname;
    if (data.lastname) updatePayload.lastname = data.lastname;

    if (data.email) {
      const isEmailExist = await this.findByEmail(data.email);
      if (isEmailExist && isEmailExist.id !== userId)
        throw new DataAlreadyExistException("Email existant");
      updatePayload.email = data.email;
    }

    if (data.password) {
      const hashedPassword = await argon2.hash(data.password, {
        type: argon2.argon2id,
      });
      updatePayload.password = hashedPassword;
    }

    if (Object.keys(updatePayload).length === 0)
      throw new ArgumentRequiredException("Aucune donnée à mettre à jour");

    return await this.usersRepository.updateUser(updatePayload, userId);
  }

  async deleteUserById(userId: string) {
    const user = await this.findById(userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    return await this.usersRepository.deleteUserById(userId);
  }
}
