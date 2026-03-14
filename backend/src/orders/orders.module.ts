import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { SoldProduct } from './entities/sold-product.entity';
import { Product } from '../product/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, SoldProduct, Product])],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
