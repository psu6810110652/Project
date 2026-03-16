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

    const newUser: User = this.usersRepository.create({
      username: rest.username,
      email: rest.email,
      isGoogleLogin: rest.isGoogleLogin,
      phone: phoneNumber,
      password: hashedPassword,

      // ===== บันทึก Consent พร้อมหลักฐาน =====
      agreedToTerms: true,
      termsVersion: '1.0',              // ← อัปเดตเป็น '1.1', '2.0' เมื่อแก้ policy
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
  // 🟢 ระบบลืมรหัสผ่าน (Forgot Password) - ส่งอีเมลแบบมีปุ่ม HTML
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
    
    // 🟢 5. สร้างหน้าตาอีเมลแบบ HTML
    const htmlMessage = `
      <div style="font-family: 'Prompt', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #DCEDC1; border-radius: 16px; background-color: #FFFEF2;">
        <h2 style="color: #256D45; text-align: center; font-size: 24px; margin-bottom: 20px;">
          คำขอตั้งรหัสผ่านใหม่
        </h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">สวัสดีครับ,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีที่เชื่อมโยงกับอีเมล <strong>${email}</strong> บนระบบของ <strong>ธีรยุทธการเกษตร</strong>
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          หากคุณเป็นผู้ร้องขอ กรุณาคลิกที่ปุ่มด้านล่างเพื่อดำเนินการตั้งรหัสผ่านใหม่:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" 
             style="background-color: #256D45; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 109, 69, 0.2);">
            คลิกเพื่อตั้งรหัสผ่านใหม่
          </a>
        </div>

        <p style="color: #666; font-size: 14px; text-align: center;">
          <em>หมายเหตุ: ลิงก์นี้จะมีอายุการใช้งาน 15 นาที เพื่อความปลอดภัยของคุณ</em>
        </p>
        <hr style="border: 0; border-top: 2px dashed #DCEDC1; margin: 30px 0;">
        <p style="color: #999; font-size: 13px; text-align: center; line-height: 1.5;">
          หากปุ่มด้านบนไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณได้:<br>
          <a href="${resetUrl}" style="color: #256D45; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 13px; text-align: center; margin-top: 20px;">
          หากคุณไม่ได้ร้องขอการเปลี่ยนรหัสผ่านนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้
        </p>
      </div>
    `;

    try {
      await this.sendEmail(user.email, 'รีเซ็ตรหัสผ่าน - ธีรยุทธการเกษตร', htmlMessage);
      return { message: 'ส่งอีเมลสำเร็จแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ' };
    } catch (error) {
      console.error('Email error:', error);
<<<<<<< resetpassword
      user.resetPasswordToken = null as any; 
=======
      // ถ้าส่งอีเมลไม่สำเร็จ ต้องเคลียร์ข้อมูล Token ทิ้ง
      user.resetPasswordToken = null as any;
>>>>>>> main
      user.resetPasswordExpire = null as any;
      await this.usersRepository.save(user);

      throw new InternalServerErrorException('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง');
    }
  }

  // 🟢 ฟังก์ชันรีเซ็ตรหัสผ่าน (เอากลับมาให้แล้วครับ ฟังก์ชันนี้แหละที่หายไป!)
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
  private async sendEmail(toEmail: string, subject: string, htmlContent: string) {
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
      html: htmlContent, 
    });
  }
} 