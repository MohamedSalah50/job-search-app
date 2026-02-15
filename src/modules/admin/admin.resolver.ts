import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  ActionResponseType,
  AdminDashboardType,
  ApproveCompanyArgs,
  BanCompanyArgs,
  BanUserArgs,
} from './dto';
import { CompanyService } from '../company/company.service';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum } from 'src/common';

@Resolver()
export class AdminResolver {
  constructor(private readonly companyService: CompanyService) {}
  @Query(() => String)
  hello(): string {
    return 'hello world';
  }

  @auth([RoleEnum.admin])
  @Query(() => AdminDashboardType, {
    name: 'adminDashboard',
    description: 'Get all users and companies for admin dashboard',
  })
  async getAdminDashboard() {
    return this.companyService.GetDashBoardData();
  }

  @auth([RoleEnum.admin])
  @Mutation(() => ActionResponseType, {
    name: 'banUser',
    description: 'Ban a specific user',
  })
  async banUser(@Args() args: BanUserArgs): Promise<ActionResponseType> {
    return this.companyService.BanUser(args.userId);
  }

  @auth([RoleEnum.admin])
  @Mutation(() => ActionResponseType, {
    name: 'unbanUser',
    description: 'Unban a specific user',
  })
  async unBanUser(@Args() args: BanUserArgs): Promise<ActionResponseType> {
    return this.companyService.UnbanUser(args.userId);
  }

  @auth([RoleEnum.admin])
  @Mutation(() => ActionResponseType, {
    name: 'banCompany',
    description: 'Ban a specific company',
  })
  async banCompany(@Args() args: BanCompanyArgs): Promise<ActionResponseType> {
    return this.companyService.banCompany(args.companyId);
  }

  @auth([RoleEnum.admin])
  @Mutation(() => ActionResponseType, {
    name: 'unbanCompany',
    description: 'Unban a specific company',
  })
  async unBanCompany(
    @Args() args: BanCompanyArgs,
  ): Promise<ActionResponseType> {
    return this.companyService.unbanCompany(args.companyId);
  }

  @auth([RoleEnum.admin])
  @Mutation(() => ActionResponseType, {
    name: 'approveCompany',
    description: 'Approve a specific company',
  })
  async approveCompany(
    @Args() args: ApproveCompanyArgs,
  ): Promise<ActionResponseType> {
    return this.companyService.ApproveCompany(args.companyId);
  }
}
