import { IJwtPayload } from './../interface/jwt-payload.interface';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT_REFRESH } from 'src/config';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  private logger = new Logger('RefreshStrategy');

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: JWT_REFRESH,
    });
  }

  // validation (must be called as "validate")
  async validate(payload: IJwtPayload, done: Function): Promise<any> {
    const user = await this.authService.validateToken(payload);

    if (!user) {
      this.logger.error('Invalid credentials');
      return done(new UnauthorizedException('Invalid credentials'), false);
    }
    done(null, user);
  }
}
