import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SeedService } from '../gcp/seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    NotificationsModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService, SeedService],
  exports: [ProductsService],
})
export class ProductsModule {}
