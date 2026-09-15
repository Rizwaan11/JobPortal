import mongoose, { Schema } from "mongoose";

export type IResume = {
    applicantId: mongoose.Types.ObjectId,
    filename: string,
    storageKey: string,
    uploadedAt: Date,
    wordCount?: number | null
}

const ResumeSchema = new mongoose.Schema<IResume>({
    applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
    filename: { type: String, required: true },
    storageKey: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    wordCount: { type: Number, default: null }
})

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema)
