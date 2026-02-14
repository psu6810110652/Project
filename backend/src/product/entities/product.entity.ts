import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne, 
    JoinColumn,
    OneToMany
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { WholesalePrice } from './wholesale-price.entity';

@Entity('products')
export class Product {
    
    @PrimaryGeneratedColumn() // id เป็น serial (autoincrement)
    id: number;

    @Column({ name: 'category_id', nullable: true }) // foreign key
    categoryId: number;

    @Column() // varchar NN (Not Null)
    name: string;

    @Column({ type: 'text', nullable: true }) // description text (nullable)
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 }) // decimal(10,2) NN
    price: number;

    @Column({ name: 'stock_quantity' }) // int NN
    stockQuantity: number;

    @Column({ name: 'is_featured', nullable: true }) // boolean
    isFeatured: boolean;

    @CreateDateColumn({ name: 'created_at', nullable: true }) // timestamp
    createdAt: Date;

    @Column({ length: 500, nullable: true })
    imageUrl: string;

    @Column({ length: 50, nullable: true })
    unit: string;

    // --- ความสัมพันธ์ (Relation) กับตาราง Category ---
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    // --- ความสัมพันธ์ (Relation) กับตาราง WholesalePrice ---
    @OneToMany(() => WholesalePrice, (wholesalePrice) => wholesalePrice.product, { cascade: true })
    wholesalePrices: WholesalePrice[];
}