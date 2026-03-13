import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('sold_products')
export class SoldProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @Column({ name: 'product_id' })
    productId: string;

    @Column({ name: 'product_name' })
    productName: string;

    @Column({ name: 'quantity' })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ name: 'product_image_url', nullable: true })
    productImageUrl: string;

    @Column({ name: 'category_id', nullable: true })
    categoryId: string;

    @Column({ name: 'category_name', nullable: true })
    categoryName: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Order, (order) => order.soldProducts)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product, (product) => product.soldProducts)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
