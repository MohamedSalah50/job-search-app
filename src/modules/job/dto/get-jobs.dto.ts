import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination-job.dto';
import { JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from 'src/common';
import { Transform, Type } from 'class-transformer';


export class GetCompanyJobsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsEnum(JobLocationEnum)
    jobLocation?: JobLocationEnum;

    @IsOptional()
    @IsEnum(WorkingTimeEnum)
    workingTime?: WorkingTimeEnum;

    @IsOptional()
    @IsEnum(SeniorityLevelEnum)
    seniorityLevel?: SeniorityLevelEnum;

    @IsOptional()
    @IsString()
    jobTitle?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Type(() => String)
    @Transform(({ value }) => {
        if (typeof value === 'string') return value.split(',');
        return value;
    })
    technicalSkills?: string[];

}