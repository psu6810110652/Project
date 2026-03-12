import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity('products')
export class Product {

    @PrimaryColumn() // id is now the product code (string)
    id: string;

    @Column() // varchar NN (Not Null)
    name: string;

    @Column({ name: 'image_url', nullable: true, type: 'text' })
    imageUrl: string;

    @Column({ name: 'thumbnail_url', nullable: true, type: 'text' })
    thumbnailUrl: string;

    @Column({ nullable: true }) // Product type/subcategory
    type: string;

    @Column({ type: 'text', nullable: true }) // description text (nullable)
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 }) // decimal(10,2) NN
    price: number;

    @Column({ name: 'stock_quantity' }) // int NN
    stockQuantity: number;

    @Column({ name: 'is_promotion', default: false })
    isPromotion: boolean;

    @Column({ name: 'promotion_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    promotionPrice: number;

    @Column({ name: 'is_featured', nullable: true }) // boolean
    isFeatured: boolean;

    @Column({ name: 'sold_count', default: 0 }) // int, default 0
    soldCount: number;

    @Column({ name: 'favorite_count', default: 0 }) // int, default 0
    favoriteCount: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 }) // decimal(3,2), default 0
    rating: number;

    @Column({ name: 'review_count', default: 0 }) // int, default 0
    reviewCount: number;

    @CreateDateColumn({ name: 'created_at', nullable: true }) // timestamp
    createdAt: Date;

    // --- ความสัมพันธ์ (Relation) กับตาราง Category ---
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;
}