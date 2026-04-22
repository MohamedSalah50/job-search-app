import { Module } from '@nestjs/common';
import { MessagesService } from './chat.service';
import { MessagesController } from './chat.controller';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
