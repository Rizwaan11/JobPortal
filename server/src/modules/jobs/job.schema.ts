import z from "zod";

export const jobSchema = z.object({
    title:z.string().min(1),
    description:z.string().min(1),
    deadline:z.coerce.date().optional(),
    attributes:z.record(z.unknown()).optional(),
    screeningQuestions:z.array(z.record(z.unknown())).optional()

})

export type jobInput = z.infer<typeof jobSchema>

export const updateJobSchema = jobSchema.partial()

export type UpdateJobInput = z.infer<typeof updateJobSchema>
