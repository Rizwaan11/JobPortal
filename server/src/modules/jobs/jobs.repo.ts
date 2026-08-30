// ISOLATION RULE: Every company-scoped query must include companyId from
// the authenticated recruiter row (resolved via getRecruiterCompany), never
// from a URL parameter or request body. The recruiter cannot control which
// companyId is used to scope their queries.

import { Job } from "./job.model.js";
import { NotFoundError } from "../../shared/errors.js";

import type { jobInput, ListCompanyJobsInput, UpdateJobInput } from "./job.schema.js";


export const assertJobOwnership = async (jobId: string, companyId: string) => {
    const job = await Job.findById(jobId);
    if (!job || job.companyId.toString() !== companyId) {
        throw new NotFoundError('Job not found');
    }
}


export const getJobById = async (jobId: string, companyId: string) => {
    const job = await Job.findOne({ _id: jobId, companyId });
    if (!job) {
        throw new NotFoundError('Job not found');
    }
    return job;
}


export async function createJob(companyId:string,input:jobInput){
    const jobData: { companyId: string; title: string; description: string; deadline?: Date; attributes?: Record<string, unknown>; screeningQuestions?: Record<string, unknown>[] } = {
        companyId,
        title: input.title,
        description: input.description,
    };
    if (input.deadline !== undefined) jobData.deadline = input.deadline;
    if (input.attributes !== undefined) jobData.attributes = input.attributes;
    if (input.screeningQuestions !== undefined) jobData.screeningQuestions = input.screeningQuestions;

    const job = await Job.create(jobData);
    return job;
}


export async function setJobStatus(jobId:string, companyId:string, newStatus:'draft'|'open'|'closed'){
   await Job.findOneAndUpdate({ _id: jobId, companyId }, { status: newStatus }, { new: true });
}



export async function updateJob(jobId: string, companyId: string, input: UpdateJobInput){
    await Job.updateOne({ _id: jobId, companyId }, input)

}



// Encode: created_at ISO string + '|' + id
export function encodeCursor(createdAt: Date, id: string): string {
    return Buffer.from(`${createdAt.toISOString()}|${id}`).toString('base64url');
}

// Decode: returns { createdAt: string, id: string } or null if invalid
export function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const pipeIdx = raw.lastIndexOf('|');
    if (pipeIdx === -1) return null;
    return {
      createdAt: raw.slice(0, pipeIdx),
      id: raw.slice(pipeIdx + 1),
    };
  } catch {
    return null;
  }
}


export async function listJobsForCompany(companyId: string, input: ListCompanyJobsInput){

    const filter : Record<string, unknown> = {
        companyId
    }

    if(input.status){
        filter.status = input.status
    }

    if (input.cursor) {
        const decoded = decodeCursor(input.cursor);
        if (decoded) {
            const cursorDate = new Date(decoded.createdAt);
            filter.$or = [
                { createdAt: { $lt: cursorDate } },
                { createdAt: cursorDate, _id: { $lt: decoded.id } },
            ];
        }
    }

    const jobs = await Job.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(input.limit + 1)
        .select('title status createdAt');

    return jobs;
}