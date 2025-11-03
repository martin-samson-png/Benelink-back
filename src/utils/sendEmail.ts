import { Resend } from "resend";
import crypto from "node:crypto";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  replyTo,
  tags,
}: SendArgs) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM as string,
      to: to,
      subject: subject,
      html: html,
      text: text,
      replyTo: replyTo,
      tags: tags,
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });

    if (error) throw new Error("Envoie de l'email impossible");

    return data;
  } catch {
    throw new Error("Erreur interne");
  }
};
