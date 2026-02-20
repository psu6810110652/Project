import { IsString, IsEmail,MinLength,IsOptional, IsBoolean } from "class-validator";
export class CreateUserDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    password: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsBoolean()
    isGoogleLogin?: boolean;
}
