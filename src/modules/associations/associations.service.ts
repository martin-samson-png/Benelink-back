import crypto from "node:crypto";
import { AssociationsRepository } from "./associations.repository";
import { Association } from "../../models/association.model";
import { verifyRNa } from "../../utils/verifyRna";

import { RolesService } from "../roles/roles.services";
import { UsersService } from "../users/users.service";
import DataNotFoundException from "../../exceptions/data.not.found";
import { CreateAssociationDTO } from "./dto/create-association.dto";
import DataAlreadyExistException from "../../exceptions/data.already.exists";
import ArgumentRequiredException from "../../exceptions/argument.required";
import { UpdateAssociationDTO } from "./dto/update-association.dto";
import ForbiddenException from "../../exceptions/forbidden";
import { InternalServerException } from "../../exceptions/internal.server.exception";

export class AssociationsService {
  constructor(
    private readonly associationsRepository: AssociationsRepository,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService
  ) {}

  async getAssociationById(assoId: string): Promise<Association> {
    const association = await this.associationsRepository.getAssociationById(
      assoId
    );
    if (!association)
      throw new DataNotFoundException("Aucune association trouvé");

    return association;
  }

  async getAllAssociations(): Promise<Association[] | []> {
    return await this.associationsRepository.getAllAssociations();
  }

  async findMemberInAssociation(userId: string, associationId: string) {
    const member = await this.associationsRepository.findMemberInAssociation(
      userId,
      associationId
    );
    if (!member)
      throw new ForbiddenException(
        "Accès refusé :  Vous ne faites pas partis de l'association"
      );
    return member;
  }

  async createAssociation(data: CreateAssociationDTO) {
    if (!data.asso_name || !data.rna || !data.city || !data.contact_email)
      throw new ArgumentRequiredException("Champs obligatoire manquant");

    const user = await this.usersService.findById(data.userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const isRnaUsed = await this.associationsRepository.getAssociationByRNA(
      data.rna
    );
    if (isRnaUsed)
      throw new DataAlreadyExistException("Numéro RNA déjà utilisé");

    const checkRNA = await verifyRNa(data.rna);
    if (!checkRNA.verified)
      throw new ArgumentRequiredException("Numéro RNA invalide");

    const asso_id = crypto.randomUUID();
    const role_id = await this.rolesService.getRoleIdByName("asso_member");

    await this.associationsRepository.createAssociation({
      id: asso_id,
      role_id,
      ...data,
    });

    return await this.getAssociationById(asso_id);
  }

  async updateAssociation(data: UpdateAssociationDTO & { userId: string }) {
    if (!data.id) throw new ArgumentRequiredException("Id manquante");

    const { id, userId, ...fields } = data;
    if (!Object.keys(fields).length)
      throw new ArgumentRequiredException("Aucune donnée à mettre à jour");

    const association = await this.getAssociationById(data.id);
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    const member = await this.findMemberInAssociation(data.userId, data.id);

    if (!["owner", "admin_asso"].includes(member.role))
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour modifier cette association"
      );

    const result = await this.associationsRepository.updateAssociation({
      id,
      ...fields,
    });
    if (result.affectedRows === 0)
      throw new DataNotFoundException("Association introuvable ou inchangée");

    return await this.getAssociationById(data.id);
  }

  async deleteAssociation(userId: string, associationId: string) {
    if (!associationId) throw new ArgumentRequiredException("Id manquante");

    const role = await this.associationsRepository.findMemberInAssociation(
      userId,
      associationId
    );
    if (!role)
      throw new ForbiddenException(
        "Accès refusé :  Vous ne faites pas partis de l'association"
      );
    if (!["owner"].includes(role.role))
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour supprimer cette association"
      );

    const members = await this.associationsRepository.getMembersByAssociation(
      associationId
    );

    const result = await this.associationsRepository.deleteAssociation(
      associationId
    );
    if (result.affectedRows === 0)
      throw new InternalServerException("Association introuvable");

    await Promise.all(
      members.map(async (member) => {
        const count = await this.associationsRepository.countAssociationsByUser(
          member.user_id
        );
        if (count === 0)
          await this.rolesService.deleteUserRoleByName(
            member.user_id,
            "asso_member"
          );
      })
    );
  }
}
