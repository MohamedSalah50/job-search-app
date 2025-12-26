import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IJob, IUser, JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from "src/common";

export type JobDocument = HydratedDocument<Job>

@Schema({ timestamps: true, strict: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Job implements IJob {
    @Prop({ type: String, required: true, minlength: 5, maxlength: 50 })
    jobTitle: string;
    @Prop({ type: String, enum: JobLocationEnum, required: true })
    jobLocation: JobLocationEnum;
    @Prop({ type: String, enum: WorkingTimeEnum, required: true })
    workingTime: WorkingTimeEnum;
    @Prop({ type: String, enum: SeniorityLevelEnum, required: true })
    seniorityLevel: SeniorityLevelEnum;
    @Prop({ type: String, required: true, minlength: 20, maxlength: 500 })
    jobDescription: string;
    @Prop({ type: [String], required: true })
    technicalSkills: string[];
    @Prop({ type: [String], required: true })
    softSkills: string[];
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    addedBy: Types.ObjectId | IUser;
    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy?: Types.ObjectId | IUser;
    @Prop({ type: Boolean, default: false })
    closed: boolean;
    @Prop({ type: Types.ObjectId, ref: "Company", required: true })
    companyId: Types.ObjectId;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.virtual("jobApplications", {
    ref: "Application",
    localField: "_id",
    foreignField: "jobId"
})


export const JobModel = MongooseModule.forFeature([{
    name: Job.name,
    schema: JobSchema
}])