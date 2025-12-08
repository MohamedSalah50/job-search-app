import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpModel, OtpRepository, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/db';
import { TokenService } from 'src/utils/security/token.security';
import { JwtService } from '@nestjs/jwt';
import { OtpCleanupService } from 'src/utils/cronjob/otp.cronjob';

@Module({
  imports: [UserModel, OtpModel, TokenModel],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, OtpRepository, TokenService, JwtService, TokenRepository, OtpCleanupService],
})
export class AuthModule { }
