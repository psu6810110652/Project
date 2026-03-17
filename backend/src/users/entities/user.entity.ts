import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Address } from '../../addresses/entities/address.entity';
import { Favorite } from './favorite.entity';

export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin',
}

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  phone?: string;

  // แก้ไขให้ตรงกับ DBeaver (ใช้ชื่อ createdAt และ updatedAt)
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  occupation?: string;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];


  @Column({ name: 'favorites_data', type: 'jsonb', default: [] })
  favoritesData: any[];

  // ===== สำหรับระบบรีเซ็ตรหัสผ่าน =====
  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpire?: Date;

  // หมายเหตุ: ลบคอลัมน์ Reset Password และ PDPA ออกทั้งหมดเพื่อให้ตรงกับตาราง AWS
}