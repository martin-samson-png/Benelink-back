export interface AssociationRow {
  id: string;
  asso_name: string;
  rna: string;
  city: string;
  descr: string;
  contact_email: string;
  website_url: string | null;
  social_link: string | null;
  verified: boolean;
  rate: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  avatar: string | null;
  firstname: string;
  lastname: string;
  role: string;
  email: string;
  phone: string | null;
  joined_at: string;
}
