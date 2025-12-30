import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signup.dto';
import { resendConfirmEmailDto } from './dto/resendConfirmEmail.dto';
import { ConfirmEmailDto } from './dto/confirmEmailDto.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { auth } from 'src/common/decorators/auth.decorator';
import { type IAuthRequest, RoleEnum, tokenEnum } from 'src/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: signupDto,
  ) {
    return await this.authService.signup(dto);
  }

  @Post('/resendConfirmEmailOtp')
  async ResendConfirmEmailOtp(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: resendConfirmEmailDto,
  ) {
    await this.authService.resendConfirmEmailOtp(dto);
    return 'email resent successfully';
  }

  @Patch('/confirmEmail')
  async confirmEmail(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: ConfirmEmailDto,
  ) {
    return await this.authService.confirmEmail(dto);
  }

  @Post('/login')
  async login(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: LoginDto,
  ) {
    const credentials = await this.authService.login(dto);
    return credentials;
  }

  @Post('/sendForgotPassword')
  async sendForgotPassword(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: ForgotPasswordDto,
  ) {
    await this.authService.sendForgotPassword(dto);
    return 'email sent successfully';
  }

  @Post('/resetForgotPassword')
  async resetForgotPassword(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: ResetPasswordDto,
  ) {
    await this.authService.resetForgotPassword(dto);
    return 'password reset successfully , please login again';
  }

  @Post('/refresh-token')
  @auth([RoleEnum.user, RoleEnum.admin], tokenEnum.refresh)
  async refreshToken(@Req() req: IAuthRequest) {
    const credentials = await this.authService.refreshToken(req);
    return credentials;
  }
}
