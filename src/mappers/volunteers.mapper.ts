import { VolunteerRow } from "../modules/volunteers/dto/volunteer.rows";
import { Volunteer } from "./../models/volunteer.model";

export const mapVolunteer = (row: VolunteerRow): Volunteer => ({
  id: row.id,
  city: row.city,
  experience: row.experience,
  skills: row.skills ? JSON.parse(row.skills) : [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  user: {
    id: row.user_id,
    avatar: row.avatar,
    firstname: row.firstname,
    lastname: row.lastname,
    email: row.email,
    phone: row.phone,
  },
});
