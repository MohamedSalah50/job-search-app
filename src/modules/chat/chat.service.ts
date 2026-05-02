import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageRepository } from 'src/db/repositories/message.repository';
import { ConnectedSockets, UserDocument, UserRepository } from 'src/db';
import { Types } from 'mongoose';
import { Server } from 'socket.io';
import { RoleEnum } from 'src/common';

@Injectable()
export class ChatService {
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

    const { result, doc_count, total_pages, has_next_page, has_prev_page } =
      await this.messagesRepository.paginate({
        filter: {
          deletedAt: null,
          $or: [
            { senderId: requesterId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: requesterId },
          ],
        },
        select: 'senderId receiverId message seenAt createdAt',
        page,
        size: limit,
        options: {
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
      messages: (result as any[]).reverse(), // oldest first
      doc_count,
      total_pages,
      current_page: page,
      has_next_page,
      has_prev_page,
    };
  }

  async sendMessages({
    server,
    sender,
    recieverId,
    message,
  }: {
    server: Server;
    sender: UserDocument;
    recieverId: Types.ObjectId;
    message: string;
  }) {
    const isHrOrOwner =
      sender.role === RoleEnum.hr || sender.role === RoleEnum.companyOwner;

    const reciever = await this.userRepository.findOne({
      filter: { _id: recieverId, deletedAt: { $exists: false } },
    });

    if (!reciever) {
      throw new NotFoundException('reciever not found');
    }

    const exsistingConversation = await this.messagesRepository.findOne({
      filter: {
        $or: [
          { senderId: sender._id, receiverId: recieverId },
          { senderId: recieverId, receiverId: sender._id },
        ],
      },
    });

    if (!exsistingConversation && !isHrOrOwner) {
      throw new ForbiddenException('only hr or owner can send messages');
    }

    const [savedMessage] = await this.messagesRepository.create({
      data: [
        {
          senderId: sender._id,
          receiverId: recieverId,
          message,
        },
      ],
    });

    await savedMessage.populate([
      { path: 'senderId', select: 'firstName lastName profilePic' },
      { path: 'receiverId', select: 'firstName lastName profilePic' },
    ]);

    // Emit to receiver's sockets (all open tabs/devices)
    const recieverSockets = ConnectedSockets.get(recieverId.toString()) || [];

    recieverSockets.forEach((socketId) => {
      server.to(socketId).emit('message', savedMessage);
    });

    const senderSockets = ConnectedSockets.get(sender._id.toString()) || [];

    senderSockets.forEach((socketId) => {
      server.to(socketId).emit('recieveMessage', savedMessage);
    });

    return savedMessage;
  }

  async markAsSeen({
    viewerId,
    senderId,
  }: {
    viewerId: Types.ObjectId;
    senderId: string;
  }) {
    await this.messagesRepository.updateOne({
      filter: {
        senderId: new Types.ObjectId(senderId),
        receiverId: viewerId,
        seenAt: null,
      },
      update: { $set: { seenAt: new Date() } },
    });
  }
}
