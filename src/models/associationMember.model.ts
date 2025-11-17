import { UserLight } from "./user-light.model";

export interface AssociationMember {
  user: UserLight;
  role: string;
  joinedAt: string;
}
