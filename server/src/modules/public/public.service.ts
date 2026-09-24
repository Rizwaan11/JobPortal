import { listPublicJobs, getPublicJobById } from "./public.repo.js";
import { decodeCursor, encodeCursor } from "../jobs/jobs.repo.js";
import { redis } from "../../shared/redis.js";
import { config } from "../../shared/config.js";
import { logger } from "../../shared/logger.js";

import type { PublicJobsQueryInput } from "./public.schema.js";
import { DEFAULT_PUBLIC_JOBS_LIMIT } from "./public.schema.js";

export const PUBLIC_BOARD_CACHE_KEY = 'jobs:public:page1';

export async function getPublicJobs(input: PublicJobsQueryInput) {
    const isCacheable = !input.cursor && !input.q && input.limit === DEFAULT_PUBLIC_JOBS_LIMIT;

    if (isCacheable) {
        try {
            const cached = await redis.get(PUBLIC_BOARD_CACHE_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (err) {
            logger.warn({ err }, 'Failed to read public board cache');
        }
    }

    const rows = await listPublicJobs(input);

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

    const result = { jobs: items, previousCursor, nextCursor };

    if (isCacheable) {
        try {
            await redis.set(PUBLIC_BOARD_CACHE_KEY, JSON.stringify(result), { EX: config.CACHE_TTL_SECONDS });
        } catch (err) {
            logger.warn({ err }, 'Failed to write public board cache');
        }
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
