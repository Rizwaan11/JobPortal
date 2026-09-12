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

export async function sendInvitationEmail(to: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: 'You have been invited to join a company workspace',
    text: [
      'You have been invited to join a company workspace.',
      '',
      'Accept your invitation here:',
      '',
      `    ${link}`,
      '',
      `This link expires in ${config.INVITATION_EXPIRES_IN_HOURS} hours.`,
    ].join('\n'),
  });
}

export async function sendInterviewNotification(
  to: string,
  jobTitle: string,
  scheduledAt: Date,
  meetingLink: string,
  notes: string | null
): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: `Interview scheduled — ${jobTitle}`,
    text: [
      `Your interview for ${jobTitle} has been scheduled.`,
      '',
      `Date/Time: ${scheduledAt.toUTCString()}`,
      `Meeting link: ${meetingLink}`,
      notes ? `Notes from the recruiter: ${notes}` : '',
    ].filter(Boolean).join('\n'),
  });
}

export async function sendApplicationConfirmationEmail(
  to: string,
  jobTitle: string,
  companyName: string
): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: `Application received: ${jobTitle} at ${companyName}`,
    text: [
      `Thank you for applying to ${jobTitle} at ${companyName}.`,
      "Your application has been received and is under review.",
      "You will hear back from the hiring team if your profile is a match.",
    ].join("\n\n"),
  });
}

export async function sendRecruiterDigestEmail(
  to: string,
  companyName: string,
  openJobsCount: number,
  applicationsLast7Days: number
): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: `Weekly digest for ${companyName}`,
    text: [
      `Weekly hiring summary for ${companyName}`,
      "",
      `Open jobs: ${openJobsCount}`,
      `Applications in the last 7 days: ${applicationsLast7Days}`,
    ].join("\n"),
  });
}
