export interface CreateMissionDTO {
  associationId: string;
  title: string;
  city: string;
  createdBy: string;
  descr?: string;
  startDate: string | Date;
  endDate: string | Date;
}
