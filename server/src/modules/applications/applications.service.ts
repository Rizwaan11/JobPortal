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
    updateInterviewFeedback
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

// Chapter 55 — application stage pipeline (finite state machine).
// Position in this array IS the validation logic: a move is only allowed
// if the target's position is greater than the current position, with one
// carve-out for 'rejected' (reachable from any non-terminal stage).
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

// Chapter 56 — schedule an interview, advance the stage if needed, notify the applicant.
export const scheduleInterview = async (userId: string, applicationId: string, input: ScheduleInterviewInput) => {
    const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner', 'hr_manager', 'recruiter']);

    // Ownership check first (Ch.55 pattern) — 404s before we ever load applicant/job details.
    await findApplicationForCompany(applicationId, company.companyId.toString());

    // Re-fetch with the applicant email + job title populated in, needed for the email.
    const application = await findApplicationWithApplicant(applicationId);

    if (application.status === 'withdrawn') {
        throw new BadRequestError('Cannot schedule interview for a withdrawn application');
    }

    // Only advance the stage forward to 'interview' — never regress an
    // application already at 'final_interview' or beyond.
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
        // The interview is already saved — don't fail the request over a
        // flaky SMTP server, and don't let a retry create a duplicate
        // interview row. TODO: ch62+ moves this to a background job so
        // email delivery can never affect this response at all.
        console.error('[mailer] Failed to send interview notification:', err);
    }

    return interview;
}

// Chapter 57 — record interview feedback and (maybe) advance the stage.
//
// Two different rules coexist here on purpose:
//  - assertValidTransition (Ch.55) allows ANY forward jump — a recruiter
//    calling PATCH /:id/stage directly can skip stages.
//  - The "moved_forward" logic below always computes the SINGLE next stage
//    (STAGE_ORDER[currentIdx + 1]) — feedback only ever nudges an
//    application one step forward, never lets it skip. We still run that
//    computed target through assertValidTransition as a defense-in-depth
//    check rather than duplicating its rules here.
//
// Idempotency here guards an UPDATE, not an INSERT (contrast Ch.53's
// duplicate-apply guard on insert): once interview.outcome leaves 'pending'
// it can never be written again, because the stage move it already caused
// can't be walked backward.
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
