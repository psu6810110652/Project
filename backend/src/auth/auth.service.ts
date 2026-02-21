import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  //อันนี้ใช้ตรวจสอบ username และ password ว่าถูกต้องไหม
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  //อันนี้ใช้สร้าง JWT token หลังจากที่ตรวจสอบ username และ password ผ่านแล้ว
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token, // เก็บของเดิมไว้เผื่อมีโค้ดส่วนอื่นเรียกใช้
      token: token,        // ส่ง token ไปให้ด้วยเผื่อฝั่ง React เรียกใช้ชื่อนี้
      // 👇 ส่งก้อน user กลับไปให้ React พร้อม ID ครับ
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async googleLogin(accessToken: string) {
    console.log('DEBUG: googleLogin called. Token prefix:', accessToken?.substring(0, 15));

    try {
      if (!accessToken) {
        throw new UnauthorizedException('No token provided');
      }

      console.log('DEBUG: Fetching Google UserInfo...');
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('DEBUG: Google Response Status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('DEBUG: Google Error Body:', errorBody);
        throw new UnauthorizedException(`Google returned ${response.status}: ${errorBody}`);
      }

      const payload = await response.json();
      console.log('DEBUG: Google Payload:', JSON.stringify(payload));

      const email = payload.email;
      const name = payload.name;
      const googleId = payload.sub;

      if (!email || !googleId) {
        throw new UnauthorizedException('Incomplete data from Google');
      }

      // 2. ค้นหา User ในฐานข้อมูล teerayut_dev ด้วย email
      let user = await this.usersService.findOneByEmail(email);

      // 3. ถ้ายังไม่มี User นี้ ให้สร้างใหม่ทันที (Auto-register)
      if (!user) {
        console.log('DEBUG: Creating new user for', email);
        user = await this.usersService.create({
          email: email,
          username: email,
          password: await bcrypt.hash(googleId, 10),
          isGoogleLogin: true,
        });
      } else {
        console.log('DEBUG: Found existing user', user.id);
      }

      // 4. ออก JWT Token ของระบบเราเองให้ไปใช้งานต่อ
      return this.login(user);

    } catch (error) {
      console.error('DEBUG: googleLogin EXCEPTION:', error);
      throw new UnauthorizedException('Google Login Failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}