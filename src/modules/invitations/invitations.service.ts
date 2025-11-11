  async createInviation(email: string, associationId: string, userId: string) {
    if (!email || !associationId || !userId)
      throw new Error("Champs obligatoire manquant");

    const user = await this.usersService.findById(userId);
    if (!user) throw new Error("Utilisateur inexistant");

    const association = await this.associationsRepo.getAssociationById(
      associationId
    );
    if (!association) {
      throw new Error("Associations inexistante");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invitation_link = `${process.env.FRONT_URL}/invitation/accept?token=${token}`;

    const user_name = `${user.firstname} ${user.lastname}`;

    const { html, text } = invitationEmail({
      asso_name: association.asso_name,
      user_name,
      invitation_link,
    });

    await sendEmail({
      to: email,
      subject: `Invitation à rejoindre l'association ${association.asso_name}`,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL,
      tags: [{ name: "type", value: "association_invitation" }],
    });

    await this.associationsRepo.createInvitation({
      token,
      associationId,
      created_by: userId,
      email,
    });
  }