import { Resend } from "resend";

import { env } from "@/env";

let _client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_client) _client = new Resend(env.RESEND_API_KEY);
  return _client;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const client = getClient();
  if (!client) return;

  await client.emails.send({
    from: "Cooldown <onboarding@resend.dev>",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
