import { Applicant } from "./applicant.model.js";
import { NotFoundError } from "../../shared/errors.js";
import type { ApplicantEditInput, ApplicantInput } from "./applicant.schema.js";

export const assertApplicantOwnership = async (applicantId: string, userId: string) => {
    const applicant = await Applicant.findById(applicantId);
    if (!applicant || applicant.userId.toString() !== userId) {
        throw new NotFoundError('Applicant not found');
    }
}

export const findApplicantByUserId = async(userId:string)=>{
    const applicant = await Applicant.findOne({userId})
    return applicant;
}

export const createApplicantProfile = async (userId: string, input: ApplicantInput) => {
    const attributesData: { skills: string[]; portfolioLinks: string[]; yearsOfExperience?: number } = {
        skills: input.attributes.skills,
        portfolioLinks: input.attributes.portfolioLinks,
    };
    if (input.attributes.yearsOfExperience !== undefined) {
        attributesData.yearsOfExperience = input.attributes.yearsOfExperience;
    }

    const applicantData: { userId: string; fullName: string; headline?: string; location?: string; attributes: { skills: string[]; portfolioLinks: string[]; yearsOfExperience?: number } } = {
        userId,
        fullName: input.fullName,
        attributes: attributesData,
    };
    if (input.headline !== undefined) applicantData.headline = input.headline;
    if (input.location !== undefined) applicantData.location = input.location;

    const applicant = await Applicant.create(applicantData);
    return applicant;
}

export const updateApplicantProfile = async (userId: string, input: ApplicantEditInput) => {
    const updateData: Record<string, unknown> = {};

    if (input.fullName !== undefined) updateData.fullName = input.fullName;
    if (input.headline !== undefined) updateData.headline = input.headline;
    if (input.location !== undefined) updateData.location = input.location;

    if (input.attributes) {
        if (input.attributes.skills !== undefined) updateData['attributes.skills'] = input.attributes.skills;
        if (input.attributes.portfolioLinks !== undefined) updateData['attributes.portfolioLinks'] = input.attributes.portfolioLinks;
        if (input.attributes.yearsOfExperience !== undefined) updateData['attributes.yearsOfExperience'] = input.attributes.yearsOfExperience;
    }

    await Applicant.findOneAndUpdate({ userId }, updateData, { new: true });
}
