import {
    Entity,
    Column,
    PrimaryColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_details')
export class ProductDetail {

    @PrimaryColumn({ name: 'product_id' })
    productId: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // เก็บรูปภาพความละเอียดสูงทั้งหมด (Gallery)
    @Column({ name: 'image_urls', type: 'json', nullable: true })
    imageUrls: string[];

    @Column({ nullable: true })
    type: string;

    // 🌟 ใช้งาน JSONB เพื่อเก็บสเปคที่แตกต่างกันตามประเภทสินค้า (เช่น สูตรปุ๋ย, สารสำคัญในยา)
    @Column({ name: 'specifications', type: 'jsonb', nullable: true })
    specifications: Record<string, any>;

    @Column({ name: 'how_to_use', type: 'text', nullable: true })
    howToUse: string;

    @OneToOne(() => Product, (product) => product.detail, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;
}