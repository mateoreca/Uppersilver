import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, restringir al dominio del frontend
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RealtimeGateway');

  @SubscribeMessage('subscribe_to_product')
  handleProductSubscription(client: Socket, productId: string): void {
    client.join(`product_${productId}`);
    this.logger.log(`Client ${client.id} subscribed to product ${productId}`);
  }

  notifyStockUpdate(productId: string, newStock: number) {
    this.server.emit('stock_updated', { productId, newStock });
    // También enviamos al canal específico por si se usa
    this.server.to(`product_${productId}`).emit('product_stock_updated', {
      productId,
      newStock,
    });
  }

  afterInit(server: Server) {
    this.logger.log('Websocket Gateway Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
