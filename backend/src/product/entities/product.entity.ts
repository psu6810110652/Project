import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity('products')
export class Product {

    @PrimaryColumn() 
    id: string;

    @Column() 
    name: string;

    /**
     * 🌟 ปรับเป็น Array เพื่อรองรับหลายรูป
     * ใช้ type: 'json' เพื่อความยืดหยุ่นสูง (รองรับทั้ง MySQL และ PostgreSQL)
     * หรือใช้ type: 'simple-array' ถ้าคุณใช้ Database อื่นๆ
     */
    @Column({ name: 'image_urls', type: 'json', nullable: true })
    imageUrls: string[];

    @Column({ name: 'thumbnail_urls', type: 'json', nullable: true })
    thumbnailUrls: string[];

    @Column({ nullable: true }) 
    type: string;

    @Column({ type: 'text', nullable: true }) 
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
        to: (value: number) => value,
        from: (value: string) => parseFloat(value)
    }}) 
    price: number;

    @Column({ name: 'stock_quantity' }) 
    stockQuantity: number;

    @Column({ name: 'is_promotion', default: false })
    isPromotion: boolean;

    @Column({ name: 'promotion_price', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: {
        to: (value: number) => value,
        from: (value: string) => value ? parseFloat(value) : null
    }})
    promotionPrice: number;

    @Column({ name: 'is_featured', default: false, nullable: true }) 
    isFeatured: boolean;

    @CreateDateColumn({ name: 'created_at', nullable: true }) 
    createdAt: Date;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;
}