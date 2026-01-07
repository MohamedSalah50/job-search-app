import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyModel, CompanyRepository } from 'src/db';

@Module({
  imports: [CompanyModel],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository],
  exports: [CompanyRepository],
})
export class CompanyModule {}
