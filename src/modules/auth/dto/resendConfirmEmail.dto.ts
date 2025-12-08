import { IsEmail } from "class-validator";

export class resendConfirmEmailDto {
    @IsEmail()
    email: string
}