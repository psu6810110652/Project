import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_number', unique: true })
    orderNumber: string;

    @Column({ name: 'customer_name' })
    customerName: string;

    @Column({ type: 'jsonb', default: [] })
    products: any[];

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

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

    @Column({ name: 'tracking_number', nullable: true })
    trackingNumber: string;

    @Column({ name: 'courier_slug', nullable: true })
    courierSlug: string;

    @Column({ name: 'customer_id', nullable: true })
    customerId: string;

    @Column({ name: 'payment_slip_url', type: 'text', nullable: true })
    paymentSlip: string;

    @Column({ name: 'cancel_reason', type: 'varchar', length: 255, nullable: true })
    cancelReason: string;
}