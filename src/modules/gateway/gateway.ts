import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Socket, Server } from 'socket.io';
import { ISocketAuth, RoleEnum, tokenEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { ConnectedSockets, UserRepository, type UserDocument } from 'src/db';
import { getSocketAuth } from 'src/utils/security/socket';
import { TokenService } from 'src/utils/security/token.security';
import { ChatService } from '../chat/chat.service';
import { User } from 'src/common/decorators/user.decorator';
import { MessageRepository } from 'src/db/repositories/message.repository';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealTimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server; //io
  constructor(
    private readonly tokenService: TokenService,
    private readonly chatService: ChatService,
    private readonly userRepository: UserRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  afterInit(server: Server) {
    console.log('realtime gateway started 🚀🚀');
  }

  async handleConnection(client: ISocketAuth) {
    try {
      // console.log(client.handshake);

      const authorization = getSocketAuth(client);

      const { user, decoded } = await this.tokenService.decodeToken({
        authorization,
        tokenType: tokenEnum.access,
      });

      const userTapes = ConnectedSockets.get(user._id.toString()) || [];

      userTapes.push(client.id);
      ConnectedSockets.set(user._id.toString(), userTapes);
      client.credentials = { user, decoded };
    } catch (error) {
      client.emit('exception', error || 'something went wrong');
    }
  }

  handleDisconnect(client: ISocketAuth) {
    console.log('logout :', client.id);
  }

  // @auth([RoleEnum.admin, RoleEnum.user])
  // @SubscribeMessage('sayHi')
  // sayHi(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: Socket,
  //   @User() user: UserDocument,
  // ): string {
  //   console.log(data);
  //   console.log({ user });
  //   this.server.emit('sayHi', 'nest to fe');
  //   return 'data recieved';
  // }

  // ============================================================
  // EVENT: sendMessage
  // Payload: { receiverId: string, message: string }
  // ============================================================
  @auth([RoleEnum.admin, RoleEnum.user, RoleEnum.companyOwner, RoleEnum.hr])
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: { recieverId: Types.ObjectId; message: string },
    @ConnectedSocket() client: Socket,
    @User() sender: UserDocument,
  ) {
    try {
      const { recieverId, message } = data;
      const saved = await this.chatService.sendMessages({
        server: this.server,
        sender,
        recieverId,
        message,
      });

      return { status: 'success', data: saved };
    } catch (error) {
      client.emit('exception', error || 'something went wrong');
    }
  }

  // ============================================================
  // EVENT: markAsSeen
  // Payload: { senderId: string }  ← the person whose messages we're marking as seen
  // ============================================================

  @auth([RoleEnum.admin, RoleEnum.user, RoleEnum.companyOwner, RoleEnum.hr])
  @SubscribeMessage('markAsSeen')
  async markAsSeen(
    @MessageBody() data: { senderId: string },
    @ConnectedSocket() client: Socket,
    @User() viewer: UserDocument,
  ) {
    try {
      const { senderId } = data;
      console.log('markAsSeen gateway hit', { data, viewerId: viewer._id });
      await this.chatService.markAsSeen({
        viewerId: viewer._id,
        senderId,
      });

      const senderSockets = ConnectedSockets.get(data.senderId) || [];
      senderSockets.forEach((socketId) => {
        this.server.to(socketId).emit('messagesSeen', {
          by: viewer._id,
          seenAt: new Date(),
        });
      });

      return { status: 'success' };
    } catch (error) {
      client.emit('exception', error || 'Failed to mark as seen');
    }
  }
}
