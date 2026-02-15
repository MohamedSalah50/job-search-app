import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  ApplicationRepository,
  CompanyRepository,
  type JobDocument,
  JobRepository,
  UserRepository,
} from 'src/db';
import { ApplicationStatusEnum, type IAuthRequest } from 'src/common';
import { isValidObjectId, Types } from 'mongoose';
import { GetCompanyJobsDto } from './dto/get-jobs.dto';
import { PaginationDto, SortOrder } from './dto/pagination-job.dto';
import { JobApplicatonDto } from './dto/JobApplicaton.dto';
import { HandleApplicationStatusDto } from './dto/handleApplicationStatusDto';

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly applicationRepository: ApplicationRepository,
  ) {}
  async addJob(dto: CreateJobDto, req: IAuthRequest): Promise<JobDocument> {
    const {
      jobTitle,
      jobDescription,
      seniorityLevel,
      jobLocation,
      workingTime,
      technicalSkills,
      softSkills,
      companyId,
    } = dto;

    const company = await this.companyRepository.findOne({
      filter: {
        _id: companyId,
        deletedAt: { $exists: false },
        bannedAt: { $exists: false },
        approvedByAdmin: true,
      },
      options: { populate: [{ path: 'Hrs' }] },
    });

    if (!company) throw new NotFoundException('company not found');

    const isOwner = company.createdBy.equals(req.user._id);
    const isHR = company.Hrs.some((hr) =>
      (hr as Types.ObjectId).equals(req.user._id),
    );

    if (!isOwner && !isHR) {
      throw new UnauthorizedException('only company owner or HRs can add job');
    }

    const [newJob] =
      (await this.jobRepository.create({
        data: [
          {
            jobTitle,
            jobDescription,
            seniorityLevel,
            jobLocation,
            workingTime,
            technicalSkills,
            softSkills,
            addedBy: req.user._id,
            companyId: company._id,
          },
        ],
      })) || [];

    if (!newJob) throw new BadRequestException('cant create this job');

    return newJob;
  }

  async updateJob(
    jobId: Types.ObjectId,
    req: IAuthRequest,
    dto: UpdateJobDto,
  ): Promise<{ message: string }> {
    const {
      jobTitle,
      jobDescription,
      seniorityLevel,
      jobLocation,
      workingTime,
      technicalSkills,
      softSkills,
    } = dto;

    if (!isValidObjectId(jobId))
      throw new BadRequestException('invalid job id');

    const job = await this.jobRepository.findOne({
      filter: { _id: jobId, closed: false },
    });

    if (!job) throw new NotFoundException('job not found');

    const isJobOwner = (job.addedBy as Types.ObjectId).equals(
      req.user._id as Types.ObjectId,
    );

    if (!isJobOwner)
      throw new UnauthorizedException(
        'you are not authorized to update this job',
      );

    const updatedData: any = {};

    if (jobTitle) updatedData.jobTitle = jobTitle;
    if (jobDescription) updatedData.jobDescription = jobDescription;
    if (seniorityLevel) updatedData.seniorityLevel = seniorityLevel;
    if (jobLocation) updatedData.jobLocation = jobLocation;
    if (workingTime) updatedData.workingTime = workingTime;
    if (technicalSkills) updatedData.technicalSkills = technicalSkills;
    if (softSkills) updatedData.softSkills = softSkills;
    updatedData.updatedBy = req.user._id;

    const updatedJob = await this.jobRepository.updateOne({
      filter: { _id: jobId },
      update: updatedData,
    });

    if (!updatedJob.matchedCount)
      throw new BadRequestException('cant update this job');

    return { message: 'job updated successfully' };
  }

  async deleteJob(
    jobId: Types.ObjectId,
    req: IAuthRequest,
  ): Promise<{ message: string }> {
    if (!isValidObjectId(jobId))
      throw new BadRequestException('invalid job id');

    const job = await this.jobRepository.findOne({
      filter: { _id: jobId, closed: false },
      options: {
        populate: [{ path: 'companyId', populate: { path: 'Hrs' } }],
      },
    });

    if (!job) throw new NotFoundException('job not found');

    const company = job.companyId as any;

    if (!company) throw new NotFoundException('company not found');

    const isJobHr = company.Hrs.some((hr: any) =>
      (hr as Types.ObjectId).equals(req.user._id),
    );

    if (!isJobHr)
      throw new UnauthorizedException(
        'you are not authorized to delete this job',
      );

    await this.jobRepository.updateOne({
      filter: { _id: jobId },
      update: { closed: true },
    });

    return { message: 'job deleted successfully' };
  }

  async getSpecificCompanyJob(
    companyId: Types.ObjectId,
    jobId: Types.ObjectId,
  ) {
    if (!isValidObjectId(companyId)) {
      throw new BadRequestException('Invalid company ID');
    }

    if (!isValidObjectId(jobId)) {
      throw new BadRequestException('Invalid job ID');
    }

    const job = await this.jobRepository.findOne({
      filter: {
        _id: new Types.ObjectId(jobId),
        companyId: new Types.ObjectId(companyId),
        closed: false,
      },
      options: {
        populate: [
          {
            path: 'companyId',
            select: 'companyName companyEmail industry logo',
          },
          { path: 'addedBy', select: 'firstName lastName email' },
        ],
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found for this company');
    }

    return job;
  }

  async getAllCompanyJobs(companyId: Types.ObjectId, dto: GetCompanyJobsDto) {
    // Validate companyId
    if (!isValidObjectId(companyId)) {
      throw new BadRequestException('Invalid company ID');
    }

    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = dto;

    const company = await this.companyRepository.findOne({
      filter: {
        _id: new Types.ObjectId(companyId),
        deletedAt: { $exists: false },
        bannedAt: { $exists: false },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const sortObj: any = {};
    sortObj[sort] = sortOrder === SortOrder.ASC ? 1 : -1;

    const {
      result,
      doc_count,
      total_pages,
      current_page,
      has_next_page,
      has_prev_page,
    } = await this.jobRepository.paginate({
      filter: { companyId: new Types.ObjectId(companyId), closed: false },
      page,
      size: limit,
      options: {
        sort: sortObj,
        populate: [
          {
            path: 'companyId',
            select: 'companyName companyEmail industry logo',
          },
          { path: 'addedBy', select: 'firstName lastName email' },
        ],
      },
    });

    return {
      jobs: result,
      pagination: {
        currentPage: current_page,
        totalPages: total_pages,
        totalCount: doc_count,
        limit,
        hasNextPage: has_next_page,
        hasPrevPage: has_prev_page,
      },
    };
  }

  async getAllJobs(dto: GetCompanyJobsDto) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      sortOrder = SortOrder.ASC,
      jobLocation,
      seniorityLevel,
      workingTime,
      jobTitle,
      technicalSkills,
    } = dto;

    const sortObj: any = {};
    sortObj[sort] = sortOrder === SortOrder.DESC ? 1 : -1;

    const filter: any = { closed: false };

    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;

    if (jobTitle) {
      filter.jobTitle = { $regex: jobTitle, $options: 'i' };
    }

    if (technicalSkills && technicalSkills.length > 0) {
      filter.technicalSkills = { $in: technicalSkills };
    }

    const {
      result,
      doc_count,
      total_pages,
      current_page,
      has_next_page,
      has_prev_page,
    } = await this.jobRepository.paginate({
      filter,
      page,
      size: limit,
      options: {
        sort: sortObj,
        populate: [
          {
            path: 'companyId',
            select: 'companyName companyEmail industry logo',
          },
          { path: 'addedBy', select: 'firstName lastName email' },
        ],
      },
    });

    return {
      jobs: result,
      pagination: {
        currentPage: current_page,
        totalPages: total_pages,
        totalCount: doc_count,
        limit,
        hasNextPage: has_next_page,
        hasPrevPage: has_prev_page,
      },
    };
  }

  async getAllApplicationOnJob(
    jobId: Types.ObjectId,
    req: IAuthRequest,
    dto: PaginationDto,
  ) {
    if (!isValidObjectId(jobId)) {
      throw new BadRequestException('Invalid job ID');
    }

    const job = await this.jobRepository.findOne({
      filter: {
        _id: jobId,
        closed: false,
      },
      options: {
        populate: [
          {
            path: 'companyId',
            populate: { path: 'Hrs' },
          },
        ],
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const company = job.companyId as any;

    const isOwner = company.createdBy.equals(req.user._id);
    const isHR =
      company.Hrs &&
      company.Hrs.some((hr: any) =>
        hr._id ? hr._id.equals(req.user._id) : hr.equals(req.user._id),
      );

    if (!isOwner && !isHR) {
      throw new ForbiddenException('You are not authorized to view this job');
    }

    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = dto;

    const sortObj: any = {};
    sortObj[sort] = sortOrder === SortOrder.ASC ? 1 : -1;

    const {
      result,
      doc_count,
      total_pages,
      current_page,
      has_next_page,
      has_prev_page,
    } = await this.applicationRepository.paginate({
      filter: { jobId },
      page,
      size: limit,
      options: {
        sort: sortObj,
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email mobileNumber profilePic',
          },
        ],
      },
    });

    return {
      job,
      applications: result,
      pagination: {
        currentPage: current_page,
        totalPages: total_pages,
        totalCount: doc_count,
        limit,
        hasNextPage: has_next_page,
        hasPrevPage: has_prev_page,
      },
    };
  }

  async applyJobApplication(
    req: IAuthRequest,
    dto: JobApplicatonDto,
  ): Promise<{ message: string }> {
    const { jobId } = dto;

    const job = await this.jobRepository.findOne({
      filter: {
        _id: jobId,
        closed: false,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const user = await this.userRepository.findOne({
      filter: { _id: req.user._id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const application = await this.applicationRepository.findOne({
      filter: {
        jobId,
        userId: req.user._id,
      },
    });

    if (application) {
      throw new BadRequestException('You have already applied for this job');
    }

    const [jobApplication] =
      (await this.applicationRepository.create({
        data: [
          {
            jobId,
            userId: req.user._id,
            status: ApplicationStatusEnum.PENDING,
          },
        ],
      })) || [];

    if (!jobApplication)
      throw new BadRequestException('Application cannot be created');

    return { message: 'Application created successfully on this job' };
  }

  async handleApplicationStatus(
    applicationId: string,
    req: IAuthRequest,
    dto: HandleApplicationStatusDto,
  ) {
    const { status } = dto;

    if (!isValidObjectId(applicationId)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application = await this.applicationRepository.findOne({
      filter: { _id: applicationId },
      options: {
        populate: [
          {
            path: 'jobId',
            populate: {
              path: 'companyId',
              populate: { path: 'Hrs' },
            },
          },
        ],
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      application.status === ApplicationStatusEnum.ACCEPTED ||
      application.status === ApplicationStatusEnum.REJECTED
    ) {
      throw new BadRequestException(
        `Application already ${application.status.toLowerCase()}`,
      );
    }

    const job = application.jobId as any;
    const company = job.companyId as any;

    const isOwner = company.createdBy.equals(req.user._id);
    const isHR =
      company.HRs &&
      company.HRs.some((hr: any) =>
        hr._id ? hr._id.equals(req.user._id) : hr.equals(req.user._id),
      );

    if (!isOwner && !isHR) {
      throw new ForbiddenException(
        'Only company owner or HRs can handle applications',
      );
    }

    await this.applicationRepository.findOneAndUpdate({
      filter: { _id: new Types.ObjectId(applicationId) },
      update: { status },
    });

    const action =
      status === ApplicationStatusEnum.ACCEPTED ? 'accepted' : 'rejected';

    return { message: `Application ${action} status updated successfully` };
  }
}
