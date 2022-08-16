import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly env: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.get('ACCESS_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const accessToken = req.get('authorization').replace('Bearer', '').trim();
    return {
      ...payload,
      accessToken,
    };
  }
}
