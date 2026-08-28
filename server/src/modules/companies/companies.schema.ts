import {z} from 'zod';

export const companySchema = z.object({
    name:z.string().min(2,'Company name must be at least 2 characters').max(100,'Company name must be less than 100 characters'),
    website:z.string().url('Must be a valid URL').optional(),
})


export type CompanyInput = z.infer<typeof companySchema>;

export const inviteMemberSchema = z.object({
    email:z.string().email('Must be a valid email address'),
    role:z.enum(['hr_manager','recruiter','hiring_manager']),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberSchema = z.object({
    role:z.enum(['hr_manager','recruiter','hiring_manager']),
})

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;