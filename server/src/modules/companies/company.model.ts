import mongoose , {Schema} from "mongoose";

export type ICompany = {
    name:string,
    slug:string,
    website?:string,
    verified:boolean,
    suspended:boolean
}

export const CompanySchema = new mongoose.Schema<ICompany>({
    name:{
        type:String,
        required:true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
    },
    website:{
        type:String,
    },
    verified:{
        type:Boolean,
        default:true
    },
    suspended:{
        type:Boolean,
        default:false
    }

},{ timestamps: true}
)

CompanySchema.index({ verified: 1, suspended: 1 });

export const Company = mongoose.model<ICompany>('Company',CompanySchema)
