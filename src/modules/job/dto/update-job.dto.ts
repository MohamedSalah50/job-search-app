import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { containField } from 'src/common';

@containField()
export class UpdateJobDto extends PartialType(CreateJobDto) {
}
