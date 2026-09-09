import mongoose, { Schema } from "mongoose";

export type IInterview = {
    applicationId: mongoose.Types.ObjectId,
    scheduledAt: Date,
    meetingLink: string,
    notes: string | null,
    feedback: string | null,
    outcome: 'pending' | 'moved_forward' | 'rejected',
    createdAt: Date
}

const InterviewSchema = new mongoose.Schema<IInterview>({
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    scheduledAt: { type: Date, required: true },
    meetingLink: { type: String, required: true },
    notes: { type: String, default: null },
    feedback: { type: String, default: null },
    outcome: {
        type: String,
        enum: ['pending', 'moved_forward', 'rejected'],
        default: 'pending'
    },
}, { timestamps: { createdAt: true, updatedAt: false } })

InterviewSchema.index({ applicationId: 1 })
InterviewSchema.index({ applicationId: 1, outcome: 1, scheduledAt: 1 })

export const Interview = mongoose.model<IInterview>('Interview', InterviewSchema)
