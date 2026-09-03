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

export type ApplicantInput = z.infer<typeof applicantSchema>
export type ApplicantEditInput= z.infer<typeof applicantUpdateSchema>
