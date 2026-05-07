import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productsService: ProductsService,
  ) {}

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(data);
    return this.orderRepository.save(order);
  }

  async findByReference(reference: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { paymentReference: reference } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async markAsPaid(reference: string): Promise<Order> {
    const order = await this.findByReference(reference);
    
    if (order.status === 'paid') return order;

    order.status = 'paid';
    await this.orderRepository.save(order);

    // RESTAR STOCK
    await this.productsService.reduceStock(order.productId, order.quantity);

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['product']
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id }, relations: ['product'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }
}
