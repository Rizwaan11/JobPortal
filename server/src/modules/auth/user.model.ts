import mongoose , {Schema} from "mongoose";


export type IUser = {
    email:string,
    password:string,
    role:'recruiter' | 'applicant' | 'admin',
    status:'unverified' | 'active'  | 'suspended'
}


export const UserSchema:Schema = new mongoose.Schema<IUser>({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        select:false,
        minlength:8,
        maxlength:72
    },
    role:{
        type:String,
        required:true,
        enum:['recruiter','applicant','admin']
    },
    status:{
        type:String,
        enum:['unverified','active','suspended'],
        default:'unverified'
    },
},{ timestamps: true}
)



export const User = mongoose.model<IUser>('User',UserSchema)