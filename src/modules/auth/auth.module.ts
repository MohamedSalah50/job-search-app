import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpModel, OtpRepository } from 'src/db';
import { OtpCleanupService } from 'src/utils/cronjob/otp.cronjob';
import { SharedAutnenticationModule } from 'src/common/modules/autnentication.module';

@Module({
  imports: [OtpModel],
  controllers: [AuthController],
  providers: [AuthService, OtpRepository, OtpCleanupService],
})
export class AuthModule {}
