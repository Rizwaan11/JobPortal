import { Application } from "./application.model.js";
import type { ApplicationSnapshot } from "./application.model.js";
import { Job } from "../jobs/job.model.js";
import { Applicant } from "../applicants/applicant.model.js";
import { Resume } from "../applicants/resume.model.js";
import { NotFoundError } from "../../shared/errors.js";

export const checkExistingApplications = async (applicantId: string, jobIds: string[]): Promise<string[]> => {
    const existing = await Application.find({ applicantId, jobId: { $in: jobIds } });
    return existing.map(app => app.jobId.toString());
}

export const insertApplication = async (
    applicantId: string,
    jobId: string,
    answers: Record<string, unknown>[],
    snapshot: ApplicationSnapshot
) => {
    try {
        const application = await Application.create({ applicantId, jobId, answers, snapshot });
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

export const buildApplicantSnapshot = async (applicantId: string): Promise<ApplicationSnapshot> => {
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found');
    }

    const latestResume = await Resume.findOne({ applicantId }).sort({ uploadedAt: -1 });

    return {
        fullName: applicant.fullName,
        headline: applicant.headline ?? null,
        location: applicant.location ?? null,
        skills: applicant.attributes.skills,
        portfolioLinks: applicant.attributes.portfolioLinks,
        yearsOfExperience: applicant.attributes.yearsOfExperience ?? null,
        resumeKey: latestResume?.s3Key ?? null
    };
}
