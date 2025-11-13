export interface Application {
  id: number;
  volunteerId: string;
  missionId: number;
  status: "pending" | "accept" | "reject";
  createdAt: string;
}
