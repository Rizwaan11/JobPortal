import mongoose , {Schema} from "mongoose";

export type IRefreshToken = {
    userId:mongoose.Types.ObjectId,
    tokenHash:string,
    expiresAt:Date
}

export const RefreshTokenSchema = new mongoose.Schema<IRefreshToken>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    tokenHash:{
        type:String,
        required:true,
        unique:true
    },
    expiresAt:{
        type:Date,
        required:true,
        expires:0
    }
},{ timestamps: true}
)

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken',RefreshTokenSchema)
