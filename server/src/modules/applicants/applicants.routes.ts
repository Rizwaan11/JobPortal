import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
export const applicantsRouter = Router();


applicantsRouter.use(authMiddleware, requireRole('applicant'))

applicantsRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));