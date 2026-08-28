import {assertCompanyRole} from '../companies/companies.service.js';
import { getRecruiterCompany } from '../companies/companies.repo.js';


import type { jobInput, UpdateJobInput } from './job.schema.js';
import { ForbiddenError } from '../../shared/errors.js';
import { assertJobOwnership, createJob, setJobStatus, updateJob } from './jobs.repo.js';


export async function postJob(userId: string, input: jobInput) {
    const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }

    assertCompanyRole(company.companyRole, ['owner','hr_manager','recruiter']);
    const job = await createJob(company.companyId.toString(), input);
    return job;
}




export async function editJob(userId: string, jobId: string, input: UpdateJobInput){
const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner','hr_manager','recruiter']);

    await assertJobOwnership(jobId, company.companyId.toString());
    await updateJob(jobId, company.companyId.toString(), input)
}




export async function publishJob(userId: string, jobId: string) {
const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner','hr_manager','recruiter']);

    await assertJobOwnership(jobId, company.companyId.toString());
    await setJobStatus(jobId, company.companyId.toString(), 'open');
}



export async function closeJob(userId: string, jobId: string){
const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner','hr_manager','recruiter']);

    await assertJobOwnership(jobId, company.companyId.toString());
    await setJobStatus(jobId, company.companyId.toString(), 'closed');
}



