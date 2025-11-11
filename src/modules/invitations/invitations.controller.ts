async createInvitation(req: Request, res: Response) {
    try {
      const { email, associationId } = req.body;
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      await this.associationsService.createInviation(
        email,
        associationId,
        userId
      );
      res.status(201).json({ message: "Invitation créé" });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  }