import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ApplicationStatusEnum, IApplication, IJob, IMedia, IUser } from "src/common";
import { Media } from "./company.model";

export type ApplicationDocument = HydratedDocument<Application>

@Schema({ timestamps: true, strict: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Application implements IApplication {
    @Prop({ type: Types.ObjectId, ref: "Job", required: true })
    jobId: Types.ObjectId | IJob;
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    userId: Types.ObjectId | IUser;
    @Prop({ type: Media, required: false })
    userCv: Media;
    @Prop({ type: String, enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
    status: ApplicationStatusEnum
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export const ApplicationModel = MongooseModule.forFeature([{
    name: Application.name,
    schema: ApplicationSchema
}])