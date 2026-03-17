import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Favorite } from '../../users/entities/favorite.entity';
import { ProductDetail } from './product-detail.entity';
import { Review } from '../../review/entities/review.entity';

@Entity('products')
export class Product {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    // เก็บรูป Thumbnail เล็กๆ สำหรับหน้าแรก
    @Column({ name: 'thumbnail_urls', type: 'json', nullable: true })
    thumbnailUrls: string[];

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

    @Column({ name: 'favorite_count', default: 0 })
    favoriteCount: number;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date;

    // --- Relations ---

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => Favorite, (favorite) => favorite.product)
    favorites: Favorite[];

    // เชื่อมไปยังตารางรายละเอียดเชิงลึก
    @OneToOne(() => ProductDetail, (detail) => detail.product, { cascade: true })
    detail: ProductDetail;

    @OneToMany(() => Review, (review) => review.product)
    reviews: Review[];
}