import nodemailer from 'nodemailer';
import { config } from './config.js';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth:
    config.SMTP_USER && config.SMTP_PASS
      ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
      : undefined,
});

export async function sendVerificationEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: 'Verify your email address',
    text: [
      'Welcome to the job portal.',
      '',
      'Your verification code is:',
      '',
      `    ${otp}`,
      '',
      'Enter this code in the app to activate your account.',
      `The code expires in ${config.OTP_EXPIRES_IN_MINUTES} minutes.`,
      '',
      'If you did not create an account, you can ignore this email.',
    ].join('\n'),
  });
}
