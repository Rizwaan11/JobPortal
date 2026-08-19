import mongoose , {Schema} from "mongoose";

export type IJob = {
    companyId:mongoose.Types.ObjectId,
    title:string,
    description:string,
    location?:string,
    employmentType:'full_time'|'part_time'|'contract'|'internship',
    status:'open'|'closed'
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
    location:{
        type:String,
    },
    employmentType:{
        type:String,
        enum:['full_time','part_time','contract','internship'],
        required:true,
    },
    status:{
        type:String,
        enum:['open','closed'],
        default:'open'
    }
},{ timestamps: true}
)

export const Job = mongoose.model<IJob>('Job',JobSchema)
