import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { getMyCompany } from "./companies.service.js";
export const companiesRouter = Router();


companiesRouter.use(authMiddleware, requireRole('recruiter'))

companiesRouter.get('/me', async (req, res) => {
    const company = await getMyCompany(req.user!.userId);
    res.json(company);
});