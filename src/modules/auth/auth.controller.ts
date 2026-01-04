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
import { type IAuthRequest, IResponse, RoleEnum, tokenEnum } from 'src/common';
import { successResponse } from 'src/utils';
import { LoginResponse } from './entities/auth.entity';

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
  ): Promise<IResponse> {
    await this.authService.signup(dto);
    return successResponse({
      message: 'user created successfully',
      status: 201,
    });
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
  ): Promise<IResponse> {
    await this.authService.resendConfirmEmailOtp(dto);
    return successResponse({ message: 'email resent successfully' });
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
  ): Promise<IResponse> {
    await this.authService.confirmEmail(dto);
    return successResponse({ message: 'email confirmed successfully' });
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
  ): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authService.login(dto);
    return successResponse<LoginResponse>({ data: { credentials } });
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
  ): Promise<IResponse> {
    await this.authService.sendForgotPassword(dto);
    return successResponse({ message: 'email resent successfully' });
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
  ): Promise<IResponse> {
    await this.authService.resetForgotPassword(dto);
    return successResponse({ message: 'password reseted successfully' });
  }

  @Post('/refresh-token')
  @auth([RoleEnum.user, RoleEnum.admin], tokenEnum.refresh)
  async refreshToken(
    @Req() req: IAuthRequest,
  ): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authService.refreshToken(req);
    return successResponse<LoginResponse>({ data: { credentials } });
  }
}
