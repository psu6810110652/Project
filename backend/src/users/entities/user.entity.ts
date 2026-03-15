import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer'; 
import { Address } from '../../addresses/entities/address.entity';
import { Favorite } from './favorite.entity';

export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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
}