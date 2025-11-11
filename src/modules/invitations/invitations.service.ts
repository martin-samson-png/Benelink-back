import ArgumentRequiredException from "../../exceptions/argument.required";
import DataNotFoundException from "../../exceptions/data.not.found";
import { InternalServerException } from "../../exceptions/internal.server.exception";
import { TooManyRequestsException } from "../../exceptions/to.many.request.exception";
import { sendEmail } from "../../utils/sendEmail";
import { AssociationsService } from "../associations/associations.service";
import { invitationEmail } from "../email/invitation.email";
import { UsersService } from "../users/users.service";
import { CreateInvitationDTO } from "./dto/create-invitation.dto";
import { InvitationsRepository } from "./invitations.repository";
import crypto from "node:crypto";

export class InvitationsService {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly usersService: UsersService,
    private readonly associationsService: AssociationsService
  ) {}

  async createInviation(data: CreateInvitationDTO) {
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
}
