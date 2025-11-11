import DataNotFoundException from "../../exceptions/data.not.found";
import { RolesRepository } from "./roles.repository";

export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async getRoleIdByName(roleName: string): Promise<number> {
    if (!roleName) throw new Error("Le nom du rôle est requis.");

    const roleId = await this.rolesRepository.getRoleIdByName(roleName);
    if (!roleId)
      throw new DataNotFoundException(`Rôle '${roleName}' introuvable`);

    return roleId;
  }

  async deleteUserRoleByName(userId: string, roleName: string) {
    await this.getRoleIdByName(roleName);

    const result = await this.rolesRepository.deleteUserRoleByName(
      userId,
      roleName
    );
    if (result.affectedRows === 0)
      throw new DataNotFoundException(
        `L'utilisateur n'avait pas le rôle '${roleName}'`
      );

    return { ok: true, message: `Rôle '${roleName}' supprimé` };
  }
}
