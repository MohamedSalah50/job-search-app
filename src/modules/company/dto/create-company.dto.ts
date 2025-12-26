import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';
import { Types } from 'mongoose';
import { ICompany, numberOfEmployeesEnum } from 'src/common';

export class CreateCompanyDto implements Partial<ICompany> {
    @IsNotEmpty({ message: 'Company name is required' })
    @IsString()
    @MinLength(2, { message: 'Company name must be at least 2 characters' })
    @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
    companyName: string;

    @IsNotEmpty({ message: 'Company email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    companyEmail: string;

    @IsNotEmpty({ message: 'Description is required' })
    @IsString()
    @MinLength(50, { message: 'Description must be at least 50 characters' })
    @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
    description: string;

    @IsNotEmpty({ message: 'Industry is required' })
    @IsString()
    @MinLength(2)
    industry: string;

    @IsNotEmpty({ message: 'Address is required' })
    @IsString()
    @MinLength(5)
    address: string;

    @IsNotEmpty({ message: 'Number of employees is required' })
    @IsEnum(numberOfEmployeesEnum, {
        message: `Number of employees must be ${Object.values(numberOfEmployeesEnum)}`,
    })
    numberOfEmployees: numberOfEmployeesEnum;

    @IsNotEmpty({ message: 'Hrs is required' })
    Hrs: Types.ObjectId[];
}