import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ActionResponseType {
  @Field()
  success: boolean;

  @Field()
  message: string;
}