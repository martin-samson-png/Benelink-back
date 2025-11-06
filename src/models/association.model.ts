export interface Association {
  id: string;
  userId: string;
  asso_name: string;
  rna: string;
  verified: boolean;
  descr: string;
  website_url: string;
  social_link: string;
  contact_email: string;
  rate: number;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: number;
  token: string;
  associationId: string;
  created_by: string;
  used_by: string;
  email: string;
  expire_at: string;
}
