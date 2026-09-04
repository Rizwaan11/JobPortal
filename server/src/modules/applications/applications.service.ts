import { NotFoundError } from "../../shared/errors.js";
import { findApplicantByUserId } from "../applicants/applicants.repo.js";
import type { ApplyToJobsInput } from "./application.schema.js";
import { getOpenJobs, checkExistingApplications, insertApplication } from "./applications.repo.js";

export const applyToJobs = async (userId: string, input: ApplyToJobsInput): Promise<{ created: string[]; skipped: string[] }> => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found');
    }

    const openJobs = await getOpenJobs(input.jobIds);
    const openJobIdsSet = new Set(openJobs.map(job => job._id.toString()));

    const missingOrClosed = input.jobIds.filter(id => !openJobIdsSet.has(id));
    if (missingOrClosed.length > 0) {
        throw new NotFoundError(`Jobs not found or not open: ${missingOrClosed.join(', ')}`);
    }

    const alreadyApplied = await checkExistingApplications(applicant._id.toString(), input.jobIds);
    const alreadyAppliedSet = new Set(alreadyApplied);

    const created: string[] = [];
    const skipped: string[] = [];

    for (const jobId of input.jobIds) {
        if (alreadyAppliedSet.has(jobId)) {
            skipped.push(jobId);
            continue;
        }

        const answers = input.answers[jobId] ?? [];
        const application = await insertApplication(applicant._id.toString(), jobId, answers);

        if (application) {
            created.push(application._id.toString());
        } else {
            skipped.push(jobId);
        }
    }

    return { created, skipped };
}
