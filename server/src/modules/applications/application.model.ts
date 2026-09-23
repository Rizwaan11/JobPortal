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

export type ApplicationAnswer = {
    questionId: string,
    answer: string | boolean | number
}

export type IApplication = {
    jobId: mongoose.Types.ObjectId,
    applicantId: mongoose.Types.ObjectId,
    stage: 'applied' | 'screening' | 'interview' | 'final_interview' | 'offer' | 'hired' | 'rejected',
    status: 'active' | 'withdrawn',
    answers: ApplicationAnswer[],
    snapshot: ApplicationSnapshot,
    createdAt: Date,
    updatedAt: Date
}

const ApplicationAnswerSchema = new Schema<ApplicationAnswer>({
    questionId: { type: String, required: true },
    answer: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const ApplicationSnapshotSchema = new Schema<ApplicationSnapshot>({
    fullName: { type: String, required: true },
    headline: { type: String, default: null },
    location: { type: String, default: null },
    skills: { type: [String], default: [] },
    portfolioLinks: { type: [String], default: [] },
    yearsOfExperience: { type: Number, default: null },
    resumeKey: { type: String, default: null },
}, { _id: false });

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
    answers: { type: [ApplicationAnswerSchema], default: [] },
    snapshot: { type: ApplicationSnapshotSchema, required: true },
}, { timestamps: true })

ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true })

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema)
