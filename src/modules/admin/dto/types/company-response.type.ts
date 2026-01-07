import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { ICompany } from 'src/common';

@ObjectType()
export class CompanyResponseType implements Partial<ICompany> {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  companyName: string;

  @Field()
  companyEmail: string;

  @Field()
  industry: string;

  @Field()
  approvedByAdmin: boolean;

  @Field({ nullable: true })
  bannedAt?: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  // @Field()
  // createdAt: Date;
}