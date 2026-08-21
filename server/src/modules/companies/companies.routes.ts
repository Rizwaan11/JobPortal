import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { validateBody } from "../../shared/validate.js";
import { companySchema } from "./companies.schema.js";
import { getMyCompany, openWorkspace } from "./companies.service.js";
export const companiesRouter = Router();


companiesRouter.use(authMiddleware, requireRole('recruiter'))

companiesRouter.get('/me', async (req, res) => {
    const company = await getMyCompany(req.user!.userId);
    res.json(company);
});

companiesRouter.post('/', async (req, res) => {
    const body = validateBody(companySchema, req.body);
    const company = await openWorkspace(req.user!.userId, body);
    res.status(201).json(company);
});
