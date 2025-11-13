export interface Missions {
  id: number;
  associationId: string;
  createdBy: string;
  title: string;
  descr?: string;
  startDate: string;
  endDate: string;
  status: "open" | "close";
  rate: number;
  createdAt: string;
  updatedAt: string;
}
