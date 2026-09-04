import crypto from "crypto";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors.js";
import { getPresignedUploadUrl } from "../../shared/storage.js";

import type { ApplicantInput, ApplicantEditInput, ConfirmResumeInput, AddShortlistInput } from './applicant.schema.js'
import { createApplicantProfile, createResume, findApplicantByUserId, updateApplicantProfile, addToShortlist, listShortlist, removeFromShortlist } from "./applicants.repo.js";


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

   return applicant;
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
    const uploadUrl = await getPresignedUploadUrl(key, 'application/pdf');
    return { uploadUrl, key };
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
    return resume;
}

export const addJobToShortlist = async (userId: string, input: AddShortlistInput) => {
    const applicant = await findApplicantByUserId(userId);
    if (!applicant) {
        throw new NotFoundError('Applicant profile not found');
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
    await removeFromShortlist(applicant._id.toString(), jobId);
}
