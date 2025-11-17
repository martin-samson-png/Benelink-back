export interface VolunteerRow {
  id: string;
  city: string;
  skills: string;
  experience: "novice" | "regular" | "expert";
  created_at: string;
  updated_at: string;
  user_id: string;
  avatar: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
}
