import mongoose , {Schema} from "mongoose";



export type IApplicant = {
    userId:mongoose.Types.ObjectId,
    fullName:string,
    headline?:string,
    location?:string,
    attributes: {
        skills: string[],
        portfolioLinks: string[],
        yearsOfExperience?: number
    }   
}

export const ApplicantSchema = new mongoose.Schema<IApplicant>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    fullName:{
        type:String,
        required:true
    },
    headline:{
        type:String,
    },
    location:{
        type:String,
    },
    attributes: {
        skills: {
             type: [String],
             default: []
        },
            portfolioLinks: {
            type: [String],
            default: []
        },
            yearsOfExperience: {
            type: Number
        }
}
},{ timestamps: true}
)

export const Applicant = mongoose.model<IApplicant>('Applicant',ApplicantSchema)