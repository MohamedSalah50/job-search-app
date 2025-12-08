import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length, MinLength } from "class-validator"
import { IUser } from "src/common"

export class ResetPasswordDto {
    @IsEmail()
    email: string
    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: "otp must be 6 digits" })
    otp: string
    @IsString()
    @MinLength(6)
    @IsStrongPassword()
    password: string
}