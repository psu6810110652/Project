import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('wholesale_prices')
export class WholesalePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.wholesalePrices, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'int' })
  minQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  wholesalePrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
