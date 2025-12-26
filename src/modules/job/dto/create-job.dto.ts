import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Types } from "mongoose";
import { IJob, JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from "src/common";

export class CreateJobDto implements Partial<IJob> {
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'job title must be at least 2 characters' })
    @MaxLength(100, { message: 'job title must not exceed 100 characters' })
    jobTitle: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(50, { message: 'job description must be at least 50 characters' })
    @MaxLength(1000, { message: 'job description must not exceed 1000 characters' })
    jobDescription: string;
    @IsNotEmpty({ message: 'seniority level is required' })
    @IsEnum(SeniorityLevelEnum, { message: `Seniority level must be ${Object.values(SeniorityLevelEnum)}` })
    seniorityLevel: SeniorityLevelEnum;
    @IsNotEmpty({ message: 'jobLocation is required' })
    @IsEnum(JobLocationEnum, { message: `jobLocation must be in ${Object.values(JobLocationEnum)}` })
    jobLocation: JobLocationEnum;
    @IsNotEmpty({ message: 'workingTime is required' })
    @IsEnum(WorkingTimeEnum, { message: `workingTime must be in ${Object.values(WorkingTimeEnum)}` })
    workingTime: WorkingTimeEnum;
    @IsArray({ message: 'Technical skills must be an array' })
    @ArrayMinSize(1, { message: 'At least one technical skill is required' })
    @IsString({ each: true, message: 'Each skill must be a string' })
    @ArrayMaxSize(20, { message: 'Maximum 20 technical skills allowed' })
    technicalSkills: string[];
    @IsArray({ message: 'soft skills must be an array' })
    @ArrayMinSize(1, { message: 'At least one soft skill is required' })
    @IsString({ each: true, message: 'Each skill must be a string' })
    @ArrayMaxSize(20, { message: 'Maximum 20 soft skills allowed' })
    softSkills: string[];
    @IsMongoId({ message: 'companyId must be a valid ObjectId' })
    companyId: Types.ObjectId;
}
