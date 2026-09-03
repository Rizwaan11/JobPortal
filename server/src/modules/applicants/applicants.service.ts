import { ConflictError,NotFoundError } from "../../shared/errors.js";

import type {ApplicantInput , ApplicantEditInput } from './applicant.schema.js'
import { createApplicantProfile, findApplicantByUserId, updateApplicantProfile } from "./applicants.repo.js";


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
