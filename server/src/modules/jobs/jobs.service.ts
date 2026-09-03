import {assertCompanyRole} from '../companies/companies.service.js';
import { getRecruiterCompany } from '../companies/companies.repo.js';
import { redis } from '../../shared/redis.js';
import { PUBLIC_BOARD_CACHE_KEY } from '../public/public.service.js';


import type { jobInput, ListCompanyJobsInput, UpdateJobInput } from './job.schema.js';
import { ForbiddenError } from '../../shared/errors.js';
import { assertJobOwnership, createJob, encodeCursor, getJobById, listJobsForCompany, setJobStatus, updateJob } from './jobs.repo.js';


export async function getJob(userId: string, jobId: string) {
    const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }

    return getJobById(jobId, company.companyId.toString());
}


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

    try {
        await redis.del(PUBLIC_BOARD_CACHE_KEY);
    } catch (err) {
        console.error('[cache] Failed to invalidate public board cache:', err);
    }
}



export async function closeJob(userId: string, jobId: string){
const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }
    assertCompanyRole(company.companyRole, ['owner','hr_manager','recruiter']);

    await assertJobOwnership(jobId, company.companyId.toString());
    await setJobStatus(jobId, company.companyId.toString(), 'closed');

    try {
        await redis.del(PUBLIC_BOARD_CACHE_KEY);
    } catch (err) {
        console.error('[cache] Failed to invalidate public board cache:', err);
    }
}


export async function getCompanyJobs(userId:string, input: ListCompanyJobsInput){
     const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }

    const rows = await listJobsForCompany(company.companyId.toString(), input);


    const hasNextPage = rows.length > input.limit;
    const items = hasNextPage ? rows.slice(0, input.limit) : rows;

    let nextCursor: string | null = null;

    if (hasNextPage) {
        const lastItem = items[items.length - 1];
        if (lastItem) {
            nextCursor = encodeCursor(lastItem.createdAt, lastItem._id.toString());
        }
    }

    return { jobs: items, nextCursor };

}
