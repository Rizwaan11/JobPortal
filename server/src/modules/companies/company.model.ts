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
        unique:true,
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
        default:false
    },
    suspended:{
        type:Boolean,
        default:false
    }

},{ timestamps: true}
)

export const Company = mongoose.model<ICompany>('Company',CompanySchema)