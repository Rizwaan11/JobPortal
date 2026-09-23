import mongoose , {Schema} from "mongoose";
import type { JobAttributes, ScreeningQuestion } from "./job.schema.js";

export type IJob = {
    companyId:mongoose.Types.ObjectId,
    title:string,
    description:string,
    status:'draft'|'open'|'closed',
    deadline?:Date,
    attributes:JobAttributes,
    screeningQuestions:ScreeningQuestion[],
    createdAt:Date,
    updatedAt:Date
}

const JobAttributesSchema = new Schema<JobAttributes>({
    location: { type: String },
    employmentType: {
        type: String,
        enum: ['full_time', 'part_time', 'contract', 'internship'],
    },
    workplaceType: {
        type: String,
        enum: ['onsite', 'remote', 'hybrid'],
    },
    experienceLevel: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
    },
}, { _id: false });

const ScreeningQuestionSchema = new Schema<ScreeningQuestion>({
    id: { type: String, required: true },
    question: { type: String, required: true },
    answerType: {
        type: String,
        enum: ['text', 'number', 'yes_no'],
        required: true,
    },
    required: { type: Boolean, required: true },
}, { _id: false });

export const JobSchema = new mongoose.Schema<IJob>({
    companyId:{
        type:Schema.Types.ObjectId,
        ref:'Company',
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:['draft','open','closed'],
        default:'draft'
    },
    deadline:{
        type:Date,
    },
    attributes:{
        type:JobAttributesSchema,
        default:{}
    },
    screeningQuestions:{
        type:[ScreeningQuestionSchema],
        default:[]
    }
},{ timestamps: true}
)

JobSchema.index({ companyId: 1, createdAt: -1, _id: -1 });
JobSchema.index({ status: 1, createdAt: -1, _id: -1 });
JobSchema.index({ title: 'text', description: 'text' });
export const Job = mongoose.model<IJob>('Job',JobSchema)
