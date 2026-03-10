import { IsString, IsEmail, MinLength, IsOptional, IsNotEmpty, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้' })
  @MinLength(2, { message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร' })
  username: string;

  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  @Matches(/^(?=.*[0-9!@#$%^&*])/, {
    message: 'รหัสผ่านต้องมีตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว',
  })
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}