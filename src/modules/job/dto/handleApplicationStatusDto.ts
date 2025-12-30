// dto/handle-application.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatusEnum } from 'src/common';

export class HandleApplicationStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum([ApplicationStatusEnum.ACCEPTED, ApplicationStatusEnum.REJECTED], {
    message: 'Status must be either accepted or rejected',
  })
  status: ApplicationStatusEnum.ACCEPTED | ApplicationStatusEnum.REJECTED;
}
