import { Association } from "./association.model";
import { User } from "./user.model";

export interface Invitations {
  id: number;
  token: string;
  association: Association;
  createdBy: User;
  usedBy?: User | null;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
}
