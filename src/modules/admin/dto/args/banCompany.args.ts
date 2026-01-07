import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';

@ArgsType()
export class BanCompanyArgs {
  @Field(() => ID)
  @IsNotEmpty()
  @IsMongoId()
  companyId: string;
}