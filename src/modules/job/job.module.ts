import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ApplicationModel, ApplicationRepository, CompanyModel, CompanyRepository, JobModel, JobRepository, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/db';
import { TokenService } from 'src/utils/security/token.security';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [JobModel, UserModel, CompanyModel, TokenModel, ApplicationModel],
  controllers: [JobController],
  providers: [JobService, UserRepository, CompanyRepository, JobRepository, TokenService, TokenRepository, JwtService, ApplicationRepository],
})
export class JobModule { }
