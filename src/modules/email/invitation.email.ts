export const invitationEmail = ({
  asso_name,
  user_name,
  invitation_link,
}: {
  asso_name: string;
  user_name: string;
  invitation_link: string;
}) => {
  const html = `
    <p>Bonjour,</p>
    <p>${user_name} vous a invité(e) à rejoindre l'association <strong>${asso_name}</strong>.</p>
    <p>Pour accepter cette invitation, cliquez sur le lien suivant :</p>
    <p><a href="${invitation_link}" target="_blank">${invitation_link}</a></p>
    <p>Ce lien expirera dans 7 jours.</p>
    <p>— L’équipe Bénélink</p>
  `;

  const text = `
Bonjour,

${user_name} vous a invité(e) à rejoindre l'association ${asso_name}.

Pour accepter cette invitation, cliquez sur le lien suivant :
${invitation_link}

Ce lien expirera dans 7 jours.

— L’équipe Bénélink
  `;

  return { html, text };
};
