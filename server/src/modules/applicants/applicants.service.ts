import crypto from "crypto";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors.js";
import { getPrivateDownloadUrl, getSignedUploadParams } from "../../shared/storage.js";
import { logger } from "../../shared/logger.js";

import type { ApplicantInput, ApplicantEditInput, ConfirmResumeInput, AddShortlistInput } from './applicant.schema.js'
import { createApplicantProfile, createResume, findApplicantByUserId, findLatestResume, updateApplicantProfile, addToShortlist, findOpenVisibleJob, listShortlist, removeFromShortlist, findApplicationsForApplicant } from "./applicants.repo.js";

import { queue } from "../../shared/queue.js";

export const createProfile = async (userId:string, input:ApplicantInput)=>{
    const isApplicantExist = await findApplicantByUserId(userId)

    if(isApplicantExist){
        throw new ConflictError('Applicant profile already exists');
    }
    
    const applicant = await  createApplicantProfile(userId, input)
    return applicant;

}



export const getProfile = async (userId:string)=>{
   const applicant = await findApplicantByUserId(userId)
   if(!applicant){
    throw new NotFoundError('Applicant profile not found');
   }

   const resume = await findLatestResume(applicant._id.toString());

   return {
    ...applicant.toObject(),
    resume: resume ? {
        _id: resume._id,
        filename: resume.filename,
        uploadedAt: resume.uploadedAt,
        wordCount: resume.wordCount ?? null,
    } : null,
   };
}




export const updateProfile = async (userId:string ,input:ApplicantEditInput)=>{
    const existing = await findApplicantByUserId(userId)
    if(!existing){
        throw new NotFoundError('Applicant profile not found');
    }
    await updateApplicantProfile(userId,input)
}

export const getResumeUploadUrl = async (userId: string) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found. Create your profile first.');
    }

    const key = `resumes/${applicant._id}/${crypto.randomUUID()}.pdf`;
    return getSignedUploadParams(key);
}

export const confirmResumeUpload = async (userId: string, input: ConfirmResumeInput) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found.');
    }

    if (!input.key.startsWith(`resumes/${applicant._id}/`)) {
        throw new ForbiddenError('Key does not belong to this applicant.');
    }

    const resume = await createResume(applicant._id.toString(), input.filename, input.key);

    try {
        await queue.add('process-resume', {
            resumeId: resume._id.toString(),
            storageKey: resume.storageKey
        });
    } catch (err) {
        logger.warn({ err, resumeId: resume._id.toString() }, 'Failed to queue resume analysis');
    }

    return resume;
}

export const getMyResumeUrl = async (userId: string) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found.');
    }

    const resume = await findLatestResume(applicant._id.toString());
    if (!resume) {
        throw new NotFoundError('Resume not found.');
    }

    return { url: getPrivateDownloadUrl(resume.storageKey) };
}

export const addJobToShortlist = async (userId: string, input: AddShortlistInput) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found');
    }

    const job = await findOpenVisibleJob(input.jobId);
    if (!job) {
        throw new NotFoundError('Job not found or not open');
    }

    return addToShortlist(applicant._id.toString(), input.jobId);
}

export const getShortlist = async (userId: string) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found');
    }
    return listShortlist(applicant._id.toString());
}

export const removeJobFromShortlist = async (userId: string, jobId: string) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found');
    }
    const removed = await removeFromShortlist(applicant._id.toString(), jobId);
    if (!removed) {
        throw new NotFoundError('Shortlist item not found');
    }
}

export const getMyApplications = async (userId: string) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found');
    }
    return findApplicationsForApplicant(applicant._id.toString());
}
