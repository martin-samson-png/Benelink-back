import { Association } from "../models/association.model";
import { AssociationRow } from "../modules/associations/dto/association.row";

export const associationMapper = (rows: AssociationRow[]): Association => {
  const first = rows[0];

  return {
    id: first.id,
    assoName: first.asso_name,
    rna: first.rna,
    city: first.city,
    descr: first.descr,
    contactEmail: first.contact_email,
    websiteUrl: first.website_url,
    socialLink: first.social_link,
    rate: first.rate,
    verified: first.verified,
    createdAt: first.created_at,
    updatedAt: first.updated_at,
    members: rows.map((r) => ({
      role: r.role,
      user: {
        id: r.user_id,
        avatar: r.avatar,
        firstname: r.firstname,
        lastname: r.lastname,
        email: r.email,
        phone: r.phone,
      },
      joinedAt: r.joined_at,
    })),
  };
};
