import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(AuthGuard('local'))

  @Post('login')
  async login(@Request() req) {
    console.log('Received Local Login Request');
    return this.authService.login(req.user);
  }
  @Post('google')
  async googleLogin(@Body('token') token: string) {
    console.log('Received Google Login Request with token:', token ? 'Token Present' : 'Token Missing');
    return this.authService.googleLogin(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('google-client-id')
  getGoogleClientId() {
    return { clientId: process.env.GOOGLE_CLIENT_ID };
  }
}