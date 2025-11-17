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

  async createAssociation(data: CreateAssociationDTO) {
    if (!data.assoName || !data.rna || !data.city || !data.contactEmail)
      throw new ArgumentRequiredException("Champs obligatoire manquant");

    const user = await this.usersService.getUserById(data.userId);
    if (!user) throw new DataNotFoundException("Utilisateur introuvable");

    const isRnaUsed = await this.associationsRepository.getAssociationByRNA(
      data.rna
    );

    if (isRnaUsed)
      throw new DataAlreadyExistException("Numéro RNA déjà utilisé");

    const checkRNA = await verifyRNa(data.rna);
    if (!checkRNA.verified)
      throw new ArgumentRequiredException("Numéro RNA invalide");

    const assoMemberId = crypto.randomUUID();
    const associationId = crypto.randomUUID();
    const roleId = await this.rolesService.getRoleIdByName("asso_member");

    return await this.associationsRepository.createAssociation({
      id: associationId,
      assoMemberId,
      roleId,
      ...data,
    });
  }

  async updateAssociation(
    data: UpdateAssociationDTO & { userId: string; associationId: string }
  ): Promise<Association> {
    const { associationId, userId, ...fields } = data;
    if (!associationId)
      throw new ArgumentRequiredException("AssociationId manquant");
    if (!Object.keys(fields).length)
      throw new ArgumentRequiredException("Aucune donnée à mettre à jour");

    const association = await this.getAssociationById(associationId);
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    const member = association.members.find((m) => m.user.id === userId);
    if (!member)
      throw new ForbiddenException(
        "Vous ne faites pas partie de l'association"
      );

    if (!["owner", "admin_asso"].includes(member.role))
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour modifier cette association"
      );

    const updatePlayload: UpdateAssociationDTO = {};

    if (fields.assoName && fields.assoName !== association.assoName)
      updatePlayload.assoName = fields.assoName;
    if (fields.city && fields.city !== association.city)
      updatePlayload.city = fields.city;
    if (fields.contactEmail && fields.contactEmail !== association.contactEmail)
      updatePlayload.contactEmail = fields.contactEmail;
    if (fields.descr && fields.descr !== association.descr)
      updatePlayload.descr = fields.descr;
    if (fields.socialLink && fields.socialLink !== association.socialLink)
      updatePlayload.socialLink = fields.socialLink;
    if (fields.websiteUrl && fields.websiteUrl !== association.websiteUrl)
      updatePlayload.websiteUrl = fields.websiteUrl;

    if (!Object.keys(updatePlayload).length)
      throw new ArgumentRequiredException("Aucun champs a changer");

    return await this.associationsRepository.updateAssociation({
      associationId,
      ...updatePlayload,
    });
  }

  async banAssoMember({
    userId,
    banId,
    associationId,
  }: {
    userId: string;
    banId: string;
    associationId: string;
  }): Promise<{ ok: true }> {
    if (!associationId)
      throw new ArgumentRequiredException("AssociationId manqant");
    const association = await this.associationsRepository.getAssociationById(
      associationId
    );
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    const members = association.members.find((m) => m.user.id === userId);
    if (!members)
      throw new ForbiddenException(
        "Vous ne faites pas partie de l'association"
      );
    if (!["owner", "admin_asso"].includes(members.role))
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour bannir un utilisateur"
      );
    return await this.associationsRepository.banAssoMember({
      banId,
      associationId,
    });
  }

  async deleteAssociation({
    userId,
    associationId,
  }: {
    userId: string;
    associationId: string;
  }): Promise<{ ok: true }> {
    if (!associationId) throw new ArgumentRequiredException("Id manquante");

    const association = await this.associationsRepository.getAssociationById(
      associationId
    );
    if (!association)
      throw new DataNotFoundException("Association introuvable");

    const member = association.members.find((m) => m.user.id === userId);
    if (!member)
      throw new ForbiddenException(
        "Vous ne faites pas partis de l'association"
      );
    if (member.role !== "owner")
      throw new ForbiddenException(
        "Vous n'avez pas les droits pour supprimer cette association"
      );

    const result = await this.associationsRepository.deleteAssociation(
      associationId
    );

    await Promise.all(
      association.members.map(async (member) => {
        const count = await this.associationsRepository.countAssociationsByUser(
          member.user.id
        );
        if (count === 0)
          await this.rolesService.deleteUserRoleByName(
            member.user.id,
            "asso_member"
          );
      })
    );
    return result;
  }
}
