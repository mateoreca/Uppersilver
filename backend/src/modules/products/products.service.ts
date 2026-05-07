import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { RealtimeGateway } from '../notifications/realtime.gateway';
import * as admin from 'firebase-admin';

@Injectable()
export class ProductsService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: 'project-a50f6246-1ee7-413c-b77',
      });
      this.logger.log('Firebase Admin initialized successfully in Backend');
    }
    this.firestore = admin.firestore();
  }

  onModuleInit() {
    //
  }

  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    let product = await this.productRepository.findOne({ where: { id } });
    
    if (!product && (id.startsWith('mock-') || id.length < 10)) {
      this.logger.log(`Attempting flexible lookup for ID: ${id}`);
      product = await this.productRepository.createQueryBuilder('product')
        .where('product.imageUrl LIKE :id', { id: `%${id}%` })
        .getOne();
      
      if (product) {
        this.logger.log(`Found product '${product.name}' via image lookup for mock ID '${id}'`);
      }
    }

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async reduceStock(id: string, quantity: number): Promise<Product> {
    this.logger.log(`REQUEST: Reduce stock for ${id} by ${quantity}`);
    const product = await this.findOne(id);
    
    if (product.stock < quantity) {
      this.logger.error(`Insufficient stock for ${product.name}: has ${product.stock}, needs ${quantity}`);
      throw new BadRequestException(`Insufficient stock for product ${product.name}`);
    }

    product.stock -= quantity;
    const updatedProduct = await this.productRepository.save(product);
    this.logger.log(`SUCCESS: Postgres stock for '${product.name}' is now ${updatedProduct.stock}`);
    
    // Emitir evento en tiempo real vía WebSockets
    this.realtimeGateway.notifyStockUpdate(product.id, updatedProduct.stock);
    
    return updatedProduct;
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = newStock;
    const updatedProduct = await this.productRepository.save(product);
    
    // Emitir evento en tiempo real vía WebSockets
    this.realtimeGateway.notifyStockUpdate(product.id, updatedProduct.stock);
    
    return updatedProduct;
  }
}
