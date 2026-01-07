import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';

@ArgsType()
export class BanUserArgs {
  @Field(() => ID)
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
