export interface CreateAssociationDTO {
  userId: string;
  asso_name: string;
  rna: string;
  descr?: string;
  website_url?: string;
  social_link?: string;
  contact_email: string;
  city: string;
}
