import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer'; // อย่าลืม Import บรรทัดนี้นะครับ

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  @Exclude() // ย้ายมาซ่อน password ตรงนี้ครับ!
  password?: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'User' })
  role: string;

  @Column({ default: false })
  isGoogleLogin: boolean;

  // ใช้ phone ตัวเดียวให้ตรงกับ React State ไปเลยครับ จะได้ไม่งง
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