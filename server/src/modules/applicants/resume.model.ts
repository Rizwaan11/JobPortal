import mongoose, { Schema } from "mongoose";

export type IResume = {
    applicantId: mongoose.Types.ObjectId,
    filename: string,
    s3Key: string,
    uploadedAt: Date
}

const ResumeSchema = new mongoose.Schema<IResume>({
    applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
    filename: { type: String, required: true },
    s3Key: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
})

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema)
