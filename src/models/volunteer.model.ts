import { Skill } from "./skill.model";
import { User } from "./user.model";

export interface Volunteer {
  id: string;
  city: string;
  experience: "novice" | "regular" | "expert";
  user: User;
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}
