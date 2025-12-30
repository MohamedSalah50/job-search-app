import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ApplicationStatusEnum,
  IApplication,
  IJob,
  IMedia,
  IUser,
} from 'src/common';
import { Media } from './company.model';
import { emailEmitter } from 'src/utils';

export type ApplicationDocument = HydratedDocument<Application>;

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Application implements IApplication {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId | IJob;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId | IUser;
  @Prop({ type: Media, required: false })
  userCv: Media;
  @Prop({
    type: String,
    enum: ApplicationStatusEnum,
    default: ApplicationStatusEnum.PENDING,
  })
  status: ApplicationStatusEnum;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

ApplicationSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  // Check if status is being modified
  if (update.status || update.$set?.status) {
    (this as any).wasModified = true;
    (this as any).newStatus = update.status || update.$set?.status;
  }

  next();
});

ApplicationSchema.post('findOneAndUpdate', async function (doc: any) {
  const that = this as any;

  if (
    that.wasModified &&
    (that.newStatus === ApplicationStatusEnum.ACCEPTED ||
      that.newStatus === ApplicationStatusEnum.REJECTED)
  ) {
    await doc.populate([
      {
        path: 'userId',
        select: 'firstName lastName email',
      },
      {
        path: 'jobId',
        select: 'jobTitle',
        populate: {
          path: 'companyId',
          select: 'companyName',
        },
      },
    ]);

    const user = doc.userId;
    const job = doc.jobId;
    const company = job.companyId;

    emailEmitter.emit(that.newStatus, {
      to: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      jobTitle: job.jobTitle,
      companyName: company.companyName,
      status: that.newStatus,
    });
  }
});

export const ApplicationModel = MongooseModule.forFeature([
  {
    name: Application.name,
    schema: ApplicationSchema,
  },
]);
