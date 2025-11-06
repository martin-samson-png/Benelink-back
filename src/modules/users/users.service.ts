import { UsersRepository } from "./users.repository";

export class UserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string) {
    const user = await this.usersRepository.getUserByEmail(email);

    return user;
  }

  async findById(id: string) {
    const user = await this.usersRepository.getUserById(id);
    if (!user) throw new Error("Utilisateur introuvable");

    return user;
  }

  async deleteUserById(userId: string) {
    if (!userId) throw new Error("Utilisateur non connecté");

    const user = await this.findById(userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    return await this.usersRepository.deleteUserById(userId);
  }
}
