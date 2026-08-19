import mongoose , {Schema} from "mongoose";

export type IEmailVerification = {
    userId:mongoose.Types.ObjectId,
    otpHash:string,
    expiresAt:Date
}

export const EmailVerificationSchema = new mongoose.Schema<IEmailVerification>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    otpHash:{
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

export const EmailVerification = mongoose.model<IEmailVerification>('EmailVerification',EmailVerificationSchema)
