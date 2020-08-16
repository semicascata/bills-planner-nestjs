import { IJwtPayload } from './../interface/jwt-payload.interface';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JWT_SECRET } from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger('JwtStrategy');

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
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
