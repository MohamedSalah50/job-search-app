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
import { Socket, Server } from 'socket.io';
import { ISocketAuth, tokenEnum } from 'src/common';
import { ConnectedSockets } from 'src/db';
import { getSocketAuth } from 'src/utils/security/socket';
import { TokenService } from 'src/utils/security/token.security';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealTimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server; //io
  constructor(private readonly tokenService: TokenService) {}

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

  @SubscribeMessage('sayHi')
  sayHi(@MessageBody() data: any, @ConnectedSocket() client: Socket): string {
    console.log(data);
    this.server.emit('sayHi', 'nest to fe');
    return 'data recieved';
  }
}
