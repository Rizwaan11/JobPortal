import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { validateBody } from "../../shared/validate.js";
import { applicantSchema, applicantUpdateSchema, confirmResumeSchema, addShortlistSchema } from "./applicant.schema.js";
import { createProfile, getProfile, updateProfile, getResumeUploadUrl, confirmResumeUpload, addJobToShortlist, getShortlist, removeJobFromShortlist } from "./applicants.service.js";
import { applyToJobsSchema } from "../applications/application.schema.js";
import { applyToJobs } from "../applications/applications.service.js";

export const applicantsRouter = Router();

applicantsRouter.use(authMiddleware, requireRole('applicant'))

applicantsRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

applicantsRouter.post('/profile', async (req, res) => {
    const body = validateBody(applicantSchema, req.body)
    const applicant = await createProfile(req.user!.userId, body);
    res.status(201).json(applicant);
})

applicantsRouter.get('/profile', async (req, res) => {
    const applicant = await getProfile(req.user!.userId);
    res.json(applicant);
})

applicantsRouter.patch('/profile', async (req, res) => {
    const body = validateBody(applicantUpdateSchema, req.body)
    await updateProfile(req.user!.userId, body);
    res.json({ message: 'Profile updated.' });
})

applicantsRouter.post('/profile/resume-upload', async (req, res) => {
    const result = await getResumeUploadUrl(req.user!.userId);
    res.json(result);
})

applicantsRouter.post('/profile/resume', async (req, res) => {
    const body = validateBody(confirmResumeSchema, req.body);
    const resume = await confirmResumeUpload(req.user!.userId, body);
    res.status(201).json(resume);
})

applicantsRouter.post('/shortlist', async (req, res) => {
    const body = validateBody(addShortlistSchema, req.body);
    const item = await addJobToShortlist(req.user!.userId, body);
    res.status(201).json(item);
})

applicantsRouter.get('/shortlist', async (req, res) => {
    const items = await getShortlist(req.user!.userId);
    res.json(items);
})

applicantsRouter.delete('/shortlist/:jobId', async (req, res) => {
    await removeJobFromShortlist(req.user!.userId, req.params.jobId);
    res.json({ message: 'Removed from shortlist.' });
})

applicantsRouter.post('/apply', async (req, res) => {
    const body = validateBody(applyToJobsSchema, req.body);
    const result = await applyToJobs(req.user!.userId, body);
    res.status(201).json(result);
})
