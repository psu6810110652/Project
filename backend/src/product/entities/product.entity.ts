import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    OneToMany,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { SoldProduct } from '../../orders/entities/sold-product.entity';
import { Favorite } from '../../users/entities/favorite.entity';

@Entity('products')
export class Product {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({ name: 'image_urls', type: 'json', nullable: true })
    imageUrls: string[];

    @Column({ name: 'thumbnail_urls', type: 'json', nullable: true })
    thumbnailUrls: string[];

    @Column({ nullable: true })
    type: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'decimal', precision: 10, scale: 2, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    price: number;

    @Column({ name: 'stock_quantity' })
    stockQuantity: number;

    @Column({ name: 'is_promotion', default: false })
    isPromotion: boolean;

    @Column({
        name: 'promotion_price', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: {
            to: (value: number) => value,
            from: (value: string) => value ? parseFloat(value) : null
        }
    })
    promotionPrice: number;

    @Column({ name: 'is_featured', default: false, nullable: true })
    isFeatured: boolean;

    @Column({ name: 'sold_count', default: 0 }) // int, default 0
    soldCount: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 }) // decimal(3,2), default 0
    rating: number;

    @Column({ name: 'review_count', default: 0 }) // int, default 0
    reviewCount: number;

    @CreateDateColumn({ name: 'created_at', nullable: true }) // timestamp
    createdAt: Date;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => SoldProduct, (soldProduct) => soldProduct.product)
    soldProducts: SoldProduct[];

    @OneToMany(() => Favorite, (favorite) => favorite.product)
    favorites: Favorite[];
}