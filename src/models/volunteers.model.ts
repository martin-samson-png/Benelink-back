import { Skills } from "./skills.model";

export interface Volunteer {
  id: string;
  userId: string;
  city: string;
  skills: Skills[];
  experience: "novice" | "regular" | "expert";
  createdAt: string;
  updatedAt: string;
  rate: number;
}
