import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { getRecruiterCompany } from "../companies/companies.repo.js";
import { assertJobOwnership } from "./jobs.repo.js";
import { NotFoundError } from "../../shared/errors.js";
export const jobsRouter = Router();


jobsRouter.use(authMiddleware, requireRole('recruiter'))

jobsRouter.get('/:id', async (req, res) => {
    const recruiter = await getRecruiterCompany(req.user!.userId);
    if (!recruiter) {
        throw new NotFoundError('No company associated with this account');
    }
    await assertJobOwnership(req.params.id, recruiter.companyId.toString());
    res.json({ jobId: req.params.id, companyId: recruiter.companyId });
});
