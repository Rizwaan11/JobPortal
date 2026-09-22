import z from "zod";

export const jobAttributesSchema = z.object({
    location: z.string().min(1).optional(),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
    workplaceType: z.enum(['onsite', 'remote', 'hybrid']).optional(),
    experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead']).optional(),
});

export const screeningQuestionSchema = z.object({
    id: z.string().uuid(),
    question: z.string().min(1),
    answerType: z.enum(['text', 'number', 'yes_no']),
    required: z.boolean(),
});

export const jobSchema = z.object({
    title:z.string().min(1),
    description:z.string().min(1),
    deadline:z.coerce.date().optional(),
    attributes:jobAttributesSchema.optional(),
    screeningQuestions:z.array(screeningQuestionSchema).max(10).optional()

})


export const listCompanyJobsSchema = z.object({
  status: z.enum(['draft', 'open', 'closed']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListCompanyJobsInput = z.infer<typeof listCompanyJobsSchema>;

export type jobInput = z.infer<typeof jobSchema>
export type JobAttributes = z.infer<typeof jobAttributesSchema>
export type ScreeningQuestion = z.infer<typeof screeningQuestionSchema>

export const updateJobSchema = jobSchema.partial()

export type UpdateJobInput = z.infer<typeof updateJobSchema>
