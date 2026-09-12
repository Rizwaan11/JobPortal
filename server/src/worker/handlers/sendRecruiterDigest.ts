import { Application } from "../../modules/applications/application.model.js";
import { User } from "../../modules/auth/user.model.js";
import { Company } from "../../modules/companies/company.model.js";
import { Recruiter } from "../../modules/companies/recruiter.model.js";
import { Job } from "../../modules/jobs/job.model.js";
import { sendRecruiterDigestEmail } from "../../shared/mailer.js";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export async function sendRecruiterDigest(): Promise<void> {
  const companies = await Company.find({
    verified: true,
    suspended: false,
  });
  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_IN_MS);
  let sentCount = 0;

  for (const company of companies) {
    const owner = await Recruiter.findOne({
      companyId: company._id,
      companyRole: "owner",
    });

    if (!owner) {
      continue;
    }

    const ownerUser = await User.findById(owner.userId).select("email");

    if (!ownerUser) {
      continue;
    }

    const jobs = await Job.find({ companyId: company._id })
      .select("_id")
      .lean();
    const jobIds = jobs.map((job) => job._id);

    const [openJobsCount, applicationsLast7Days] = await Promise.all([
      Job.countDocuments({
        companyId: company._id,
        status: "open",
      }),
      Application.countDocuments({
        jobId: { $in: jobIds },
        createdAt: { $gte: sevenDaysAgo },
      }),
    ]);

    await sendRecruiterDigestEmail(
      ownerUser.email,
      company.name,
      openJobsCount,
      applicationsLast7Days
    );
    sentCount += 1;
  }

  console.log(`[digest] Sent digest emails to ${sentCount} companies`);
}
