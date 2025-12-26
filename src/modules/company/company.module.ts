import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyModel, CompanyRepository, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/db';
import { TokenService } from 'src/utils/security/token.security';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CompanyModel, UserModel, TokenModel],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository, UserRepository, TokenRepository , TokenService , JwtService],
})
export class CompanyModule { }
