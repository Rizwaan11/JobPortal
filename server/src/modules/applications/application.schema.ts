import z from "zod";

export const applyToJobsSchema = z.object({
    jobIds: z.array(z.string().min(1)).min(1).max(10),
    answers: z.record(
        z.string(),
        z.array(z.object({
            questionId: z.string(),
            answer: z.union([z.string(), z.boolean(), z.number()])
        }))
    ).optional().default({})
})

export type ApplyToJobsInput = z.infer<typeof applyToJobsSchema>
