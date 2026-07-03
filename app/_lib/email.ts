import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Reset your FNN password',
    html: `
      <p>You requested a password reset. Click below — link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
}
