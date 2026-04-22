import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IMessage } from 'src/common';

export type MessageDocument = HydratedDocument<Message>;

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Message implements IMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;
  @Prop({ type: String, required: true , minLength: 1, maxLength: 1000})
  message: string;
  @Prop({ type: Date, default:null })
  seenAt: Date;
  @Prop({ type: Date, default:null })
  deletedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export const MessageModel = MongooseModule.forFeature([
  {
    name: Message.name,
    schema: MessageSchema,
  },
]);
