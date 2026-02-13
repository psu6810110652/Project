import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne, 
    JoinColumn 
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';

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

    // --- ความสัมพันธ์ (Relation) กับตาราง Category ---
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;
}