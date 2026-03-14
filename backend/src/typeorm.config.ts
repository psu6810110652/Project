import { DataSource } from 'typeorm';
import { Product } from './product/entities/product.entity';
import { Category } from './category/entities/category.entity';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { SoldProduct } from './orders/entities/sold-product.entity';
import { Address } from './addresses/entities/address.entity';
import { Cart } from './carts/entities/cart.entity';
import { Review } from './review/entities/review.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'teerayut_dev',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
