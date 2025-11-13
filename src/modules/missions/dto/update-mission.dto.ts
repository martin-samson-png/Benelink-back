export interface UpdateMissionDTO {
  missionId: string;
  title?: string;
  city?: string;
  descr?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}
