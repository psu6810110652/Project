import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, RelationId, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { User } from '../../users/entities/user.entity';
import { Order } from "../../orders/entities/order.entity";

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'orderID' })
    order: Order;

    @RelationId((review: Review) => review.order)
    orderID: string;

    @Column({ name: 'orderDate', type: 'timestamp', nullable: true })
    orderDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

<<<<<<< resetpassword
    @Column({ nullable: true }) // 🟢 เพิ่ม nullable: true
=======
    @Column({ type: 'decimal', precision: 3, scale: 1, default: 0, transformer: {
        to: (value: number) => value,
        from: (value: string) => parseFloat(value)
    } })
>>>>>>> main
    rating: number;
    
    @Column('text')
    reviewContent: string;

    @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @RelationId((review: Review) => review.product)
    productId: string;

    @ManyToOne(() => User, (user) => (user as any).reviews)
    @JoinColumn({ name: 'userId' })
    user: User;

    @RelationId((review: Review) => review.user)
    userId: number;
}
