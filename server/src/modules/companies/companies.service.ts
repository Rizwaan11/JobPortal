import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js';
import { config } from '../../shared/config.js';
import { sendInvitationEmail } from '../../shared/mailer.js';
import {
  getRecruiterCompany,
  getCompanyById,
  createCompany,
  findExistingMember,
  findPendingInvitation,
  createInvitation,
  updateMemberRole,
  removeMember,
  listCompanyMembers,
  getMemberById,
} from './companies.repo.js';
import type { CompanyInput, InviteMemberInput, UpdateMemberInput } from './companies.schema.js';

export async function getMyCompany(userId: string) {
  const recruiter = await getRecruiterCompany(userId);

  if (!recruiter) {
    throw new NotFoundError('No company associated with this account');
  }

  const company = await getCompanyById(recruiter.companyId.toString());

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return company;
}

export async function openWorkspace(userId: string, input: CompanyInput) {
  const existing = await getRecruiterCompany(userId);

  if (existing) {
    throw new ConflictError('You already have a company workspace.');
  }

  return createCompany(input, userId);
}

export function assertCompanyRole(companyRole: string, allowed: string[]) {
  if (!allowed.includes(companyRole)) {
    throw new ForbiddenError('You do not have permission to perform this action.');
  }
}

export async function inviteMember(userId: string, input: InviteMemberInput) {
  const company = await getRecruiterCompany(userId);

  if (!company) {
    throw new ForbiddenError('No company workspace found.');
  }

  assertCompanyRole(company.companyRole, ['owner', 'hr_manager']);

  const existing = await findExistingMember(company.companyId.toString(), input.email);

  if (existing) {
    throw new ConflictError('This person is already a member of your company.');
  }

  const pending = await findPendingInvitation(company.companyId.toString(), input.email);

  if (pending) {
    throw new ConflictError('A pending invitation for this email already exists.');
  }

  const rawToken = await createInvitation(company.companyId.toString(), input);
  const link = `${config.APP_BASE_URL}/auth/accept-invitation?token=${rawToken}`;

  await sendInvitationEmail(input.email, link);
}


export async function getMembers(userId:string){
  const company = await getRecruiterCompany(userId);
  if (!company) {
    throw new ForbiddenError('No company workspace found.');
  }

  assertCompanyRole(company.companyRole, ['owner', 'hr_manager']);

  const members = await listCompanyMembers(company.companyId.toString()); 

  return members; 

}


export async function changeMemberRole(userId:string, recruiterId:string, newRole:UpdateMemberInput){
  const company = await getRecruiterCompany(userId);
  if (!company) {
    throw new ForbiddenError('No company workspace found.');
  }

  assertCompanyRole(company.companyRole, ['owner']);

  const member = await getMemberById(company.companyId.toString(), recruiterId);
  if (!member) {
    throw new NotFoundError('Member not found.');
  }

  if (member.userId.toString() === userId) {
    throw new ForbiddenError('You cannot change your own role.');
  }  
  if (member.companyRole === 'owner') {
    throw new ForbiddenError('The owner role cannot be changed via this endpoint.');
  }

  await updateMemberRole(company.companyId.toString(), recruiterId, newRole);
}


export async function deleteMember(userId:string, recruiterId:string){
  const company = await getRecruiterCompany(userId);
  if (!company) {
    throw new ForbiddenError('No company workspace found.');
  }

  assertCompanyRole(company.companyRole, ['owner', 'hr_manager']);

  const member = await getMemberById(company.companyId.toString(), recruiterId);
  if (!member) {
    throw new NotFoundError('Member not found.');
  }


  if (member.userId.toString() === userId) {
    throw new ForbiddenError('You cannot remove yourself from the company.');
  }
  await removeMember(company.companyId.toString(), recruiterId);
  
}