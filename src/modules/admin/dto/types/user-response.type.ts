import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { IUser, RoleEnum } from 'src/common';

@ObjectType()
export class UserResponseType implements Partial<IUser> {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  role: RoleEnum;

  @Field()
  isConfirmed: boolean;

  @Field({ nullable: true })
  bannedAt?: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  // @Field()
  // createdAt: Date;
}
