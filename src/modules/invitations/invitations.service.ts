import ArgumentRequiredException from "../../exceptions/argument.required";
import DataNotFoundException from "../../exceptions/data.not.found";
import ForbiddenException from "../../exceptions/forbidden";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { TooManyRequestsException } from "../../exceptions/to.many.request.exception";
import { sendEmail } from "../../utils/sendEmail";
import { AssociationsService } from "../associations/associations.service";
import { invitationEmail } from "../email/invitation.email";
import { RolesService } from "../roles/roles.services";
import { UsersService } from "../users/users.service";
import { AcceptInvitationDTO } from "./dto/accept-invitation.dto";
import { CreateInvitationDTO } from "./dto/create-invitation.dto";
import { InvitationsRepository } from "./invitations.repository";
import crypto from "node:crypto";

export class InvitationsService {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly usersService: UsersService,
    private readonly associationsService: AssociationsService,
    private readonly rolesService: RolesService
  ) {}

  async createInvitation(data: CreateInvitationDTO) {
    if (!data.email || !data.associationId || !data.createdBy)
      throw new ArgumentRequiredException("Champs obligatoire manquant");

    const user = await this.usersService.findById(data.createdBy);
    if (!user) throw new DataNotFoundException("Utilisateur inexistant");

    const association = await this.associationsService.getAssociationById(
      data.associationId
    );

    if (!association) {
      throw new DataNotFoundException("Associations inexistante");
    }

    const count = await this.invitationsRepository.countUserInvitation(
      data.associationId,
      data.email
    );

    if (count >= 2)
      throw new TooManyRequestsException(
        "Limite d'envois d'invitation atteinte pour aujourd'hui"
      );

    const token = crypto.randomBytes(32).toString("hex");

    const invitation_link = `${process.env.FRONT_URL}/invitation/accept?token=${token}`;

    const user_name = `${user.firstname} ${user.lastname}`;

    const { html, text } = invitationEmail({
      asso_name: association.asso_name,
      user_name,
      invitation_link,
    });

    await sendEmail({
      to: data.email,
      subject: `Invitation à rejoindre l'association ${association.asso_name}`,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL,
      tags: [{ name: "type", value: "association_invitation" }],
    });

    const result = await this.invitationsRepository.createInvitation({
      token,
      ...data,
    });
    if (result.affectedRows === 0)
      throw new InternalServerException("Echec de la création de l'invitation");

    const invitation = await this.invitationsRepository.getInvitationByToken(
      token
    );
    return invitation;
  }

  async acceptInvitation(
    data: Omit<AcceptInvitationDTO, "option" | "roleId" | "associationId">
  ) {
    if (!data.token || !data.userId)
      throw new ArgumentRequiredException("Champs manquant");

    const user = await this.usersService.getUserById(data.userId);

    const invitation = await this.invitationsRepository.getInvitationByToken(
      data.token
    );

    if (!invitation) throw new DataNotFoundException("Invitation introuvable");

    if (user.email !== invitation.email)
      throw new ForbiddenException(
        "Vous ne pouvez pas accepter cette invitation"
      );

    if (invitation.status !== "pending")
      throw new ForbiddenException("Vous avez déjà accepté l'invitation");

    if (new Date(invitation.expires_at) < new Date())
      throw new ForbiddenException("Invitation expirée");

    const isInvitationAccept =
      await this.invitationsRepository.getMemberAssociationById(
        data.userId,
        invitation.association_id
      );

    if (isInvitationAccept)
      throw new ForbiddenException(
        "Vous êtes déjà membre de cette association"
      );

    const roleId = await this.rolesService.getRoleIdByName("asso_member");

    const isAlreadyAssoMember = await this.rolesService.getUserRole(
      data.userId,
      roleId
    );

    const nextData: AcceptInvitationDTO = isAlreadyAssoMember
      ? { ...data, associationId: invitation.association_id }
      : {
          ...data,
          associationId: invitation.association_id,
          roleId,
          option: { shouldAddRole: true },
        };

    return await this.invitationsRepository.acceptInvitation(nextData);
  }
}
