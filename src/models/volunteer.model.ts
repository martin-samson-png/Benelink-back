import { UserLight } from "./user-light.model";

export interface Volunteer {
  id: string;
  city: string;
  experience: "novice" | "regular" | "expert";
  user: UserLight;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}
