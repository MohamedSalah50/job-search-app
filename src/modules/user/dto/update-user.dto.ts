import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Prop } from '@nestjs/mongoose';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { genderEnum, IsAdult } from 'src/common';
import { containField } from 'src/common/decorators/update.decorator';

@containField()
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @MinLength(2)
    @MaxLength(20)
    @IsOptional()
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(20)
    @IsOptional()
    lastName: string;

    @IsEnum(genderEnum, { message: 'gender must be male or female' })
    @IsOptional()
    gender: genderEnum

    @IsDateString({}, { message: 'DOB must be in format YYYY-MM-DD' })
    @IsAdult({ message: "age must be greater than 18" })
    @IsOptional()
    DOB: Date

    @IsString()
    @IsOptional()
    mobileNumber: string
}
