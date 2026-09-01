import { listPublicJobs, getPublicJobById } from "./public.repo.js";
import { encodeCursor } from "../jobs/jobs.repo.js";

import type { PublicJobsQueryInput } from "./public.schema.js";

export async function getPublicJobs(input: PublicJobsQueryInput) {
    const rows = await listPublicJobs(input);

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

export async function getPublicJob(jobId: string) {
    const { job, companyName } = await getPublicJobById(jobId);

    return {
        id: job._id,
        title: job.title,
        description: job.description,
        deadline: job.deadline,
        createdAt: job.createdAt,
        attributes: job.attributes,
        screeningQuestions: job.screeningQuestions,
        companyName,
    };
}
