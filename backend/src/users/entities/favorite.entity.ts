import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('user_favorites')
@Unique(['userId', 'productId']) // ป้องกันการเพิ่มรายการโปรดซ้ำ
export class Favorite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'product_id' })
    productId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.favorites)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, (product) => product.favorites)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
