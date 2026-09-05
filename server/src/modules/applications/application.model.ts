import mongoose, { Schema } from "mongoose";

export type ApplicationSnapshot = {
    fullName: string,
    headline: string | null,
    location: string | null,
    skills: string[],
    portfolioLinks: string[],
    yearsOfExperience: number | null,
    resumeKey: string | null
}

export type IApplication = {
    jobId: mongoose.Types.ObjectId,
    applicantId: mongoose.Types.ObjectId,
    stage: 'applied' | 'screening' | 'interview' | 'final_interview' | 'offer' | 'hired' | 'rejected',
    status: 'active' | 'withdrawn',
    answers: Record<string, unknown>[],
    snapshot: ApplicationSnapshot,
    createdAt: Date,
    updatedAt: Date
}

const ApplicationSchema = new mongoose.Schema<IApplication>({
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
    stage: {
        type: String,
        enum: ['applied', 'screening', 'interview', 'final_interview', 'offer', 'hired', 'rejected'],
        default: 'applied'
    },
    status: {
        type: String,
        enum: ['active', 'withdrawn'],
        default: 'active'
    },
    answers: { type: [Schema.Types.Mixed], default: [] } as any,
    snapshot: { type: Schema.Types.Mixed, default: {} } as any,
}, { timestamps: true })

ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true })

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema)
