import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { type CompanyDocument, CompanyRepository, UserRepository } from 'src/db';
import { IAuthRequest, RoleEnum } from 'src/common';
import { isValidObjectId, Types } from 'mongoose';

@Injectable()
export class CompanyService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository
  ) { }
  async addCompany(dto: CreateCompanyDto, req: IAuthRequest): Promise<{ message: string }> {

    const { address, companyEmail, companyName, description, industry, numberOfEmployees, Hrs } = dto;

    const company = await this.companyRepository.findOne({
      filter: { $or: [{ companyEmail }, { companyName }] }
    })

    if (company) {
      const field = company.companyEmail === companyEmail ? 'companyEmail' : 'companyName';
      throw new ConflictException(`company with this ${field} already exist`)
    }

    const [newCompany] = await this.companyRepository.create({
      data: [{
        address,
        companyEmail,
        companyName,
        description,
        industry,
        numberOfEmployees,
        createdBy: req.user._id,
        approvedByAdmin: req.user.role === RoleEnum.admin ? true : false,
        Hrs
      }]
    }) || [];

    if (!newCompany) {
      throw new BadRequestException('fail to add company')
    }

    return { message: "company added successfully" }
  }

  async updateCompanyData(companyId: Types.ObjectId, dto: UpdateCompanyDto, req: IAuthRequest): Promise<{ message: string }> {

    const { companyEmail, companyName, address, description, industry, numberOfEmployees } = dto;

    if (!isValidObjectId(companyId)) throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: { _id: companyId, deletedAt: { $exists: false }, bannedAt: { $exists: false } }
    })

    if (!company) {
      throw new BadRequestException('company not found')
    }

    if (!company.createdBy.equals(req.user._id)) {
      throw new BadRequestException('you are not authorized to update this company , only the owner can ')
    }

    let updatedData: any = {};

    if (companyName) {
      const existCompany = await this.companyRepository.findOne({
        filter: { companyName: companyName, _id: { $ne: company._id } },
      })

      if (existCompany) {
        throw new ConflictException('company name already exist')
      }
      updatedData.companyName = companyName;
    }

    if (companyEmail) {
      const existCompany = await this.companyRepository.findOne({
        filter: { companyEmail: companyEmail, _id: { $ne: company._id } },
      })

      if (existCompany) {
        throw new ConflictException('company email already exist')
      }
      updatedData.companyEmail = companyEmail;
    }


    if (address) {
      updatedData.address = address;
    }

    if (description) {
      updatedData.description = description;
    }

    if (industry) {
      updatedData.industry = industry;
    }

    if (numberOfEmployees) {
      updatedData.numberOfEmployees = numberOfEmployees;
    }

    updatedData.updatedBy = req.user._id;

    const updatedCompany = await this.companyRepository.updateOne({
      filter: { _id: company._id },
      update: updatedData
    })

    if (!updatedCompany.matchedCount) {
      throw new BadRequestException('fail to update company')
    }

    if (!updatedCompany.modifiedCount) {
      throw new BadRequestException('no change found to update')
    }

    return { message: "company updated successfully" }
  }

  async softDeleteCompany(companyId: Types.ObjectId, req: IAuthRequest): Promise<{ message: string }> {

    if (!isValidObjectId(companyId)) throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: { _id: companyId, deletedAt: { $exists: false } }
    })

    if (!company) {
      throw new BadRequestException('company not found')
    }

    if (!company.createdBy.equals(req.user._id) || req.user.role !== RoleEnum.admin) {
      throw new BadRequestException('you are not authorized to delete this company , only the owner can ')
    }

    await this.companyRepository.updateOne({
      filter: {
        _id: company._id,
      },
      update: { deletedAt: new Date() }
    })

    return { message: "company deleted successfully" }
  }

  async findCompany(companyId: Types.ObjectId) {

    if (!isValidObjectId(companyId)) throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: { _id: companyId }
    })

    if (!company) {
      throw new NotFoundException('company not found')
    }

    if (company.deletedAt || company.bannedAt) {
      throw new BadRequestException('company is deleted or banned')
    }

    return company
  }

  async findCompanyWithName(companyName: string) {

    const company = await this.companyRepository.findOne({
      filter: { companyName, deletedAt: { $exists: false }, bannedAt: { $exists: false } }
    })

    if (!company) {
      throw new BadRequestException('company not found')
    }

    return company
  }

  async findRelatedJobs(companyId: Types.ObjectId) {

    if (!isValidObjectId(companyId)) throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: { _id: companyId, deletedAt: { $exists: false }, bannedAt: { $exists: false } },
      options: { populate: [{ path: 'jobs', select: "jobTitle jobDescription seniorityLevel jobLocation workingTime technicalSkills softSkills" }] }
    })

    if (!company) {
      throw new NotFoundException('company not found')
    }

    return company
  }

}
