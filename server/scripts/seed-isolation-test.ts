import mongoose from 'mongoose';
import { connectDB } from '../src/shared/db.js';
import { hashPassword } from '../src/shared/password.js';
import { User } from '../src/modules/auth/user.model.js';
import { Company } from '../src/modules/companies/company.model.js';
import { Recruiter } from '../src/modules/companies/recruiter.model.js';
import { Admin } from '../src/modules/admin/admin.model.js';
import { Job } from '../src/modules/jobs/job.model.js';

async function main() {
  await connectDB();

  await User.deleteMany({ email: { $in: ['recruiter-a@example.dev', 'admin@example.dev'] } });
  await Company.deleteMany({ slug: { $in: ['brightbuild', 'novaspark'] } });

  const [companyA, companyB] = await Company.create([
    { name: 'BrightBuild', slug: 'brightbuild', verified: true },
    { name: 'NovaSpark', slug: 'novaspark', verified: true },
  ]);

  const password = 'Password123!';
  const passwordHash = await hashPassword(password);

  const recruiterAUser = await User.create({
    email: 'recruiter-a@example.dev',
    password: passwordHash,
    role: 'recruiter',
    status: 'active',
  });
  await Recruiter.create({ userId: recruiterAUser._id, companyId: companyA._id, companyRole: 'owner' });

  const adminUser = await User.create({
    email: 'admin@example.dev',
    password: passwordHash,
    role: 'admin',
    status: 'active',
  });
  await Admin.create({ userId: adminUser._id });

  const jobA = await Job.create({
    companyId: companyA._id,
    title: 'Senior Backend Engineer',
    description: 'Own the isolation layer.',
    employmentType: 'full_time',
    status: 'open',
  });

  const jobB = await Job.create({
    companyId: companyB._id,
    title: 'Product Designer',
    description: 'Design the applicant experience.',
    employmentType: 'full_time',
    status: 'open',
  });

  console.log('--- Isolation attack test fixtures ---');
  console.log('Recruiter A email:', recruiterAUser.email, '| password:', password);
  console.log('Admin email:', adminUser.email, '| password:', password);
  console.log('Company A job id (owned by recruiter A):', jobA._id.toString());
  console.log('Company B job id (NOT owned by recruiter A):', jobB._id.toString());

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
