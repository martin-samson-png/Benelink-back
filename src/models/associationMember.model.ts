import { User } from "./user.model";

export interface AssociationMember {
  id: string;
  user: User;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}
