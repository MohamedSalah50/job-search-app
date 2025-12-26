import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ValidationPipe, Query } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { auth } from 'src/common/decorators/auth.decorator';
import { type IAuthRequest, RoleEnum } from 'src/common';
import { type JobDocument } from 'src/db';
import { Types } from 'mongoose';
import { GetCompanyJobsDto } from './dto/get-jobs.dto';
import { JobApplicatonDto } from './dto/JobApplicaton.dto';


@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) { }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Post("add-job")
  async addJob(@Req() req: IAuthRequest, @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true })) dto: CreateJobDto): Promise<JobDocument> {
    const job = await this.jobService.addJob(dto, req);
    return job
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Patch("/:jobId")
  async updateJob(@Param("jobId") jobId: Types.ObjectId, @Req() req: IAuthRequest, @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true })) dto: UpdateJobDto) {
    return await this.jobService.updateJob(jobId, req, dto);
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Delete("/:jobId")
  async DeleteJob(@Param("jobId") jobId: Types.ObjectId, @Req() req: IAuthRequest) {
    return await this.jobService.deleteJob(jobId, req);
  }


  @auth([RoleEnum.admin, RoleEnum.user])
  @Get('companies/:companyId/jobs/:jobId')
  async getSpecificJob(
    @Param('companyId') companyId: Types.ObjectId,
    @Param('jobId') jobId: Types.ObjectId,
  ) {
    return this.jobService.getSpecificCompanyJob(companyId, jobId);
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Get('companies/:companyId/jobs')
  async getCompaniesJobs(
    @Param('companyId') companyId: Types.ObjectId,
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    dto: GetCompanyJobsDto
  ) {
    return this.jobService.getAllCompanyJobs(companyId, dto);
  }


  @Get('jobs')
  async getJobs(
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    dto: GetCompanyJobsDto
  ) {
    return this.jobService.getAllJobs(dto);
  }


  @auth([RoleEnum.user])
  @Post("apply-jobApplication")
  async applyJobApplication(@Req() req: IAuthRequest,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true }))
    dto: JobApplicatonDto
  ) {
    return this.jobService.applyJobApplication(req, dto);
  }

  @Get(":jobId/applications")
  async getAllApplicationOnJob(@Param("jobId") jobId: Types.ObjectId) {
    return this.jobService.getAllApplicationOnJob(jobId);
  }


} 
