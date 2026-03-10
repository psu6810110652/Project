import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, RelationId } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    rating: number;

    @Column('text')
    reviewContent: string;

    @Column({ default: '' })
    userName: string; // เก็บชื่อตอนที่รีวิว

    @Column({name: 'orderDate', type: 'timestamp', nullable: true})
    orderDate: Date; // วันที่สั่งซื้อ เพื่อยืนยันว่าผู้ใช้เคยซื้อสินค้านี้จริง

    @ManyToOne(() => Product, (product) => (product as any).reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @RelationId((review: Review) => review.product)
    productId: string;

    @ManyToOne(() => User, (user) => (user as any).reviews)
    @JoinColumn({ name: 'userId' })
    user: User;

    @RelationId((review: Review) => review.user)
    userId: string;
}
