import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer'; 

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
  nameSurname?: string;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ nullable: true })
  houseNumber?: string;

  @Column({ nullable: true })
  dormRoom?: string;

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
}