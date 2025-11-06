import crypto from "node:crypto";
import { AssociationsRepository } from "./associations.repository";
import { Association } from "../../models/association.model";
import { verifyRNa } from "../../utils/verifyRna";
import { invitationEmail } from "../email/invitation.email";
import { sendEmail } from "../../utils/sendEmail";
import { RolesService } from "../roles/roles.services";
import { UserService } from "../users/users.service";

export class AssociationsService {
  constructor(
    private readonly associationsRepo: AssociationsRepository,
    private readonly rolesService: RolesService,
    private readonly usersService: UserService
  ) {}

  async createAssociation(
    data: Omit<
      Association,
      "id" | "verified" | "created_at" | "updated_at" | "rate"
    >
  ) {
    if (
      !data.userId ||
      !data.asso_name ||
      !data.rna ||
      !data.city ||
      !data.contact_email
    )
      throw new Error("Champs obligatoire manquant");

    const checkRNA = await verifyRNa(data.rna);
    if (!checkRNA.verified) throw new Error("Numéro RNA invalide");

    const asso_id = crypto.randomUUID();
    const role_id = await this.rolesService.getRoleIdByName("asso_member");
    if (!role_id) throw new Error("Role 'asso_member' introuvable");

    await this.associationsRepo.createAssociation({
      id: asso_id,
      userId: data.userId,
      asso_name: data.asso_name,
      rna: data.rna,
      descr: data.descr,
      website_url: data.website_url,
      social_link: data.social_link,
      city: data.city,
      contact_email: data.contact_email,
      role_id,
    });

    return { ok: true };
  }

  async createInviation(email: string, associationId: string, userId: string) {
    if (!email || !associationId || !userId)
      throw new Error("Champs obligatoire manquant");

    const user = await this.usersService.findById(userId);
    if (!user) throw new Error("Utilisateur inexistant");

    const association = await this.associationsRepo.getAssociationById(
      associationId
    );
    if (!association) {
      throw new Error("Associations inexistante");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invitation_link = `${process.env.FRONT_URL}/invitation/accept?token=${token}`;

    const user_name = `${user.firstname} ${user.lastname}`;

    const { html, text } = invitationEmail({
      asso_name: association.asso_name,
      user_name,
      invitation_link,
    });

    await sendEmail({
      to: email,
      subject: `Invitation à rejoindre l'association ${association.asso_name}`,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL,
      tags: [{ name: "type", value: "association_invitation" }],
    });

    await this.associationsRepo.createInvitation({
      token,
      associationId,
      created_by: userId,
      email,
    });
  }
}
