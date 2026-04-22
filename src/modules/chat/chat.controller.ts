import { Controller } from '@nestjs/common';
import { MessagesService } from './chat.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
}
