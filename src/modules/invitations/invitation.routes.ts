router.post("/invitation", checkAuth, (req, res) =>
  associationsController.createInvitation(req, res)
);
