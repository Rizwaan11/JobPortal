import mongoose from "mongoose";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../shared/errors.js";
import { findApplicantByUserId } from "../applicants/applicants.repo.js";
import { getRecruiterCompany } from "../companies/companies.repo.js";
import { assertCompanyRole } from "../companies/companies.service.js";
import { sendInterviewNotification } from "../../shared/mailer.js";
import type { ApplyToJobsInput, ScheduleInterviewInput, RecordFeedbackInput } from "./application.schema.js";
import {
    getOpenJobs,
    checkExistingApplications,
    insertApplication,
    buildApplicantSnapshot,
    findApplicationForCompany,
    updateApplicationStage,
    findApplicationWithApplicant,
    createInterview,
    findInterviewForCompany,
    updateInterviewFeedback,
    findApplicationsForCompany
} from "./applications.repo.js";

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

// Stage order enforces forward-only transitions, except rejection.
const STAGE_ORDER = ['applied', 'screening', 'interview', 'final_interview', 'offer', 'hired', 'rejected'];
const TERMINAL_STAGES = new Set(['hired', 'rejected']);
const INTERVIEW_STAGE_IDX = STAGE_ORDER.indexOf('interview');

function assertValidTransition(currentStage: string, targetStage: string) {
    if (TERMINAL_STAGES.has(currentStage)) {
        throw new BadRequestError(`Cannot transition from terminal stage '${currentStage}'`);
    }
    if (!STAGE_ORDER.includes(targetStage)) {
        throw new BadRequestError(`'${targetStage}' is not a valid stage`);
    }
    if (targetStage === 'rejected') {
        return;
    }

    const currentIdx = STAGE_ORDER.indexOf(currentStage);
    const targetIdx = STAGE_ORDER.indexOf(targetStage);
    if (targetIdx <= currentIdx) {
        throw new BadRequestError(`Cannot move backward from '${currentStage}' to '${targetStage}'`);
    }
}

export const moveApplicationStage = async (userId: string, applicationId: string, targetStage: string) => {
    const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner', 'hr_manager', 'recruiter']);

    const application = await findApplicationForCompany(applicationId, company.companyId.toString());
    if (application.status === 'withdrawn') {
        throw new BadRequestError('Cannot change stage of a withdrawn application');
    }

    assertValidTransition(application.stage, targetStage);

    return updateApplicationStage(applicationId, targetStage);
}

export const scheduleInterview = async (userId: string, applicationId: string, input: ScheduleInterviewInput) => {
    const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner', 'hr_manager', 'recruiter']);

    // Verify ownership before loading related data.
    await findApplicationForCompany(applicationId, company.companyId.toString());

    const application = await findApplicationWithApplicant(applicationId);

    if (application.status === 'withdrawn') {
        throw new BadRequestError('Cannot schedule interview for a withdrawn application');
    }

    // Do not move later-stage applications backward.
    const currentIdx = STAGE_ORDER.indexOf(application.stage);
    if (currentIdx < INTERVIEW_STAGE_IDX) {
        await updateApplicationStage(applicationId, 'interview');
    }

    const interview = await createInterview(applicationId, input.scheduledAt, input.meetingLink, input.notes ?? null);

    const applicant = application.applicantId as any;
    const job = application.jobId as any;

    try {
        await sendInterviewNotification(
            applicant.userId.email,
            job.title,
            input.scheduledAt,
            input.meetingLink,
            input.notes ?? null
        );
    } catch (err) {
        // The interview remains saved if notification delivery fails.
        // TODO: Send notifications through a background job.
        console.error('[mailer] Failed to send interview notification:', err);
    }

    return interview;
}

// Feedback advances one stage or rejects the application.
export const recordInterviewFeedback = async (userId: string, interviewId: string, input: RecordFeedbackInput) => {
    const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner', 'hr_manager', 'recruiter']);

    const { interview, application } = await findInterviewForCompany(interviewId, company.companyId.toString());

    if (interview.outcome !== 'pending') {
        throw new BadRequestError('Feedback has already been recorded for this interview');
    }
    if (application.status === 'withdrawn') {
        throw new BadRequestError('Cannot record feedback for a withdrawn application');
    }

    const updatedInterview = await updateInterviewFeedback(interviewId, input.feedback, input.outcome);

    let updatedApplication = null;

    if (input.outcome === 'rejected') {
        assertValidTransition(application.stage, 'rejected');
        updatedApplication = await updateApplicationStage(application._id.toString(), 'rejected');
    } else {
        const currentIdx = STAGE_ORDER.indexOf(application.stage);
        const nextStage = STAGE_ORDER[currentIdx + 1];
        if (nextStage && !TERMINAL_STAGES.has(application.stage)) {
            assertValidTransition(application.stage, nextStage);
            updatedApplication = await updateApplicationStage(application._id.toString(), nextStage);
        }
    }

    return { interview: updatedInterview, application: updatedApplication };
}

export const getCompanyPipeline = async (userId: string) => {
    const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }

    const applications = await findApplicationsForCompany(company.companyId.toString());

    const pipeline: Record<string, typeof applications> = Object.fromEntries(
        STAGE_ORDER.map((stage) => [stage, []])
    );
    for (const app of applications) {
        pipeline[app.stage]?.push(app);
    }

    return pipeline;
}
