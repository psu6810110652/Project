import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    OrdersModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
