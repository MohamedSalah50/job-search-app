import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ActionResponseType, AdminDashboardType, BanUserArgs } from './dto';
// import { AdminService } from './admin.service';
import { CompanyService } from '../company/company.service';

@Resolver()
export class AdminResolver {
  constructor(private readonly companyService: CompanyService) {}
  @Query(() => String)
  hello(): string {
    return 'hello world';
  }

  @Query(() => AdminDashboardType, {
    name: 'adminDashboard',
    description: 'Get all users and companies for admin dashboard',
  })
  async getAdminDashboard() {
    return this.companyService.GetDashBoardData();
  }

  //banUser
  @Mutation(() => ActionResponseType, {
    name: 'banUser',
    description: 'Ban a specific user',
  })
  async banUser(@Args() args: BanUserArgs): Promise<ActionResponseType> {
    return this.companyService.BanUser(args.userId);
  }
}
