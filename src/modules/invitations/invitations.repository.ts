async createInvitation(
    data: Omit<Invitation, "id" | "used_by" | "expire_at">
  ) {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO invitations(token, associationId, created_by,  email) VALUES (?, ?, ?, ?)`,
        [data.token, data.associationId, data.created_by, data.email]
      );

      if (result.affectedRows === 0)
        throw new Error("Echec de la création de l'invitation");
    } catch (err) {
      console.error(err);
      throw err;
    }
  }