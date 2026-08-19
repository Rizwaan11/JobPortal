import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { Job } from "../jobs/job.model.js";
import { NotFoundError } from "../../shared/errors.js";
export const adminRouter = Router();


adminRouter.use(authMiddleware, requireRole('admin'))

adminRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

adminRouter.get('/jobs/:id', async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
        throw new NotFoundError('Job not found');
    }
    res.json(job);
});
