import mongoose , {Schema} from "mongoose";

export type IRecruiter = {
    userId:mongoose.Types.ObjectId,
    companyId:mongoose.Types.ObjectId,
    companyRole: 'owner'|'hr_manager'|'recruiter'|'hiring_manager'
}

export const RecruiterSchema = new mongoose.Schema<IRecruiter>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    companyId:{
        type:Schema.Types.ObjectId,
        ref:'Company',
        required:true,
    },
    companyRole:{
       type:String,
       enum:['owner','hr_manager','recruiter','hiring_manager'],
       required:true,
       default:'recruiter',
    }
},{ timestamps: true}
)

export const Recruiter = mongoose.model<IRecruiter>('Recruiter',RecruiterSchema)
