import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRepository, UserRepository } from 'src/db';
import { IAuthRequest, RoleEnum } from 'src/common';
import { isValidObjectId, Types } from 'mongoose';
import { ActionResponseType } from '../admin/dto';
import { PaginationDto, SortOrder } from '../job/dto/pagination-job.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}
  async addCompany(
    dto: CreateCompanyDto,
    req: IAuthRequest,
  ): Promise<{ message: string }> {
    const {
      address,
      companyEmail,
      companyName,
      description,
      industry,
      numberOfEmployees,
      Hrs,
    } = dto;

    const company = await this.companyRepository.findOne({
      filter: { $or: [{ companyEmail }, { companyName }] },
    });

    if (company) {
      const field =
        company.companyEmail === companyEmail ? 'companyEmail' : 'companyName';
      throw new ConflictException(`company with this ${field} already exist`);
    }

    const [newCompany] =
      (await this.companyRepository.create({
        data: [
          {
            address,
            companyEmail,
            companyName,
            description,
            industry,
            numberOfEmployees,
            createdBy: req.user._id,
            approvedByAdmin: req.user.role === RoleEnum.admin ? true : false,
            Hrs,
          },
        ],
      })) || [];

    if (!newCompany) {
      throw new BadRequestException('fail to add company');
    }

    return { message: 'company added successfully' };
  }

  async updateCompanyData(
    companyId: Types.ObjectId,
    dto: UpdateCompanyDto,
    req: IAuthRequest,
  ): Promise<{ message: string }> {
    const {
      companyEmail,
      companyName,
      address,
      description,
      industry,
      numberOfEmployees,
    } = dto;

    if (!isValidObjectId(companyId))
      throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: {
        _id: companyId,
        deletedAt: { $exists: false },
        bannedAt: { $exists: false },
      },
    });

    if (!company) {
      throw new BadRequestException('company not found');
    }

    if (!company.createdBy.equals(req.user._id)) {
      throw new BadRequestException(
        'you are not authorized to update this company , only the owner can ',
      );
    }

    let updatedData: any = {};

    if (companyName) {
      const existCompany = await this.companyRepository.findOne({
        filter: { companyName: companyName, _id: { $ne: company._id } },
      });

      if (existCompany) {
        throw new ConflictException('company name already exist');
      }
      updatedData.companyName = companyName;
    }

    if (companyEmail) {
      const existCompany = await this.companyRepository.findOne({
        filter: { companyEmail: companyEmail, _id: { $ne: company._id } },
      });

      if (existCompany) {
        throw new ConflictException('company email already exist');
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
      update: updatedData,
    });

    if (!updatedCompany.matchedCount) {
      throw new BadRequestException('fail to update company');
    }

    if (!updatedCompany.modifiedCount) {
      throw new BadRequestException('no change found to update');
    }

    return { message: 'company updated successfully' };
  }

  async softDeleteCompany(
    companyId: Types.ObjectId,
    req: IAuthRequest,
  ): Promise<{ message: string }> {
    if (!isValidObjectId(companyId))
      throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: { _id: companyId, deletedAt: { $exists: false } },
    });

    if (!company) {
      throw new BadRequestException('company not found');
    }

    if (
      !company.createdBy.equals(req.user._id) ||
      req.user.role !== RoleEnum.admin
    ) {
      throw new BadRequestException(
        'you are not authorized to delete this company , only the owner can ',
      );
    }

    await this.companyRepository.updateOne({
      filter: {
        _id: company._id,
      },
      update: { deletedAt: new Date() },
    });

    return { message: 'company deleted successfully' };
  }

  async findCompany(companyId: Types.ObjectId) {
    if (!isValidObjectId(companyId))
      throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: { _id: companyId },
    });

    if (!company) {
      throw new NotFoundException('company not found');
    }

    if (company.deletedAt || company.bannedAt) {
      throw new BadRequestException('company is deleted or banned');
    }

    return company;
  }

  async findCompanyWithName(companyName: string) {
    const company = await this.companyRepository.findOne({
      filter: {
        companyName,
        deletedAt: { $exists: false },
        bannedAt: { $exists: false },
      },
    });

    if (!company) {
      throw new BadRequestException('company not found');
    }

    return company;
  }

  async findRelatedJobs(companyId: Types.ObjectId) {
    if (!isValidObjectId(companyId))
      throw new BadRequestException('invalid company id');

    const company = await this.companyRepository.findOne({
      filter: {
        _id: companyId,
        deletedAt: { $exists: false },
        bannedAt: { $exists: false },
      },
      options: {
        populate: [
          {
            path: 'jobs',
            select:
              'jobTitle jobDescription seniorityLevel jobLocation workingTime technicalSkills softSkills',
          },
        ],
      },
    });

    if (!company) {
      throw new NotFoundException('company not found');
    }

    return company;
  }

  //====================================admin section & will be removed later to the AdminService.ts file
  async GetDashBoardData(dto?: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = dto || {};

    const sortObj: any = {};
    sortObj[sort] = sortOrder === SortOrder.ASC ? 1 : -1;

    const { result: users, doc_count: totalUsers } =
      await this.userRepository.paginate({
        filter: {},
        select: { password: 0, otp: 0 },
        page,
        size: limit,
        options: {
          sort: sortObj,
        },
      });

    console.log({ users });

    const { result: companies, doc_count: totalCompanies } =
      await this.companyRepository.paginate({
        filter: {},
        page,
        size: limit,
        options: {
          sort: sortObj,
        },
      });

    console.log({ companies });

    return {
      users,
      companies,
      totalUsers,
      totalCompanies,
    };
  }

  //ban specificUser
  async BanUser(UserId: string): Promise<ActionResponseType> {
    if (!isValidObjectId(UserId)) {
      throw new BadRequestException('invalid user id');
    }

    const user = await this.userRepository.findOne({
      filter: { _id: new Types.ObjectId(UserId), bannedAt: { $exists: false } },
      select: { password: 0, otp: 0 },
    });

    if (!user) {
      throw new NotFoundException('user not found or user is already banned');
    }

    await this.userRepository.updateOne({
      filter: { _id: UserId },
      update: { bannedAt: new Date() },
    });

    return { success: true, message: 'user banned successfully' };
  }

  // //unban specificUser
  async UnbanUser(UserId: string): Promise<ActionResponseType> {
    if (!isValidObjectId(UserId)) {
      throw new BadRequestException('invalid user id');
    }

    const user = await this.userRepository.findOne({
      filter: { _id: new Types.ObjectId(UserId), bannedAt: { $exists: true } },
    });

    if (!user) {
      throw new NotFoundException('user not found or user is not banned');
    }

    await this.userRepository.updateOne({
      filter: { _id: UserId },
      update: { $unset: { bannedAt: '' } },
    });

    return { success: true, message: 'user unbanned successfully' };
  }

  // Ban company
  async banCompany(companyId: string): Promise<ActionResponseType> {
    const company = await this.companyRepository.findOne({
      filter: {
        _id: new Types.ObjectId(companyId),
        bannedAt: { $exists: false },
      },
    });

    if (!company) {
      throw new NotFoundException(
        'Company not found or company is already banned',
      );
    }

    await this.companyRepository.updateOne({
      filter: { _id: new Types.ObjectId(companyId) },
      update: { bannedAt: new Date() },
    });

    return {
      success: true,
      message: 'Company banned successfully',
    };
  }

  // Unban company
  async unbanCompany(companyId: string): Promise<ActionResponseType> {
    const company = await this.companyRepository.findOne({
      filter: {
        _id: new Types.ObjectId(companyId),
        bannedAt: { $exists: true },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found or company is not banned');
    }

    await this.companyRepository.updateOne({
      filter: { _id: new Types.ObjectId(companyId) },
      update: { $unset: { bannedAt: '' } },
    });

    return {
      success: true,
      message: 'Company unbanned successfully',
    };
  }

  // //approve company

  async ApproveCompany(companyId: string): Promise<ActionResponseType> {
    const company = await this.companyRepository.findOne({
      filter: {
        _id: new Types.ObjectId(companyId),
        bannedAt: { $exists: false },
        deletedAt: { $exists: false },
      },
    });

    if (!company) {
      throw new NotFoundException(
        'Company not found or company is not banned or deleted',
      );
    }

    if (company.approvedByAdmin) {
      throw new BadRequestException('company is already approved');
    }

    await this.companyRepository.updateOne({
      filter: { _id: new Types.ObjectId(companyId) },
      update: { approvedByAdmin: true },
    });

    return {
      success: true,
      message: 'Company approved successfully',
    };
  }
}
