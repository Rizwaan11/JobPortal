import z from "zod";

export const DEFAULT_PUBLIC_JOBS_LIMIT = 20;

export const publicJobsQuerySchema = z.object({
  q: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(DEFAULT_PUBLIC_JOBS_LIMIT),
});

export type PublicJobsQueryInput = z.infer<typeof publicJobsQuerySchema>;
