export const passwordResetEmail = (user: {
  firstname: string;
  lastname: string;
}) => {
  const html = `
    <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #2563eb; text-align: center;">Confirmation de réinitialisation du mot de passe</h2>

        <p style="font-size: 15px; color: #374151;">
        Bonjour ${user.firstname} ${user.lastname},
        </p>

        <p style="font-size: 15px; color: #374151;">
        Nous vous confirmons que le mot de passe associé à votre compte a été réinitialisé avec succès.
        </p>

        <p style="font-size: 15px; color: #374151;">
        Si vous êtes à l’origine de cette opération, aucune autre action n’est nécessaire.
          <br />
          En revanche, si vous n’êtes pas à l’origine de cette réinitialisation, nous vous invitons à modifier à nouveau votre mot de 
          passe et à contacter notre équipe de support dans les plus brefs délais.
        </p>

        <p style="font-size: 13px; color: #6b7280; margin-top: 32px; text-align: center;">
        Cet e-mail est envoyé automatiquement, merci de ne pas y répondre.<br />
        — L’équipe <strong>Bénélink</strong>
        </p>
      </div>
    </div>
    `;

  const text = `
      Bonjour ${user.firstname} ${user.lastname},
      
      Votre mot de passe à bien été réinitialisé avec succès.

      Si vous êtes à l’origine de cette opération, aucune autre action n’est nécessaire.
      Si ce n'est pas le cas, nous vous invitons à réinitialiser votre mot de passe immédiatement.

      -L'équipe Bénélink.
      `;

  return { html, text };
};
