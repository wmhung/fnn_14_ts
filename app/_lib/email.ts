import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: '重設你的 FNN 密碼',
    html: `
      <p>你申請了重設密碼。請點選下方連結——連結將於 30 分鐘後失效。</p>
      <p><a href="${resetUrl}">重設密碼</a></p>
      <p>如果這不是你本人的申請，請忽略此郵件。</p>
    `,
  });
}
