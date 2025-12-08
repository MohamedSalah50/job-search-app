import { IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MaxLength, min, MinLength } from "class-validator";
import { genderEnum, IsAdult, IsMatched, IUser } from "src/common";

export class signupDto implements Partial<IUser> {

    // @IsString()
    // @IsNotEmpty()
    // @MinLength(2)
    // @MaxLength(20)
    // firstName: string;

    // @IsString()
    // @IsNotEmpty()
    // @MinLength(2)
    // @MaxLength(20)
    // lastName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    userName: string;

    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    @IsStrongPassword()
    password: string

    @IsString()
    @MinLength(6)
    @IsMatched<string>(['password'], {
        message: 'password and confirmPassword mismatched',
    })
    confirmPassword: string



    @IsString()
    @IsOptional()
    mobileNumber?: string;

    @IsString()
    @IsOptional()
    gender?: genderEnum;

    @IsDateString({}, { message: 'DOB must be in format YYYY-MM-DD' })
    @IsAdult({ message: "age must be greater than 18" })
    DOB: Date
}
