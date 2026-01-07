import { BadRequestException, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import { ActionResponseType, AdminDashboardType } from './dto';
import { UserRepository } from '../../db/repositories/user.repository';
import { CompanyRepository } from '../../db/repositories/company.repository';

export class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository,
  ) {
    // console.log('AdminService Constructor');
    // console.log('userRepository:', this.userRepository);
    // console.log('companyRepository:', this.companyRepository);
  }

  async GetDashBoardData() {
    console.log('Inside GetDashBoardData');
    console.log('userRepository:', this.userRepository);
    console.log('companyRepository:', this.companyRepository);
    const users = await this.userRepository.find({
      filter: {},
      select: { password: 0, otp: 0 },
    });

    // console.log({ users });

    const companies = await this.companyRepository.find({ filter: {} });
    // console.log({ companies });

    return {
      users,
      companies,
      totalUsers: users.length,
      totalCompanies: companies.length,
    };

    // return "done admin";
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
}
