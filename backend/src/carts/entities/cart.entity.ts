import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity'; // ⚠️ เช็คชื่อโฟลเดอร์ product ของคุณให้ตรงด้วยนะครับ

@Entity('carts') // สร้างตารางชื่อ carts ในฐานข้อมูล
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number; // เก็บว่าใครเป็นคนหยิบใส่ตะกร้า

    @Column()
    product_id: number; // เก็บว่าหยิบสินค้าชิ้นไหน

    @Column({ type: 'int', default: 1 })
    quantity: number; // จำนวนที่หยิบ

    // ความสัมพันธ์: เอาไว้ให้ TypeORM วิ่งไปดึงชื่อและราคาสินค้ามาโชว์ตอนเปิดหน้าตะกร้า
    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}