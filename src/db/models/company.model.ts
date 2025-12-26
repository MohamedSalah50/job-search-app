import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ICompany, IMedia, IUser, numberOfEmployeesEnum } from "src/common";


export type CompanyDocument = HydratedDocument<Company>

@Schema({ _id: false })
export class Media {
    @Prop({ required: true })
    secure_url: string
    @Prop({ required: true })
    public_id: string
}

@Schema({ timestamps: true, strict: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Company implements ICompany {
    @Prop({ required: true, type: String, unique: true })
    companyName: string;
    @Prop({ required: true, type: String, unique: true })
    companyEmail: string;
    @Prop({ required: true, type: String })
    description: string;
    @Prop({ required: true, type: String })
    industry: string;
    @Prop({ required: true, type: String })
    address: string;


    @Prop({ required: true, enum: numberOfEmployeesEnum, type: String })
    numberOfEmployees: numberOfEmployeesEnum;
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId;
    @Prop({ type: Media })
    logo: Media;
    @Prop({ type: Media })
    coverPic: Media;
    @Prop({ type: [Types.ObjectId], ref: "User", default: [] })
    Hrs: Types.ObjectId[] | IUser[];
    @Prop({ type: Media })
    legalAttachments: Media;
    @Prop({ type: Boolean, default: false })
    approvedByAdmin: boolean

    @Prop({ type: Date })
    deletedAt: Date
    @Prop({ type: Date })
    bannedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId"
})

CompanySchema.index({ createdBy: 1 });
CompanySchema.index({ approvedByAdmin: 1 });
CompanySchema.index({ deletedAt: 1 });
CompanySchema.index({ companyName: 'text', description: 'text' });


export const CompanyModel = MongooseModule.forFeature([{
    name: Company.name,
    schema: CompanySchema
}])