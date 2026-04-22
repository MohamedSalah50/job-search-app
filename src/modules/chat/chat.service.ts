import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageRepository } from 'src/db/repositories/message.repository';
import { UserRepository } from 'src/db';
import { Types } from 'mongoose';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getChatHistory({
    requesterId,
    targetUserId,
    page = 1,
    limit = 20,
  }: {
    requesterId: Types.ObjectId;
    targetUserId: Types.ObjectId;
    page?: number;
    limit?: number;
  }) {
    const targetUser = await this.userRepository.findOne({
      filter: { _id: targetUserId, deletedAt: { $exists: false } },
    });

    if (!targetUser) {
      throw new NotFoundException('target user not found');
    }

    const skip = (page - 1) * limit;

    const messages = await this.messagesRepository.find({
      filter: {
        deletedAt: null,
        $or: [
          { senderId: requesterId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: requesterId },
        ],
      },
      select: 'senderId receiverId message seenAt createdAt',
      options: {
        skip,
        limit,
        sort: {
          createdAt: -1,
        },
        populate: [
          { path: 'senderId', select: 'firstName lastName profilePic' },
          { path: 'receiverId', select: 'firstName lastName profilePic' },
        ],
      },
    });

    return {
      messages: messages.reverse(),
      page,
      limit,
    };
  }
}
