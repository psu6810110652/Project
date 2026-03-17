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
import { User, UserRole } from './entities/user.entity';
import { Repository, MoreThan, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // ====================================================================
  // 🔢 สร้าง User ID แบบกำหนดเอง
  //    Admin  → A001, A002, A003, ...
  //    User   → 6900000000, 6900000001, ... (YY + 8 หลัก ตามปี พ.ศ.)
  // ====================================================================
  private async generateUserId(role: UserRole): Promise<string> {
    if (role === UserRole.ADMIN) {
      // Admin: A001, A002, A003, ...
      // หา admin ID ล่าสุดที่มี pattern Axxx
      const result = await this.usersRepository
        .createQueryBuilder('user')
        .select('user.id', 'id')
        .where("user.id LIKE 'A%'")
        .orderBy('user.id', 'DESC')
        .limit(1)
        .getRawOne();

      if (!result?.id) {
        return 'A001'; // ยังไม่มี Admin เลย เริ่มที่ A001
      }

      // แปลงเบอร์ล่าสุด เช่น A007 → 7 → +1 → A008
      const lastNum = parseInt(result.id.replace('A', ''), 10);
      const nextNum = lastNum + 1;
      if (nextNum > 999) {
        throw new InternalServerErrorException('Admin ID เต็มแล้ว (A999)');
      }
      return `A${String(nextNum).padStart(3, '0')}`; // A001 ~ A999

    } else {
      // User ทั่วไป: YY + 8 หลัก ตามปี พ.ศ.
      const year = new Date().getFullYear(); // ค.ศ. เช่น 2026
      const buddhistYear = year + 543;       // พ.ศ. เช่น 2569
      const yy = buddhistYear % 100;         // 2 หลักท้าย เช่น 69

      const rangeStart = `${yy}000000`; // "69000000"
      const rangeEnd = `${yy}999999`; // "69999999"

      // หา max ID ใน range ของปีนี้
      const result = await this.usersRepository
        .createQueryBuilder('user')
        .select('MAX(CAST(user.id AS BIGINT))', 'maxId')
        .where("user.id ~ '^[0-9]+$'") // เฉพาะที่เป็นตัวเลขล้วน
        .andWhere('CAST(user.id AS BIGINT) >= :start AND CAST(user.id AS BIGINT) <= :end', {
          start: parseInt(rangeStart),
          end: parseInt(rangeEnd),
        })
        .getRawOne();

      const maxId = result?.maxId ? parseInt(result.maxId) : parseInt(rangeStart) - 1;
      const nextId = maxId + 1;

      if (nextId > parseInt(rangeEnd)) {
        throw new InternalServerErrorException('ID ในปีนี้เต็มแล้ว ไม่สามารถสร้างผู้ใช้ใหม่ได้');
      }
      return String(nextId); // เก็บเป็น string เช่น "6900000000"
    }
  }

  async create(createUserDto: CreateUserDto, ipAddress?: string): Promise<User> {
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

    // ===== ตรวจสอบ Consent (ป้องกัน bypass จาก Postman) =====
    if (!createUserDto.agreedToTerms) {
      throw new BadRequestException('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ');
    }

    let hashedPassword: string | undefined = undefined;
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    }

    const now = new Date();

    const { phoneNumber, ...rest } = createUserDto;

    // ===== กำหนด Role และ Generate ID =====
    const role: UserRole = (rest as any).role ?? UserRole.USER;
    const newId = await this.generateUserId(role);

    const newUser: User = this.usersRepository.create({
      id: newId,
      username: rest.username,
      email: rest.email,
      isGoogleLogin: rest.isGoogleLogin,
      phone: phoneNumber,
      password: hashedPassword,
      role: role,

      // ===== บันทึก Consent พร้อมหลักฐาน =====
      agreedToTerms: true,
      termsVersion: '1.0',
      termsAgreedAt: now,
      marketingConsent: rest.marketingConsent ?? false,
      marketingConsentAt: rest.marketingConsent ? now : null,
      consentIpAddress: ipAddress ?? null,
    } as DeepPartial<User>);

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

  async findOneById(id: string): Promise<User | null> {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
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

  async remove(id: string) {
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

    // 4. สร้าง URL ของ React Frontend
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอเปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ \n\n กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่: \n\n ${resetUrl} \n\n (ลิงก์นี้จะหมดอายุใน 15 นาที หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้)`;

    try {
      await this.sendEmail(user.email, 'รีเซ็ตรหัสผ่าน - ธีรยุทธการเกษตร', message);
      return { message: 'ส่งอีเมลสำเร็จแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ' };
    } catch (error) {
      console.error('Email error:', error);
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
        user: 'lipapiruk107@gmail.com',
        pass: 'tnmagcwbuasdpftm',
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