import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { validateBody } from "../../shared/validate.js";
import { scheduleInterviewSchema, recordFeedbackSchema } from "./application.schema.js";
import { moveApplicationStage, scheduleInterview, recordInterviewFeedback } from "./applications.service.js";

export const applicationsRouter = Router();

applicationsRouter.use(authMiddleware, requireRole('recruiter'))

applicationsRouter.patch('/:id/stage', async (req, res) => {
    const updated = await moveApplicationStage(req.user!.userId, req.params.id, req.body.stage);
    res.json(updated);
})

applicationsRouter.post('/:id/interview', async (req, res) => {
    const body = validateBody(scheduleInterviewSchema, req.body);
    const interview = await scheduleInterview(req.user!.userId, req.params.id, body);
    res.status(201).json(interview);
})

applicationsRouter.patch('/interviews/:id/feedback', async (req, res) => {
    const body = validateBody(recordFeedbackSchema, req.body);
    const result = await recordInterviewFeedback(req.user!.userId, req.params.id, body);
    res.json(result);
})
