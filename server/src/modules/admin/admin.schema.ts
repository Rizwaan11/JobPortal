import { z } from "zod";
import { objectIdParam } from "../../shared/validate.js";

export const adminIdParamSchema = z.object({
    id: objectIdParam,
});

export const adminCompaniesQuerySchema = z.object({
    status: z.enum(['pending', 'verified', 'suspended']).optional(),
});

export const adminJobsQuerySchema = z.object({
    status: z.enum(['draft', 'open', 'closed']).optional(),
    companyId: objectIdParam.optional(),
});

export const adminUsersQuerySchema = z.object({
    role: z.enum(['admin', 'recruiter', 'applicant']).optional(),
    status: z.enum(['unverified', 'active', 'suspended']).optional(),
});
