import { IsString } from "class-validator";


export class LoginWithGmailDto {
    @IsString()
    idToken: string
}