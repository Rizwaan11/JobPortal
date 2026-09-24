import {assertCompanyRole} from '../companies/companies.service.js';
import { getRecruiterCompany } from '../companies/companies.repo.js';
import { redis } from '../../shared/redis.js';
import { PUBLIC_BOARD_CACHE_KEY } from '../public/public.service.js';
import { logger } from '../../shared/logger.js';


import type { jobInput, ListCompanyJobsInput, UpdateJobInput } from './job.schema.js';
import { ForbiddenError } from '../../shared/errors.js';
import { assertJobOwnership, createJob, decodeCursor, encodeCursor, getJobById, listJobsForCompany, setJobStatus, updateJob } from './jobs.repo.js';


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

    try {
        await redis.del(PUBLIC_BOARD_CACHE_KEY);
    } catch (err) {
        logger.warn({ err }, 'Failed to invalidate public board cache');
    }
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
        logger.warn({ err }, 'Failed to invalidate public board cache');
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
        logger.warn({ err }, 'Failed to invalidate public board cache');
    }
}


export async function getCompanyJobs(userId:string, input: ListCompanyJobsInput){
     const company = await getRecruiterCompany(userId);
    if (!company) {
        throw new ForbiddenError('No company workspace found.');
    }

    const rows = await listJobsForCompany(company.companyId.toString(), input);


    const decodedCursor = input.cursor ? decodeCursor(input.cursor) : null;
    const isPrevious = input.direction === 'previous' && decodedCursor !== null;
    const hasMoreInDirection = rows.length > input.limit;
    const pageRows = hasMoreInDirection ? rows.slice(0, input.limit) : rows;
    const items = isPrevious ? pageRows.reverse() : pageRows;
    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    const previousCursor = firstItem && (isPrevious ? hasMoreInDirection : decodedCursor !== null)
        ? encodeCursor(firstItem.createdAt, firstItem._id.toString())
        : null;
    const nextCursor = lastItem && (isPrevious ? decodedCursor !== null : hasMoreInDirection)
        ? encodeCursor(lastItem.createdAt, lastItem._id.toString())
        : null;

    return { jobs: items, previousCursor, nextCursor };

}
