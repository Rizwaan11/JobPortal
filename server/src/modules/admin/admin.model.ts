import mongoose , {Schema} from "mongoose";

export type IAdmin = {
    userId:mongoose.Types.ObjectId
}

export const AdminSchema = new mongoose.Schema<IAdmin>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    }
},{ timestamps: true}
)

export const Admin = mongoose.model<IAdmin>('Admin',AdminSchema)