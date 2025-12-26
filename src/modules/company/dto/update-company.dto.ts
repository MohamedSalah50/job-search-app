import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { containField, numberOfEmployeesEnum } from 'src/common';
import { CreateCompanyDto } from './create-company.dto';
import { PartialType } from '@nestjs/mapped-types';


@containField()
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
    @IsString()
    @MinLength(2, { message: 'Company name must be at least 2 characters' })
    @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
    @IsOptional()
    companyName: string;

    @IsEmail({}, { message: 'Invalid email format' })
    @IsOptional()
    companyEmail: string;

    @IsString()
    @MinLength(50, { message: 'Description must be at least 50 characters' })
    @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
    @IsOptional()
    description: string;

    @IsString()
    @MinLength(2)
    @IsOptional()
    industry: string;

    @IsString()
    @MinLength(5)
    @IsOptional()
    address: string;

    @IsEnum(numberOfEmployeesEnum, {
        message: 'Number of employees must be: small, medium, large, xLarge, or enterprise',
    })
    @IsOptional()
    numberOfEmployees: numberOfEmployeesEnum;
}

