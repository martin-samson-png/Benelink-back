export interface MissionWithDetailsDTO {
  id: string;
  title: string;
  descr: string;
  missionCity: string;
  startDate: string;
  endDate: string;
  status: string;
  rate: number | null;
  createdAt: string;
  updatedAt: string;

  userId: string;
  firstname: string;
  lastname: string;
  email: string;

  assoId: string;
  name: string;
  description: string | null;
  assoCity: string;
  websiteUrl: string | null;
  socialLink: string | null;
}
