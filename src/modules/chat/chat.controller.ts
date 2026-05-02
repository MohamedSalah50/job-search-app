import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum, User } from 'src/common';
import { Types } from 'mongoose';
import { type UserDocument } from 'src/db';

@Controller('chat')
export class MessagesController {
  constructor(private readonly chatService: ChatService) {}

  // GET /chat/:userId?page=1&limit=20
  @auth([RoleEnum.user, RoleEnum.companyOwner, RoleEnum.hr])
  @Get(':userId')
  async getChatHistory(
    @Param('userId') targetUserId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @User() user: UserDocument,
  ) {
    const data = await this.chatService.getChatHistory({
      requesterId: user._id,
      targetUserId,
      page: Number(page),
      limit: Number(limit),
    });

    return { message: 'chat history fetched successfully', data };
  }
}
