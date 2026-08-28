// ISOLATION RULE: Every company-scoped query must include companyId from
// the authenticated recruiter row (resolved via getRecruiterCompany), never
// from a URL parameter or request body. The recruiter cannot control which
// companyId is used to scope their queries.

import { Job } from "./job.model.js";
import { NotFoundError } from "../../shared/errors.js";

import type { jobInput, UpdateJobInput } from "./job.schema.js";


export const assertJobOwnership = async (jobId: string, companyId: string) => {
    const job = await Job.findById(jobId);
    if (!job || job.companyId.toString() !== companyId) {
        throw new NotFoundError('Job not found');
    }
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
