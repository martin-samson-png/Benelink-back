export interface Volunteer {
  id: string;
  userId: string;
  city: string;
  skills: string[];
  experience: "novice" | "regular" | "expert";
  createdAt: string;
  updatedAt: string;
  rate: number;
}
