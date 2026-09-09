import { Company } from "../companies/company.model.js";
import { Job } from "../jobs/job.model.js";
import { User } from "../auth/user.model.js";
import { RefreshToken } from "../auth/refresh-token.model.js";

export type CompanyStatusFilter = 'pending' | 'verified' | 'suspended';

const companyStatusToFilter = (status?: CompanyStatusFilter): Record<string, unknown> => {
    switch (status) {
        case 'pending': return { verified: false, suspended: false };
        case 'verified': return { verified: true, suspended: false };
        case 'suspended': return { suspended: true };
        default: return {};
    }
}

// Company ownership is resolved through the Recruiter collection.
export const listCompanies = async (status?: CompanyStatusFilter) => {
    const companies = await Company.aggregate([
        { $match: companyStatusToFilter(status) },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'recruiters',
                let: { companyId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$companyId', '$$companyId'] },
                                    { $eq: ['$companyRole', 'owner'] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 }
                ],
                as: 'owner'
            }
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'owner.userId',
                foreignField: '_id',
                as: 'ownerUser'
            }
        },
        { $unwind: { path: '$ownerUser', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                name: 1,
                verified: 1,
                suspended: 1,
                createdAt: 1,
                ownerEmail: '$ownerUser.email'
            }
        }
    ]);
    return companies;
}

export const findCompanyById = async (id: string) => {
    return Company.findById(id);
}

export const setCompanyVerified = async (id: string, verified: boolean) => {
    return Company.findByIdAndUpdate(id, { verified }, { new: true });
}

export const setCompanySuspended = async (id: string, suspended: boolean) => {
    return Company.findByIdAndUpdate(id, { suspended }, { new: true });
}

export const closeOpenJobsForCompany = async (companyId: string) => {
    await Job.updateMany({ companyId, status: 'open' }, { status: 'closed' });
}

// Admin queries are intentionally not company-scoped.
export const listJobsAdmin = async (status?: string, companyId?: string) => {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (companyId) filter.companyId = companyId;

    return Job.find(filter)
        .sort({ createdAt: -1 })
        .select('title status createdAt companyId')
        .populate('companyId', 'name');
}

export const findJobByIdAdmin = async (id: string) => {
    return Job.findById(id);
}

export const forceCloseJobAdmin = async (id: string) => {
    return Job.findByIdAndUpdate(id, { status: 'closed' }, { new: true });
}

export const listUsersAdmin = async (role?: string, status?: string) => {
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    return User.find(filter).sort({ createdAt: -1 }).select('email role status createdAt');
}

export const findUserByIdAdmin = async (id: string) => {
    return User.findById(id);
}

export const setUserStatus = async (id: string, status: 'unverified' | 'active' | 'suspended') => {
    return User.findByIdAndUpdate(id, { status }, { new: true }).select('email role status createdAt');
}

export const deleteRefreshTokensForUser = async (userId: string) => {
    await RefreshToken.deleteMany({ userId });
}
