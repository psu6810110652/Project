import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });
    if (existingEmail) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username }
    });
    if (existingUsername) {
      throw new ConflictException('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    }

    let hashedPassword: string | undefined = undefined;
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    }

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);
      const { password, ...result } = savedUser;
      return result as User;
    } catch (error: any) {
      if (error.code === '23505' || error.detail?.includes('already exists')) {
        throw new ConflictException('Username หรือ Email นี้มีอยู่แล้วครับน้องบ่าว');
      }
      throw new InternalServerErrorException('เกิดข้อผิดพลาดในการสร้างผู้ใช้');
    }
  }

  async findOne(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { username },
      relations: ['addresses'],
    });
  }

  async findOneById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: ['addresses'],
    });
    if (!user) return null;
    const { password, ...result } = user;
    return result as User;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['addresses'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['addresses'] });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException('หาผู้ใช้ไม่เจอครับ');
    }

    const updatedUser = await this.usersRepository.save(user);
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('หาผู้ใช้ไม่เจอครับ');
    }
    return this.usersRepository.remove(user);
  }

  // ====================================================================
  // 🟢 ระบบลืมรหัสผ่าน (Forgot Password) - ส่งอีเมลจริง
  // ====================================================================

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้งานด้วยอีเมลนี้');
    }

    // 1. สร้าง Token แบบสุ่ม
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // 2. เข้ารหัส Token ก่อนเก็บลงฐานข้อมูลเพื่อความปลอดภัย
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // 3. ตั้งเวลาหมดอายุ (15 นาที)
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15);
    user.resetPasswordExpire = expireDate;

    await this.usersRepository.save(user);

    // 4. สร้าง URL ของ React Frontend (เช็คพอร์ตหน้าบ้านให้ตรงด้วยนะครับ)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอเปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ \n\n กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่: \n\n ${resetUrl} \n\n (ลิงก์นี้จะหมดอายุใน 15 นาที หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้)`;

    try {
      // 🟢 เรียกใช้ฟังก์ชันส่งอีเมล
      await this.sendEmail(user.email, 'รีเซ็ตรหัสผ่าน - ธีรยุทธการเกษตร', message);
      return { message: 'ส่งอีเมลสำเร็จแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ' };
    } catch (error) {
      console.error('Email error:', error);
      // ถ้าส่งอีเมลไม่สำเร็จ ต้องเคลียร์ข้อมูล Token ทิ้ง
      user.resetPasswordToken = null as any; 
      user.resetPasswordExpire = null as any;
      await this.usersRepository.save(user);
      
      throw new InternalServerErrorException('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: MoreThan(new Date()), 
      },
    });

    if (!user) {
      throw new BadRequestException('ลิงก์ไม่ถูกต้อง หรือหมดอายุไปแล้วครับ');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = null as any;
    user.resetPasswordExpire = null as any;

    await this.usersRepository.save(user);

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }

  // 🟢 ฟังก์ชันส่งอีเมลจริงผ่าน Gmail
  private async sendEmail(toEmail: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lipapiruk107@gmail.com', // 📌 1. ใส่อีเมล Gmail ของคุณตรงนี้
        pass: 'tnmagcwbuasdpftm',    // 📌 2. ใส่ "รหัสผ่านสำหรับแอป" (App Password) ตรงนี้
      },
    });

    await transporter.sendMail({
      from: '"ธีรยุทธการเกษตร" <noreply@yourdomain.com>',
      to: toEmail,
      subject: subject,
      text: message,
    });
  }
}