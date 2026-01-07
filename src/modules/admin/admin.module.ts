import { Module } from '@nestjs/common';
import {
  CompanyModel,
  CompanyRepository,
  UserModel,
  UserRepository,
} from 'src/db';
// import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { CompanyService } from '../company/company.service';

@Module({
  imports: [UserModel, CompanyModel],
  providers: [
    UserRepository,
    CompanyRepository,
    // AdminService,
    CompanyService,
    AdminResolver,
  ],
})
export class AdminModule {}
