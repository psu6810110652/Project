import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductIdController } from './product-id.controller';
import { Product } from './entities/product.entity';
import { ProductDetail } from './entities/product-detail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductDetail]),
    OrdersModule,
    UsersModule,
  ],
  controllers: [ProductController, ProductIdController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
