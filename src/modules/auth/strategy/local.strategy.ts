import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { IUser } from '../../user/interface/user.interface';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('LocalStrategy');

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  // validation (must be called as "validate")
  async validate(username: string, password: string): Promise<IUser> {
    const loginDto: LoginDto = { username, password };

    try {
      const user = await this.authService.validateUser(loginDto);

      if (!user) {
        this.logger.error('User not authorized or user not found');
        throw new UnauthorizedException(
          'User not authorized or user not found',
        );
      }

      return user;
    } catch (err) {
      this.logger.error(`Invalid credentials: ${err.message}`);
      throw new UnauthorizedException(`Invalid credentials: ${err.message}`);
    }
  }
}
