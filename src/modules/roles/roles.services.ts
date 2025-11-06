import { RolesRepository } from "./roles.repository";

export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async getRoleIdByName(roleName: string): Promise<number | null> {
    if (!roleName) throw new Error("Le nom du rôle est requis.");

    const roleId = await this.rolesRepository.getRoleIdByName(roleName);
    if (!roleId) return null;

    return roleId;
  }
}
