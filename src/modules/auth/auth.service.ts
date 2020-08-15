import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../user/interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { NewUserDto } from '../user/dto/new-user.dto';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  // token store
  private tokenList = {};

  constructor(
    @InjectModel('User')
    private readonly userModel: Model<IUser>, // private jwtService: JwtService,
  ) {}

  // register new user
  async registerUser(newUserDto: NewUserDto): Promise<Object> {
    // password validation
    if (newUserDto.password !== newUserDto.confirm_password) {
      this.logger.error('Passwords does not match');
      throw new ConflictException('Passwords does not match');
    }

    // new user instance
    const newUser = new this.userModel(newUserDto);

    try {
      await newUser.save();
      this.logger.verbose(
        `New user "${newUser.username}" successfully registered!`,
      );
      return {
        message: `User ${newUser.username} registered`,
        email: newUser.email,
        role: newUser.role,
      };
    } catch (err) {
      if (err.code === 11000) {
        this.logger.error('User or email already registered');
        throw new ConflictException('User or email already registered');
      }
      this.logger.error(`Failed to register user: ${err.message}`);
      throw new InternalServerErrorException(
        `Failed to register user: ${err.message}`,
      );
    }
  }
}
