import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('RealtimeGateway');
  private users: Map<string, string> = new Map();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.users.delete(client.id);
    this.server.emit('userLeft', client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    this.users.set(client.id, data.user);
    client.to(data.room).emit('userJoined', { id: client.id, name: data.user });
    this.logger.log(`User ${data.user} joined room ${data.room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(room);
    client.to(room).emit('userLeft', client.id);
  }

  @SubscribeMessage('estimateUpdate')
  handleEstimateUpdate(
    @MessageBody() data: { room: string; changes: any },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('estimateChanged', {
      userId: client.id,
      changes: data.changes,
    });
  }

  @SubscribeMessage('cursorPosition')
  handleCursorPosition(
    @MessageBody() data: { room: string; position: any },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('cursorMoved', {
      userId: client.id,
      position: data.position,
    });
  }

  @SubscribeMessage('notification')
  handleNotification(
    @MessageBody() data: { room: string; message: string; type: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.room).emit('notification', {
      message: data.message,
      type: data.type,
      timestamp: new Date().toISOString(),
    });
  }
}
