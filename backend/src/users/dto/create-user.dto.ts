import {IsString,IsEmail,MinLength,IsOptional,IsBoolean,IsNotEmpty,ValidateIf} from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'กรุณากรอก Username' })
    @IsString()
    username: string;

    @IsNotEmpty({ message: 'กรุณากรอก Email' })
    @IsEmail({}, { message: 'รูปแบบ Email ไม่ถูกต้อง' }) 
    email: string;

    @IsOptional()
    @IsBoolean()
    isGoogleLogin?: boolean;

    // ไฮไลท์สำคัญ: ตรวจสอบรหัสผ่านก็ต่อเมื่อ isGoogleLogin เป็น false หรือไม่ได้ส่งมา
    @ValidateIf(o => !o.isGoogleLogin) 
    @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
    @IsString()
    @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    password?: string; // ใส่เครื่องหมาย ? เผื่อกรณี Google Login จะได้ไม่ส่งค่านี้มา

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}