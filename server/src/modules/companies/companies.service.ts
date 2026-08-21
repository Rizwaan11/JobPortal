import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { getRecruiterCompany, getCompanyById, createCompany } from './companies.repo.js';
import type { CompanyInput } from './companies.schema.js';

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
