import mongoose, { Schema } from "mongoose";

export type IShortlistItem = {
    applicantId: mongoose.Types.ObjectId,
    jobId: mongoose.Types.ObjectId,
    createdAt: Date
}

const ShortlistItemSchema = new mongoose.Schema<IShortlistItem>({
    applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } })

ShortlistItemSchema.index({ applicantId: 1, jobId: 1 }, { unique: true })

export const ShortlistItem = mongoose.model<IShortlistItem>('ShortlistItem', ShortlistItemSchema)
