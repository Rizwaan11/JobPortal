import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
export const adminRouter = Router();


adminRouter.use(authMiddleware, requireRole('admin'))

adminRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));