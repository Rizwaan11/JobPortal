import mongoose , {Schema} from "mongoose";

export type IInvitation = {
    companyId:mongoose.Types.ObjectId,
    email:string,
    role:'hr_manager'|'recruiter'|'hiring_manager',
    tokenHash:string,
    expiresAt:Date
}

export const InvitationSchema = new mongoose.Schema<IInvitation>({
    companyId:{
        type:Schema.Types.ObjectId,
        ref:'Company',
        required:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    role:{
        type:String,
        enum:['hr_manager','recruiter','hiring_manager'],
        required:true
    },
    tokenHash:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true,
        expires:0
    }
},{ timestamps: true}
)

export const Invitation = mongoose.model<IInvitation>('Invitation',InvitationSchema)
