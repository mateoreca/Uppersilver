import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { GcpModule } from './modules/gcp/gcp.module';
import { AiModule } from './modules/ai/ai.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const isCloudRun = !!process.env.INSTANCE_CONNECTION_NAME;
        let stream;
        
        if (isCloudRun && process.env.INSTANCE_CONNECTION_NAME) {
          const connector = new Connector();
          const clientOpts = await connector.getOptions({
            instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
            ipType: IpAddressTypes.PUBLIC,
          });
          stream = clientOpts.stream;
        }

        return {
          type: 'postgres',
          host: isCloudRun ? undefined : process.env.DB_HOST,
          port: isCloudRun ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          autoLoadEntities: true,
          synchronize: false,
          extra: isCloudRun ? { stream } : undefined,
        };
      },
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    GcpModule,
    AiModule,
    PaymentsModule,
    ShippingModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

