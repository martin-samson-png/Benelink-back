import { AssociationMember } from "./associationMember.model";

export interface Association {
  id: string;
  assoName: string;
  rna: string;
  city: string;
  descr: string;
  websiteUrl?: string | null;
  socialLink?: string | null;
  contactEmail: string;
  verified: boolean;
  rate: number;
  createdAt: string;
  updatedAt: string;
  members: AssociationMember[];
}
