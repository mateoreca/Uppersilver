import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IsString, IsNotEmpty } from 'class-validator';

class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() orderData: any) {
    return this.ordersService.create(orderData);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
