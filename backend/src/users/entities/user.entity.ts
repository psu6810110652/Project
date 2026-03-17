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

  @Column({ default: false })
  isGoogleLogin: boolean;

  @Column({ nullable: true })
  phone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ type: 'text', nullable: true })
  addressSummary?: string; // เก็บที่อยู่แบบ String ทีเดียวทั้งหมด

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @Column({ name: 'favorites_data', type: 'jsonb', default: [] })
  favoritesData: any[];

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpire: Date;

  // ===== PDPA Consent Fields =====

  @Column({ name: 'agreed_to_terms', default: false })
  agreedToTerms: boolean;               // บังคับ — ยอมรับ Terms & Privacy Policy

  @Column({ name: 'terms_version', nullable: true })
  termsVersion: string;                 // เวอร์ชันที่ยอมรับ เช่น "1.0"

  @Column({ name: 'terms_agreed_at', type: 'timestamp', nullable: true })
  termsAgreedAt: Date;                  // เวลาที่กด ยอมรับ

  @Column({ name: 'marketing_consent', default: false })
  marketingConsent: boolean;            // ไม่บังคับ — รับโปรโมชัน

  @Column({ name: 'marketing_consent_at', type: 'timestamp', nullable: true })
  marketingConsentAt: Date;             // เวลาที่ติ๊กรับข่าวสาร

  @Column({ name: 'consent_ip_address', nullable: true })
  consentIpAddress: string;             // IP ที่ใช้สมัคร (หลักฐานตาม PDPA)
}