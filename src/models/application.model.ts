import { Mission } from "./mission.model";
import { Volunteer } from "./volunteer.model";

export interface Application {
  id: number;
  volunteer: Volunteer;
  mission: Mission;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}
