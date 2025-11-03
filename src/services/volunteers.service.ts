import { Volunteer } from "../models/volunteers.model";
import { cleanVolunteer } from "../utils/cleanVolunteer";
import { VolunteersRepository } from "./../repository/volunteers.repository";

export class VolunteersService {
  private volunteersRepository: VolunteersRepository;
  constructor(volunteersRepository: VolunteersRepository) {
    this.volunteersRepository = volunteersRepository;
  }

  async createVolunteer(
    data: Omit<
      Volunteer,
      "id" | "experience" | "createdAt" | "updatedAt" | "rate"
    >
  ): Promise<Volunteer> {
    if (!data.city || !data.skills || !data.userId)
      throw new Error("Champs obligatoire manquante");

    const isVolunteerExisting =
      await this.volunteersRepository.getVolunteerByUserId(data.userId);
    if (isVolunteerExisting) throw new Error("Bénévoles déjà existant");

    const volunteer = await this.volunteersRepository.createVolunteer(data);

    const safeVolunteer = cleanVolunteer(volunteer);
    if (!safeVolunteer) throw new Error("Erreur lors du nettoyage du bénévole");

    return safeVolunteer;
  }
}
