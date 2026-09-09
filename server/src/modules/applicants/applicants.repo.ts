import mongoose from "mongoose";
import { Applicant } from "./applicant.model.js";
import { Application } from "../applications/application.model.js";
import { Resume } from "./resume.model.js";
import { ShortlistItem } from "./shortlist.model.js";
import { ConflictError, NotFoundError } from "../../shared/errors.js";
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

export const createResume = async (applicantId: string, filename: string, s3Key: string) => {
    const resume = await Resume.create({ applicantId, filename, s3Key });
    return resume;
}

export const addToShortlist = async (applicantId: string, jobId: string) => {
    try {
        const item = await ShortlistItem.create({ applicantId, jobId });
        return item;
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
            throw new ConflictError('Job already shortlisted');
        }
        throw err;
    }
}

export const listShortlist = async (applicantId: string) => {
    const items = await ShortlistItem.find({ applicantId })
        .populate({
            path: 'jobId',
            select: 'title status createdAt companyId',
            populate: { path: 'companyId', select: 'name' }
        })
        .sort({ createdAt: -1 });
    return items;
}

export const removeFromShortlist = async (applicantId: string, jobId: string) => {
    await ShortlistItem.findOneAndDelete({ applicantId, jobId });
}

// Aggregation selects the next matching interview for each application.
export const findApplicationsForApplicant = async (applicantId: string) => {
    const applications = await Application.aggregate([
        { $match: { applicantId: new mongoose.Types.ObjectId(applicantId) } },
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
        { $unwind: '$job' },
        { $lookup: { from: 'companies', localField: 'job.companyId', foreignField: '_id', as: 'company' } },
        { $unwind: '$company' },
        {
            $lookup: {
                from: 'interviews',
                let: { appId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$applicationId', '$$appId'] },
                            outcome: 'pending',
                            scheduledAt: { $gt: new Date() }
                        }
                    },
                    { $sort: { scheduledAt: 1 } },
                    { $limit: 1 },
                    {
                        $project: {
                            _id: 1,
                            scheduledAt: 1,
                            meetingLink: 1,
                            notes: 1
                        }
                    }
                ],
                as: 'upcomingInterview'
            }
        },
        {
            $project: {
                jobId: 1,
                jobTitle: '$job.title',
                companyName: '$company.name',
                stage: 1,
                status: 1,
                createdAt: 1,
                upcomingInterview: {
                    $ifNull: [{ $arrayElemAt: ['$upcomingInterview', 0] }, null]
                }
            }
        }
    ]);
    return applications;
}
