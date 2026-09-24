import { Job } from "../jobs/job.model.js";
import { Company } from "../companies/company.model.js";
import { decodeCursor } from "../jobs/jobs.repo.js";
import { NotFoundError } from "../../shared/errors.js";

import type { PublicJobsQueryInput } from "./public.schema.js";

export async function listPublicJobs(input: PublicJobsQueryInput) {
    const visibleCompanies = await Company.find({ verified: true, suspended: false }).select('_id');
    const companyIds = visibleCompanies.map((c) => c._id);

    const filter: Record<string, unknown> = {
        status: 'open',
        companyId: { $in: companyIds },
    };

    if (input.q) {
        filter.$text = { $search: input.q };
    }

    const decoded = input.cursor ? decodeCursor(input.cursor) : null;
    const isPrevious = input.direction === 'previous' && decoded !== null;

    if (decoded) {
            const cursorDate = new Date(decoded.createdAt);
            filter.$or = isPrevious
                ? [
                    { createdAt: { $gt: cursorDate } },
                    { createdAt: cursorDate, _id: { $gt: decoded.id } },
                ]
                : [
                    { createdAt: { $lt: cursorDate } },
                    { createdAt: cursorDate, _id: { $lt: decoded.id } },
                ];
    }

    const sortDirection: 1 | -1 = isPrevious ? 1 : -1;

    const jobs = await Job.find(filter)
        .sort({ createdAt: sortDirection, _id: sortDirection })
        .limit(input.limit + 1)
        .select('title description deadline createdAt companyId')
        .populate('companyId', 'name');

    return jobs;
}

export async function getPublicJobById(jobId: string) {
    const job = await Job.findOne({ _id: jobId, status: 'open' })
        .select('title description deadline createdAt companyId attributes screeningQuestions');

    if (!job) {
        throw new NotFoundError('Job not found');
    }

    const company = await Company.findOne({ _id: job.companyId, verified: true, suspended: false }).select('name');

    if (!company) {
        throw new NotFoundError('Job not found');
    }

    return { job, companyName: company.name };
}
