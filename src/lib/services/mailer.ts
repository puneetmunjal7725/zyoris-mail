import nodemailer from "nodemailer";
import Mailgun from "mailgun.js";
import FormData from "form-data";
import { Resend } from "resend";
import { getEnv } from "@/lib/env";

type SendEmailInput = {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
};

export async function sendProviderEmail(input: SendEmailInput) {
  const env = getEnv();
  const from = input.from || env.FROM_EMAIL;

  if (env.EMAIL_PROVIDER === "RESEND") {
    if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(env.RESEND_API_KEY);
    const resp = await resend.emails.send({
      from,
      to: input.to,
      cc: input.cc,
      bcc: input.bcc,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return String(resp.data?.id || "");
  }

  if (env.EMAIL_PROVIDER === "MAILGUN") {
    if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) throw new Error("MAILGUN env missing");
    const mg = new Mailgun(FormData);
    const client = mg.client({ username: "api", key: env.MAILGUN_API_KEY });
    const resp = await client.messages.create(env.MAILGUN_DOMAIN, {
      from,
      to: input.to,
      cc: input.cc,
      bcc: input.bcc,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return String(resp.id || "");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 587),
    secure: Number(env.SMTP_PORT || 587) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  const resp = await transporter.sendMail({
    from,
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return String(resp.messageId || "");
}
