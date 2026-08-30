import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { validateBody } from "../../shared/validate.js";
import { jobSchema, listCompanyJobsSchema, updateJobSchema } from "./job.schema.js";
import { postJob, editJob, publishJob, closeJob, getCompanyJobs, getJob } from "./jobs.service.js";



export const jobsRouter = Router();


jobsRouter.use(authMiddleware, requireRole('recruiter'))

jobsRouter.get('/:id', async (req, res) => {
    const job = await getJob(req.user!.userId, req.params.id);
    res.json(job);
});


jobsRouter.post('/', async (req, res) => {
    const body = validateBody(jobSchema, req.body);
    const job = await postJob(req.user!.userId, body);
    res.status(201).json(job);
})


jobsRouter.patch('/:id', async (req, res) => {
    const body = validateBody(updateJobSchema, req.body);
    await editJob(req.user!.userId, req.params.id, body);
    res.json({ message: 'Job updated.' });
})


jobsRouter.post('/:id/publish', async (req, res) => {
    await publishJob(req.user!.userId, req.params.id);
    res.json({ message: 'Job published.' });
})


jobsRouter.post('/:id/close', async (req, res) => {
    await closeJob(req.user!.userId, req.params.id);
    res.json({ message: 'Job closed.' });
})

jobsRouter.get('/', async (req, res) => {
    const query = validateBody(listCompanyJobsSchema, req.query);
    const result = await getCompanyJobs(req.user!.userId, query);
    res.json(result);
});