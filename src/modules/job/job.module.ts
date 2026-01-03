import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import {
  ApplicationModel,
  ApplicationRepository,
  CompanyModel,
  CompanyRepository,
  JobModel,
  JobRepository,
} from 'src/db';

@Module({
  imports: [JobModel, CompanyModel, ApplicationModel],
  controllers: [JobController],
  providers: [
    JobService,
    CompanyRepository,
    JobRepository,
    ApplicationRepository,
  ],
})
export class JobModule {}
