import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Req, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { auth } from 'src/common/decorators/auth.decorator';
import { type IAuthRequest, RoleEnum } from 'src/common';
import { Types } from 'mongoose';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Post("/add-company")
  async addCompany(@Body(new ValidationPipe
    ({ whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true }))
  dto: CreateCompanyDto, @Req() req: IAuthRequest): Promise<{ message: string }> {
    await this.companyService.addCompany(dto, req);
    return { message: "company added successfully" }
  }

  @Get('')
  findCompanyWithName(@Query('companyName') companyName: string) {
    return this.companyService.findCompanyWithName(companyName);
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Patch(":companyId")
  async updateCompanyData(@Param("companyId") companyId: Types.ObjectId, @Body(new ValidationPipe
    ({ whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true }))
  dto: UpdateCompanyDto, @Req() req: IAuthRequest): Promise<{ message: string }> {
    return await this.companyService.updateCompanyData(companyId, dto, req);
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Delete(':companyId')
  softDeleteCompany(@Param('companyId') companyId: Types.ObjectId, @Req() req: IAuthRequest) {
    return this.companyService.softDeleteCompany(companyId, req);
  }

  @Get(':companyId')
  findCompany(@Param('companyId') companyId: Types.ObjectId) {
    return this.companyService.findCompany(companyId);
  }

  @Get(':companyId/jobs')
  getcompanyRelatedJobs(@Param('companyId') companyId: Types.ObjectId) {
    return this.companyService.findRelatedJobs(companyId);
  }




}
