import { Router } from "express";
import { validateQuery } from "../../shared/validate.js";
import { publicJobsQuerySchema } from "./public.schema.js";
import { getPublicJobs, getPublicJob } from "./public.service.js";

export const publicRouter = Router();

publicRouter.get('/jobs', async (req, res) => {
    const query = validateQuery(publicJobsQuerySchema, req.query);
    const result = await getPublicJobs(query);
    res.json(result);
});

publicRouter.get('/jobs/:id', async (req, res) => {
    const job = await getPublicJob(req.params.id);
    res.json(job);
});
