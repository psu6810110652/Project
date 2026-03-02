import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    recipient_name: string; // ชื่อผู้รับ

    @Column()
    phone_number: string;

    @Column()
    full_address: string; // เก็บรายละเอียดที่อยู่

    @Column({ default: false })
    is_default: boolean; //เก็บค่า true/false ว่าเป็นที่อยู่หลักหรือไม่

    // ความสัมพันธ์: ที่อยู่หลายอัน เป็นของ User 1 คน
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}