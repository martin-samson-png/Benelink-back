import { Association } from "./association.model";
import { AssociationMember } from "./associationMember.model";

export interface Mission {
  id: number;
  association: Association;
  createdBy: AssociationMember;
  title: string;
  descr?: string;
  startDate: string;
  endDate: string;
  status: "open" | "closed";
  rate: number;
  createdAt: string;
  updatedAt: string;
}
