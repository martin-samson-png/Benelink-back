import { Volunteer } from "../models/volunteers.model";

export const cleanVolunteer = (data: Volunteer | null): Volunteer | null => {
  if (!data) return null;
  const { skills: rawSkills, ...rest } = data;

  let skills: string[];

  if (typeof rawSkills === "string") {
    skills = safeParseStringArray(rawSkills);
  } else if (Array.isArray(rawSkills)) {
    skills = rawSkills;
  } else {
    skills = [];
  }

  return { ...rest, skills };
};

const safeParseStringArray = (json: string): string[] => {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
