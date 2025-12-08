import { IsString, IsStrongPassword, MinLength } from "class-validator"


export class UpdatePasswordDto {
    @IsString()
    @MinLength(6)
    @IsStrongPassword()
    oldPassword: string
    @IsString()
    @MinLength(6)
    @IsStrongPassword()
    newPassword: string
}