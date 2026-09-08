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

export const scheduleInterviewSchema = z.object({
    scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
        message: 'scheduledAt must be in the future'
    }),
    meetingLink: z.string().min(1),
    notes: z.string().optional()
})

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>

export const recordFeedbackSchema = z.object({
    feedback: z.string().min(1),
    outcome: z.enum(['moved_forward', 'rejected'])
})

export type RecordFeedbackInput = z.infer<typeof recordFeedbackSchema>
