// ISOLATION RULE: Every company-scoped query must include companyId from
// the authenticated recruiter row (resolved via getRecruiterCompany), never
// from a URL parameter or request body. The recruiter cannot control which
// companyId is used to scope their queries.

import mongoose from "mongoose";
import crypto from "crypto";
import { Recruiter } from "./recruiter.model.js";
import { Company } from "./company.model.js";
import { Invitation } from "./invitation.model.js";
import { config } from "../../shared/config.js";
import type { CompanyInput, InviteMemberInput } from "./companies.schema.js";

export const getRecruiterCompany = async (userId: string) => {
    const recruiter = await Recruiter.findOne({ userId });
    if (!recruiter) {
        return null;
    }
    return {
        companyId: recruiter.companyId,
        companyRole: recruiter.companyRole,
    }
}

export const getCompanyById = async (companyId: string) => {
    const company = await Company.findById(companyId);
    return company;
}

const slugify = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

export const createCompany = async (input: CompanyInput, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const companyData: { name: string; slug: string; website?: string } = {
            name: input.name,
            slug: slugify(input.name),
        };
        if (input.website !== undefined) {
            companyData.website = input.website;
        }

        const [company] = await Company.create([companyData], { session });
        if (!company) {
            throw new Error('Failed to create company');
        }

        await Recruiter.create(
            [{
                userId,
                companyId: company._id,
                companyRole: 'owner',
            }],
            { session }
        );

        await session.commitTransaction();
        return company;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}

export const findExistingMember = async (companyId: string, email: string) => {
    const recruiters = await Recruiter.find({ companyId }).populate({
        path: 'userId',
        match: { email },
    });
    return recruiters.find((recruiter) => recruiter.userId) ?? null;
}

export const findPendingInvitation = async (companyId: string, email: string) => {
    const invitation = await Invitation.findOne({
        companyId,
        email,
        expiresAt: { $gt: new Date() },
    });
    return invitation;
}

export const createInvitation = async (companyId: string, input: InviteMemberInput) => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + config.INVITATION_EXPIRES_IN_HOURS * 60 * 60 * 1000);

    await Invitation.create({
        companyId,
        email: input.email,
        role: input.role,
        tokenHash,
        expiresAt,
    });

    return rawToken;
}
