import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { ApplicationStatusEnum, IApplication, IMedia } from 'src/common';

export class JobApplicatonDto implements Partial<IApplication> {
  @IsNotEmpty({ message: 'job id is required' })
  @IsMongoId({ message: 'job id must be a valid mongo id' })
  jobId: Types.ObjectId;

  // userCv?: IMedia | undefined
}
