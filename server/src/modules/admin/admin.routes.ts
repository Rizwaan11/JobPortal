import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { Job } from "../jobs/job.model.js";
import { NotFoundError } from "../../shared/errors.js";
import { validateParam, validateQuery } from "../../shared/validate.js";
import {
    listCompanies,
    verifyCompany,
    suspendCompany,
    listJobs,
    forceCloseJob,
    listUsers,
    suspendUser,
    activateUser
} from "./admin.service.js";
import {
    adminCompaniesQuerySchema,
    adminIdParamSchema,
    adminJobsQuerySchema,
    adminUsersQuerySchema
} from "./admin.schema.js";

export const adminRouter = Router();


adminRouter.use(authMiddleware, requireRole('admin'))

adminRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

adminRouter.get('/jobs/:id', async (req, res) => {
    const { id } = validateParam(adminIdParamSchema, req.params);
    const job = await Job.findById(id);
    if (!job) {
        throw new NotFoundError('Job not found');
    }
    res.json(job);
});

adminRouter.get('/companies', async (req, res) => {
    const query = validateQuery(adminCompaniesQuerySchema, req.query);
    const companies = await listCompanies(query.status);
    res.json({ companies });
})

adminRouter.patch('/companies/:id/verify', async (req, res) => {
    const { id } = validateParam(adminIdParamSchema, req.params);
    const company = await verifyCompany(id);
    res.json({ company });
})

adminRouter.patch('/companies/:id/suspend', async (req, res) => {
    const { id } = validateParam(adminIdParamSchema, req.params);
    const company = await suspendCompany(id);
    res.json({ company });
})

adminRouter.get('/jobs', async (req, res) => {
    const query = validateQuery(adminJobsQuerySchema, req.query);
    const jobs = await listJobs(query.status, query.companyId);
    res.json({ jobs });
})

adminRouter.patch('/jobs/:id/close', async (req, res) => {
    const { id } = validateParam(adminIdParamSchema, req.params);
    const job = await forceCloseJob(id);
    res.json({ job });
})

adminRouter.get('/users', async (req, res) => {
    const query = validateQuery(adminUsersQuerySchema, req.query);
    const users = await listUsers(query.role, query.status);
    res.json({ users });
})

adminRouter.patch('/users/:id/suspend', async (req, res) => {
    const { id } = validateParam(adminIdParamSchema, req.params);
    const user = await suspendUser(req.user!.userId, id);
    res.json({ user });
})

adminRouter.patch('/users/:id/activate', async (req, res) => {
    const { id } = validateParam(adminIdParamSchema, req.params);
    const user = await activateUser(id);
    res.json({ user });
})
