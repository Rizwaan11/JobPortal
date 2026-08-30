import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { connectDB } from '../src/shared/db.js';
import { config } from '../src/shared/config.js';
import { hashPassword } from '../src/shared/password.js';
import { hashOtp } from '../src/shared/otp.js';
import { User } from '../src/modules/auth/user.model.js';
import { EmailVerification } from '../src/modules/auth/email-verification.model.js';
import { RefreshToken } from '../src/modules/auth/refresh-token.model.js';
import { Admin } from '../src/modules/admin/admin.model.js';
import { Company } from '../src/modules/companies/company.model.js';
import { Recruiter } from '../src/modules/companies/recruiter.model.js';
import { Invitation } from '../src/modules/companies/invitation.model.js';
import { Applicant } from '../src/modules/applicants/applicant.model.js';
import { Job } from '../src/modules/jobs/job.model.js';

const PASSWORD = 'password123';
const UNVERIFIED_OTP = '123456';

async function seed() {
  if (config.NODE_ENV === 'production') {
    throw new Error('Refusing to run the seed script against a production environment.');
  }

  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    EmailVerification.deleteMany({}),
    RefreshToken.deleteMany({}),
    Admin.deleteMany({}),
    Company.deleteMany({}),
    Recruiter.deleteMany({}),
    Invitation.deleteMany({}),
    Applicant.deleteMany({}),
    Job.deleteMany({}),
  ]);

  const passwordHash = await hashPassword(PASSWORD);

  // ── Companies ────────────────────────────────────────────────
  const [brightbuild, novaspark] = await Company.create([
    { name: 'BrightBuild', slug: 'brightbuild', website: 'https://brightbuild.dev', verified: true },
    { name: 'NovaSpark', slug: 'novaspark', website: 'https://novaspark.dev', verified: true },
  ]);

  // ── Admin ────────────────────────────────────────────────────
  const adminUser = await User.create({
    email: 'admin@portal.dev',
    password: passwordHash,
    role: 'admin',
    status: 'active',
  });
  await Admin.create({ userId: adminUser._id });

  // ── Recruiters (two per company, different company roles) ────
  const aliceUser = await User.create({
    email: 'alice@brightbuild.dev',
    password: passwordHash,
    role: 'recruiter',
    status: 'active',
  });
  await Recruiter.create({ userId: aliceUser._id, companyId: brightbuild!._id, companyRole: 'owner' });

  const danaUser = await User.create({
    email: 'dana@brightbuild.dev',
    password: passwordHash,
    role: 'recruiter',
    status: 'active',
  });
  await Recruiter.create({ userId: danaUser._id, companyId: brightbuild!._id, companyRole: 'hr_manager' });

  const carlosUser = await User.create({
    email: 'carlos@novaspark.dev',
    password: passwordHash,
    role: 'recruiter',
    status: 'active',
  });
  await Recruiter.create({ userId: carlosUser._id, companyId: novaspark!._id, companyRole: 'owner' });

  const priyaUser = await User.create({
    email: 'priya@novaspark.dev',
    password: passwordHash,
    role: 'recruiter',
    status: 'active',
  });
  await Recruiter.create({ userId: priyaUser._id, companyId: novaspark!._id, companyRole: 'hiring_manager' });

  // ── Applicants ─────────────────────────────────────────────────
  const jamieUser = await User.create({
    email: 'jamie@example.dev',
    password: passwordHash,
    role: 'applicant',
    status: 'active',
  });
  await Applicant.create({
    userId: jamieUser._id,
    fullName: 'Jamie Rivera',
    headline: 'Backend engineer, 4 years experience',
    location: 'Remote',
    attributes: { skills: ['Node.js', 'PostgreSQL', 'Docker'], portfolioLinks: ['https://jamierivera.dev'], yearsOfExperience: 4 },
  });

  const patUser = await User.create({
    email: 'pat@example.dev',
    password: passwordHash,
    role: 'applicant',
    status: 'active',
  });
  await Applicant.create({
    userId: patUser._id,
    fullName: 'Pat Chen',
    headline: 'Full-stack developer',
    location: 'New York',
    attributes: { skills: ['React', 'Node.js', 'AWS'], portfolioLinks: [], yearsOfExperience: 3 },
  });

  const morganUser = await User.create({
    email: 'morgan@example.dev',
    password: passwordHash,
    role: 'applicant',
    status: 'active',
  });
  await Applicant.create({
    userId: morganUser._id,
    fullName: 'Morgan Ellis',
    headline: 'UI/UX designer, product thinker',
    attributes: { skills: ['Figma', 'User research'], portfolioLinks: ['https://morganellis.design'] },
  });

  // Unverified applicant with a live OTP, for exercising verify/resend flows.
  const samUser = await User.create({
    email: 'sam@example.dev',
    password: passwordHash,
    role: 'applicant',
    status: 'unverified',
  });
  await EmailVerification.create({
    userId: samUser._id,
    otpHash: hashOtp(UNVERIFIED_OTP),
    expiresAt: new Date(Date.now() + config.OTP_EXPIRES_IN_MINUTES * 60 * 1000),
  });

  // ── Jobs (draft, open, and closed, across both companies) ─────
  await Job.create([
    {
      companyId: brightbuild!._id,
      title: 'Backend Engineer',
      description: 'Build and maintain the core API and data layer.',
      status: 'open',
    },
    {
      companyId: brightbuild!._id,
      title: 'Product Designer',
      description: 'Lead design for the web platform.',
      status: 'draft',
    },
    {
      companyId: novaspark!._id,
      title: 'UI Designer',
      description: 'Shape the visual identity of client-facing products.',
      status: 'open',
    },
    {
      companyId: novaspark!._id,
      title: 'Senior Frontend Engineer',
      description: 'Own the component library and performance budget.',
      status: 'closed',
    },
  ]);

  // ── Pending invitation (BrightBuild invites a new recruiter) ───
  const rawInviteToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenHash = crypto.createHash('sha256').update(rawInviteToken).digest('hex');
  await Invitation.create({
    companyId: brightbuild!._id,
    email: 'newhire@example.dev',
    role: 'recruiter',
    tokenHash: inviteTokenHash,
    expiresAt: new Date(Date.now() + config.INVITATION_EXPIRES_IN_HOURS * 60 * 60 * 1000),
  });

  console.log('Seed complete.\n');
  console.log('| Email                     | Password    | Role      | Notes                          |');
  console.log('|---------------------------|-------------|-----------|--------------------------------|');
  console.log('| admin@portal.dev          | password123 | admin     | Platform operator              |');
  console.log('| alice@brightbuild.dev     | password123 | recruiter | Owner of BrightBuild            |');
  console.log('| dana@brightbuild.dev      | password123 | recruiter | HR manager of BrightBuild       |');
  console.log('| carlos@novaspark.dev      | password123 | recruiter | Owner of NovaSpark              |');
  console.log('| priya@novaspark.dev       | password123 | recruiter | Hiring manager of NovaSpark     |');
  console.log('| jamie@example.dev         | password123 | applicant | Backend background              |');
  console.log('| pat@example.dev           | password123 | applicant | Full-stack background           |');
  console.log('| morgan@example.dev        | password123 | applicant | Design background               |');
  console.log('| sam@example.dev           | password123 | applicant | Unverified — OTP below          |\n');
  console.log(`sam@example.dev verification OTP: ${UNVERIFIED_OTP}`);
  console.log(`Pending invitation token (newhire@example.dev -> BrightBuild): ${rawInviteToken}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
