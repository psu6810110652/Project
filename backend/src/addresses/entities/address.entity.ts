import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: true })
    houseNumber?: string;

    @Column({ nullable: true })
    streetSoi?: string;

    @Column({ nullable: true })
    province?: string;

    @Column({ nullable: true })
    district?: string;

    @Column({ nullable: true })
    subDistrict?: string;

    @Column({ nullable: true })
    postalCode?: string;

    @Column({ type: 'text' })
    fullAddress: string;

    @Column({ default: false })
    isDefault: boolean;

    // ความสัมพันธ์: ที่อยู่หลายอัน เป็นของ User 1 คน
    @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}