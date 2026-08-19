import { NotFoundError } from '../../shared/errors.js';
import { getRecruiterCompany, getCompanyById } from './companies.repo.js';

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