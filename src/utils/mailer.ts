import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationCode(to: string, code: string) {
  await transporter.sendMail({
    from: `"VYRA" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your VYRA verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}
export async function sendResetCode(to: string, code: string) {
  await transporter.sendMail({
    from: `"VYRA" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your VYRA password reset code',
    text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't ask for this, ignore this email.`,
  });
}
