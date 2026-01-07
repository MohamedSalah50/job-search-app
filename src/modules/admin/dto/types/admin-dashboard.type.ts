import { ObjectType, Field } from '@nestjs/graphql';
import { UserResponseType } from './user-response.type';
import { CompanyResponseType } from './company-response.type';

@ObjectType()
export class AdminDashboardType {
  @Field(() => [UserResponseType])
  users: UserResponseType[];

  @Field(() => [CompanyResponseType])
  companies: CompanyResponseType[];

  @Field()
  totalUsers: number;

  @Field()
  totalCompanies: number;
}
