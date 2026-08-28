import { Router } from "express";
import { authMiddleware } from "../../shared/auth-middleware.js";
import { requireRole } from "../../shared/require-role.js";
import { validateBody } from "../../shared/validate.js";
import { companySchema, inviteMemberSchema, updateMemberSchema } from "./companies.schema.js";
import { getMyCompany, openWorkspace, inviteMember, getMembers, changeMemberRole, deleteMember } from "./companies.service.js";
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

companiesRouter.post('/invitations', async (req, res) => {
    const body = validateBody(inviteMemberSchema, req.body);
    await inviteMember(req.user!.userId, body);
    res.status(201).json({ message: 'Invitation sent.' });
});

companiesRouter.get('/members', async (req, res) => {
    const members = await getMembers(req.user!.userId);
    res.json({ members });
});

companiesRouter.patch('/members/:recruiterId', async (req, res) => {
    const body = validateBody(updateMemberSchema, req.body);
    await changeMemberRole(req.user!.userId, req.params.recruiterId, body);
    res.json({ message: 'Role updated.' });
});

companiesRouter.delete('/members/:recruiterId', async (req, res) => {
    await deleteMember(req.user!.userId, req.params.recruiterId);
    res.status(204).send();
});


