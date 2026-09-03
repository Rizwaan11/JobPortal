import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { validateBody } from "../../shared/validate.js";
import { applicantSchema, applicantUpdateSchema } from "./applicant.schema.js";
import { createProfile, getProfile, updateProfile } from "./applicants.service.js";

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