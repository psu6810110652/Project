import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_number', unique: true })
    orderNumber: string;
    
    @Column({ name: 'payment_slip', type: 'text', nullable: true })
    paymentSlip: string;

    @Column({ name: 'customer_name' })
    customerName: string;

    @Column({ type: 'jsonb', default: [] })
    products: any[];

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @CreateDateColumn({ name: 'order_date' })
    orderDate: Date;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'pending_confirm',
    })
    status: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
