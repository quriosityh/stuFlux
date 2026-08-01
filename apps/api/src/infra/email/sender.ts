import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromAddress = process.env.RESEND_FROM_ADDRESS ?? 'notifications@stuflux.local';
const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY is missing; skipping email delivery');
    return;
  }

  try {
    await resend.emails.send({
      from: resendFromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (error) {
    console.error('[email] Failed to send email to', params.to, error);
  }
}

export { appUrl };