import { Application } from "./application.model.js";
import { Job } from "../jobs/job.model.js";

export const checkExistingApplications = async (applicantId: string, jobIds: string[]): Promise<string[]> => {
    const existing = await Application.find({ applicantId, jobId: { $in: jobIds } });
    return existing.map(app => app.jobId.toString());
}

export const insertApplication = async (applicantId: string, jobId: string, answers: Record<string, unknown>[]) => {
    try {
        const application = await Application.create({ applicantId, jobId, answers });
        return application;
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
            return null;
        }
        throw err;
    }
}

export const getOpenJobs = async (jobIds: string[]) => {
    const jobs = await Job.find({ _id: { $in: jobIds }, status: 'open' });
    return jobs;
}
