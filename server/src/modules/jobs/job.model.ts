import mongoose , {Schema} from "mongoose";

export type IJob = {
    companyId:mongoose.Types.ObjectId,
    title:string,
    description:string,
    status:'draft'|'open'|'closed',
    deadline?:Date,
    attributes:Record<string, unknown>,
    screeningQuestions:Record<string, unknown>[]
}

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
        type:Schema.Types.Mixed,
        default:{}
    },
    screeningQuestions:{
        type:[Schema.Types.Mixed],
        default:[]
    } as any
},{ timestamps: true}
)

export const Job = mongoose.model<IJob>('Job',JobSchema)
