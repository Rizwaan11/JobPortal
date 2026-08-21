import {z} from 'zod';

export const companySchema = z.object({
    name:z.string().min(2,'Company name must be at least 2 characters').max(100,'Company name must be less than 100 characters'),
    website:z.string().url('Must be a valid URL').optional(),
})


export type CompanyInput = z.infer<typeof companySchema>;