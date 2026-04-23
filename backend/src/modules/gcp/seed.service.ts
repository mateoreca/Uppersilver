import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting product reorganization (Seed)...');

    // Limpiamos los productos existentes con SQL puro y CASCADE para evitar errores de FK
    await this.productRepo.query('DELETE FROM products CASCADE');

    const products = [
      // HOMBRE
      { name: 'Camiseta Básica Blanca', category: 'Camisetas', gender: 'hombre', price: 85000, stock: 50, imageUrl: '/img/products/mock-h1.jpg', sizes: ['S', 'M', 'L', 'XL'], description: 'El esencial que nunca falla en tu armario.' },
      { name: 'Polo Urban Stripe', category: 'Camisas', gender: 'hombre', price: 160000, stock: 15, imageUrl: '/img/products/mock-h2.jpg', sizes: ['M', 'L', 'XL'], description: 'Polo a rayas con un toque moderno y deportivo.' },
      { name: 'Pantalón Wide Black', category: 'Pantalones', gender: 'hombre', price: 210000, stock: 10, imageUrl: '/img/products/mock-h3.jpg', sizes: ['30', '32', '34', '36'], description: 'Pantalón de corte ancho para máxima comodidad.' },
      { name: 'Jogger Relax Gris', category: 'Pantalones', gender: 'hombre', price: 150000, stock: 20, imageUrl: '/img/products/mock-h4.jpg', sizes: ['S', 'M', 'L'], description: 'Comodidad total para tus días de descanso.' },
      { name: 'Chaqueta Puffer Dual', category: 'Chaquetas', gender: 'hombre', price: 320000, stock: 8, imageUrl: '/img/products/mock-h5.jpg', sizes: ['M', 'L', 'XL'], description: 'Chaqueta acolchada ideal para climas fríos.' },
      { name: 'Blazer Camel Luxe', category: 'Chaquetas', gender: 'hombre', price: 380000, stock: 5, imageUrl: '/img/products/mock-h6.jpg', sizes: ['M', 'L'], description: 'Saco elegante en tono camel para eventos formales.' },
      { name: 'Ropa Interior Premium', category: 'Ropa Interior', gender: 'hombre', price: 55000, stock: 40, imageUrl: '/img/products/mock-h7.jpg', sizes: ['S', 'M', 'L'], description: 'Boxer de algodón suave con ajuste perfecto.' },
      { name: 'Cinturón Cuero Negro', category: 'Accesorios', gender: 'hombre', price: 95000, stock: 25, imageUrl: '/img/products/mock-h8.jpg', sizes: ['32', '34', '36'], description: 'Complemento clásico en cuero genuino.' },

      // MUJER
      { name: 'Vestido Silk Rose', category: 'Vestidos', gender: 'mujer', price: 420000, stock: 6, imageUrl: '/img/products/mock-m1.jpg', sizes: ['S', 'M'], description: 'Vestido corto de seda en tono rosa pastel.' },
      { name: 'Blusa Floral Night', category: 'Blusas', gender: 'mujer', price: 145000, stock: 12, imageUrl: '/img/products/mock-m2.jpg', sizes: ['S', 'M', 'L'], description: 'Estampado floral elegante para ocasiones especiales.' },
      { name: 'Blusa Lino Beige', category: 'Blusas', gender: 'mujer', price: 155000, stock: 15, imageUrl: '/img/products/mock-m3.jpg', sizes: ['S', 'M', 'L'], description: 'Frescura y naturalidad en tejido de lino.' },
      { name: 'Top Fuchsia Party', category: 'Blusas', gender: 'mujer', price: 110000, stock: 20, imageUrl: '/img/products/mock-m4.jpg', sizes: ['XS', 'S', 'M'], description: 'Color vibrante para resaltar tu outfit.' },
      { name: 'Pantalón Palazzo Blanco', category: 'Pantalones', gender: 'mujer', price: 230000, stock: 9, imageUrl: '/img/products/mock-m5.jpg', sizes: ['S', 'M', 'L'], description: 'Elegancia y fluidez en cada paso.' },
      { name: 'Chaqueta Tweed Premium', category: 'Chaquetas', gender: 'mujer', price: 595000, stock: 6, imageUrl: '/img/products/mock-m6.jpg', sizes: ['S', 'M', 'L'], description: 'Tejido tweed artesanal con botones dorados. Inspiración couture.' },
      { name: 'Blazer Ivory', category: 'Chaquetas', gender: 'mujer', price: 350000, stock: 4, imageUrl: '/img/products/mock-m7.jpg', sizes: ['S', 'M'], description: 'Saco sofisticado en color marfil.' },
      { name: 'Collar Gold Leaf', category: 'Accesorios', gender: 'mujer', price: 75000, stock: 18, imageUrl: '/img/products/mock-m8.jpg', sizes: ['Única'], description: 'Accesorio delicado con baño de oro.' },
    ];

    await this.productRepo.save(products);
    this.logger.log('Reorganization (Seed) completed successfully.');
  }
}
