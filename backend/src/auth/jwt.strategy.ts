import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secret_key_1234', // เก็บใน .env นะเพื่อน ๆ
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, userId: payload.sub, username: payload.username, role: payload.role };
  }
}