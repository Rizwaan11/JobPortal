import { Application } from "./application.model.js";
import type { ApplicationSnapshot } from "./application.model.js";
import { Interview } from "./interview.model.js";
import { Job } from "../jobs/job.model.js";
import { Applicant } from "../applicants/applicant.model.js";
import { Resume } from "../applicants/resume.model.js";
import { ConflictError, NotFoundError } from "../../shared/errors.js";
import type { ClientSession } from "mongoose";

export const checkExistingApplications = async (applicantId: string, jobIds: string[]): Promise<string[]> => {
    const existing = await Application.find({ applicantId, jobId: { $in: jobIds } });
    return existing.map(app => app.jobId.toString());
}

export const insertApplication = async (
    session: ClientSession,
    applicantId: string,
    jobId: string,
    answers: Record<string, unknown>[],
    snapshot: ApplicationSnapshot
) => {
    try {
        const [application] = await Application.create([{ applicantId, jobId, answers, snapshot }], { session });
        if (!application) {
            throw new Error('Application insert returned no document');
        }
        return application;
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
            throw new ConflictError('Job already applied to');
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

// Chapter 55 — recruiter-side ownership check.
// Mongo has no JOIN, so this is two sequential lookups instead of the
// course's single SQL join. Both "doesn't exist" and "exists but belongs
// to another company" return the SAME NotFoundError with the SAME message,
// so a recruiter probing IDs can't tell the two cases apart (IDOR-safe,
// same pattern as assertJobOwnership in jobs.repo.ts).
export const findApplicationForCompany = async (applicationId: string, companyId: string) => {
    const application = await Application.findById(applicationId);
    if (!application) {
        throw new NotFoundError('Application not found');
    }

    const job = await Job.findOne({ _id: application.jobId, companyId });
    if (!job) {
        throw new NotFoundError('Application not found');
    }

    return application;
}

export const updateApplicationStage = async (applicationId: string, stage: string) => {
    const updated = await Application.findByIdAndUpdate(
        applicationId,
        { stage },
        { new: true }
    );
    return updated;
}

// Chapter 56 — pulls the applicant's email and job title through TWO
// populate hops (application -> applicant -> user, and application -> job).
// This is a straight "follow the references" read, so populate() is enough
// here. Chapter 58 needs something populate() can't do (embedding only the
// latest/matching sub-document per parent) — that's when we reach for the
// aggregation pipeline instead.
export const findApplicationWithApplicant = async (applicationId: string) => {
    const application = await Application.findById(applicationId)
        .populate({ path: 'jobId', select: 'title' })
        .populate({ path: 'applicantId', populate: { path: 'userId', select: 'email' } });

    if (!application) {
        throw new NotFoundError('Application not found');
    }
    return application;
}

export const createInterview = async (
    applicationId: string,
    scheduledAt: Date,
    meetingLink: string,
    notes: string | null
) => {
    return Interview.create({ applicationId, scheduledAt, meetingLink, notes });
}

// Chapter 57 — same IDOR-safe pattern as findApplicationForCompany, but one
// hop deeper: interview -> application -> job -> companyId. Every failure
// branch throws the identical NotFoundError message so a recruiter probing
// interview IDs from another company can't distinguish "no such interview"
// from "exists but isn't yours".
export const findInterviewForCompany = async (interviewId: string, companyId: string) => {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
        throw new NotFoundError('Interview not found');
    }

    const application = await Application.findById(interview.applicationId);
    if (!application) {
        throw new NotFoundError('Interview not found');
    }

    const job = await Job.findOne({ _id: application.jobId, companyId });
    if (!job) {
        throw new NotFoundError('Interview not found');
    }

    return { interview, application };
}

export const updateInterviewFeedback = async (
    interviewId: string,
    feedback: string,
    outcome: 'moved_forward' | 'rejected'
) => {
    return Interview.findByIdAndUpdate(
        interviewId,
        { feedback, outcome },
        { new: true }
    );
}
