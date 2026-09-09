import { NotFoundError, ForbiddenError, ConflictError } from "../../shared/errors.js";
import { redis } from "../../shared/redis.js";
import { PUBLIC_BOARD_CACHE_KEY } from "../public/public.service.js";
import {
    listCompanies as listCompaniesRepo,
    findCompanyById,
    setCompanyVerified,
    setCompanySuspended,
    closeOpenJobsForCompany,
    listJobsAdmin,
    findJobByIdAdmin,
    forceCloseJobAdmin,
    listUsersAdmin,
    findUserByIdAdmin,
    setUserStatus,
    deleteRefreshTokensForUser
} from "./admin.repo.js";
import type { CompanyStatusFilter } from "./admin.repo.js";

const invalidatePublicBoardCache = async () => {
    try {
        await redis.del(PUBLIC_BOARD_CACHE_KEY);
    } catch (err) {
        console.error('[cache] Failed to invalidate public board cache:', err);
    }
}

export const listCompanies = async (status?: CompanyStatusFilter) => {
    return listCompaniesRepo(status);
}

export const verifyCompany = async (id: string) => {
    const company = await findCompanyById(id);
    if (!company) {
        throw new NotFoundError('Company not found');
    }
    if (company.verified) {
        throw new ConflictError('Company is already verified');
    }
    return setCompanyVerified(id, true);
}

export const suspendCompany = async (id: string) => {
    const company = await findCompanyById(id);
    if (!company) {
        throw new NotFoundError('Company not found');
    }
    if (company.suspended) {
        throw new ConflictError('Company is already suspended');
    }

    const updated = await setCompanySuspended(id, true);

    await closeOpenJobsForCompany(id);
    await invalidatePublicBoardCache();

    return updated;
}

export const listJobs = async (status?: string, companyId?: string) => {
    return listJobsAdmin(status, companyId);
}

export const forceCloseJob = async (id: string) => {
    const job = await findJobByIdAdmin(id);
    if (!job) {
        throw new NotFoundError('Job not found');
    }
    if (job.status === 'closed') {
        throw new ConflictError('Job is already closed');
    }

    const updated = await forceCloseJobAdmin(id);
    await invalidatePublicBoardCache();
    return updated;
}

export const listUsers = async (role?: string, status?: string) => {
    return listUsersAdmin(role, status);
}

export const suspendUser = async (adminUserId: string, targetUserId: string) => {
    if (adminUserId === targetUserId) {
        throw new ForbiddenError('Admins cannot suspend themselves');
    }

    const user = await findUserByIdAdmin(targetUserId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    if (user.status === 'suspended') {
        throw new ConflictError('User is already suspended');
    }

    const updated = await setUserStatus(targetUserId, 'suspended');
    await deleteRefreshTokensForUser(targetUserId);
    return updated;
}

export const activateUser = async (targetUserId: string) => {
    const user = await findUserByIdAdmin(targetUserId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    if (user.status === 'active') {
        throw new ConflictError('User is already active');
    }
    // Activation only reverses suspension; email verification remains separate.
    if (user.status !== 'suspended') {
        throw new ForbiddenError('This endpoint can only reactivate a suspended account.');
    }
    return setUserStatus(targetUserId, 'active');
}
