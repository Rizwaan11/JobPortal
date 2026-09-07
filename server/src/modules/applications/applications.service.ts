import mongoose from "mongoose";
import { NotFoundError } from "../../shared/errors.js";
import { findApplicantByUserId } from "../applicants/applicants.repo.js";
import type { ApplyToJobsInput } from "./application.schema.js";
import { getOpenJobs, checkExistingApplications, insertApplication, buildApplicantSnapshot } from "./applications.repo.js";

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

    const snapshot = await buildApplicantSnapshot(applicant._id.toString());

    const jobsToInsert = input.jobIds.filter(id => !alreadyAppliedSet.has(id));
    const skipped = input.jobIds.filter(id => alreadyAppliedSet.has(id));
    const created: string[] = [];

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        for (const jobId of jobsToInsert) {
            const answers = input.answers[jobId] ?? [];
            const application = await insertApplication(session, applicant._id.toString(), jobId, answers, snapshot);
            created.push(application._id.toString());
        }

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return { created, skipped };
}
