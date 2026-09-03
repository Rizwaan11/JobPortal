import { listPublicJobs, getPublicJobById } from "./public.repo.js";
import { encodeCursor } from "../jobs/jobs.repo.js";
import { redis } from "../../shared/redis.js";
import { config } from "../../shared/config.js";

import type { PublicJobsQueryInput } from "./public.schema.js";
import { DEFAULT_PUBLIC_JOBS_LIMIT } from "./public.schema.js";

export const PUBLIC_BOARD_CACHE_KEY = 'jobs:public:page1';

export async function getPublicJobs(input: PublicJobsQueryInput) {
    const isCacheable = !input.cursor && !input.q && input.limit === DEFAULT_PUBLIC_JOBS_LIMIT;

    if (isCacheable) {
        const cached = await redis.get(PUBLIC_BOARD_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    }

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

    const result = { jobs: items, nextCursor };

    if (isCacheable) {
        await redis.set(PUBLIC_BOARD_CACHE_KEY, JSON.stringify(result), { EX: config.CACHE_TTL_SECONDS });
    }

    return result;
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
