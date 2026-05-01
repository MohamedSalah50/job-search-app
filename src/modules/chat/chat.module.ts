import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessagesController } from './chat.controller';
import { MessageModel, UserModel, UserRepository } from 'src/db';
import { MessageRepository } from 'src/db/repositories/message.repository';

@Module({
  imports: [MessageModel, UserModel],
  controllers: [MessagesController],
  providers: [ChatService, MessageRepository, UserRepository],
  exports: [ChatService, MessageRepository, UserRepository],
})
export class ChatModule {}
