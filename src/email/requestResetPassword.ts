export const requestResetPassword = ({
  user,
  resetLink,
}: {
  user: { firstname: string; lastname: string };
  resetLink: string;
}) => {
  const html = `
      <p>Bonjour ${user.firstname},</p>
      <p>Pour réinitialiser votre mot de passe, cliquez sur le lien suivant :</p>
      <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
      <p>Ce lien expirera dans 15 minutes.</p>
      <p>— L’équipe Bénélink</p>
    `;
  const text = `
    Bonjour ${user.firstname},

    Pour réinitialiser votre mot de passe, rendez-vous sur le lien suivant :
    ${resetLink}

    Ce lien expirera dans 15 minutes.

    — L’équipe Bénélink
    `;

  return { html, text };
};
