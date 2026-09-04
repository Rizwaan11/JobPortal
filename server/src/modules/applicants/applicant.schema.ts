import z from "zod";

export const applicantSchema = z.object({
    fullName:z.string().min(1),
    headline:z.string().optional(),
    location:z.string().optional(),
    attributes:z.object({
        skills:z.array(z.string()).default([]),
        portfolioLinks:z.array(z.string()).default([]),
        yearsOfExperience:z.number().optional()
    }
    )
})

const applicantAttributesUpdateSchema = z.object({
    skills: z.array(z.string()).optional(),
    portfolioLinks: z.array(z.string()).optional(),
    yearsOfExperience: z.number().optional()
})

export const applicantUpdateSchema = z.object({
    fullName: z.string().min(1).optional(),
    headline: z.string().optional(),
    location: z.string().optional(),
    attributes: applicantAttributesUpdateSchema.optional()
})

export const confirmResumeSchema = z.object({
    key: z.string().min(1),
    filename: z.string().min(1),
})

export const addShortlistSchema = z.object({
    jobId: z.string().min(1)
})

export type ApplicantInput = z.infer<typeof applicantSchema>
export type ApplicantEditInput= z.infer<typeof applicantUpdateSchema>
export type ConfirmResumeInput = z.infer<typeof confirmResumeSchema>
export type AddShortlistInput = z.infer<typeof addShortlistSchema>
