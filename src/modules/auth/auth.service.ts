import { IJwtPayload } from './interface/jwt-payload.interface';
import { IToken } from './interface/token.interface';
import { IUser } from './../user/interface/user.interface';
import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { NewUserDto } from '../user/dto/new-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import {
  JWT_EXPIREINS,
  JWT_REFRESH,
  JWT_REFRESH_EXPIRESIN,
} from '../../config';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  // token store
  private tokenList = {};

  constructor(
    @InjectModel('User')
    private readonly userModel: Model<IUser>,
    private jwtService: JwtService,
  ) { }

  // validation (local-strategy)
  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.userModel
      .findOne({ username: loginDto.username })
      .select('+password');

    // check credentials
    const isMatch = await argon2.verify(user.password, loginDto.password);

    if (user && isMatch) {
      const tokens: IToken = await this.createTokens(user);

      const data = {
        userId: user.id,
      };

      // token store
      this.tokenList[tokens.refreshToken] = data;

      this.logger.verbose(`User "${user.username}" logged in`);
      // console.log(this.tokenList);

      return tokens;
    }
  }

  // generate tokens
  async createTokens(user: IUser): Promise<IToken> {
    const payload: IJwtPayload = { id: user.id };

    const token = this.jwtService.sign(payload, {
      expiresIn: JWT_EXPIREINS,
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH, {
      expiresIn: JWT_REFRESH_EXPIRESIN,
    });

    return {
      token,
      refreshToken,
    };
  }

  // validate token, jwt-strategy/refresh-strategy
  async validateToken(payload: IJwtPayload): Promise<IUser> {
    return await this.userModel.findOne({ _id: payload.id });
  }

  // refresh token
  async validateRefresh(payload: IJwtPayload): Promise<{ token: string }> {
    // decode payload
    const decoded = jwt.verify(payload['refreshToken'], JWT_REFRESH);

    // get user from payload
    const user: IUser = await this.userModel.findOne({ _id: decoded['id'] });

    try {
      const refreshToken: string = payload['refreshToken'];

      const isMatch = refreshToken in this.tokenList;

      if (isMatch) {
        const payload: IJwtPayload = { id: user.id };
        const token = this.jwtService.sign(payload, {
          expiresIn: JWT_EXPIREINS,
        });

        // update token store
        this.tokenList[refreshToken].token = token;

        this.logger.verbose(`Token refreshed for user "${user.username}"`);
        return { token };
      } else {
        this.logger.error('Invalid token credentials');
        throw new UnauthorizedException('Invalid token credentials');
      }
    } catch (err) {
      this.logger.error(`Invalid/expired token: ${err.message}`);
      throw new UnauthorizedException(`Invalid/expired token: ${err.message}`);
    }
  }

  // register new user
  async registerUser(newUserDto: NewUserDto): Promise<any> {
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

  // get user from 'req.body.user'
  async getUser(reqBody: any): Promise<IUser> {
    try {
      if (reqBody) {
        const user: IUser = reqBody.user;
        this.logger.verbose(`Get user "${user.username}"`);
        return user;
      }
    } catch (err) {
      this.logger.error(`Failed getting user: ${err.message}`);
      throw new UnauthorizedException(`Failed getting user: ${err.message}`);
    }
  }

  // change user password
  async changePassword(user: IUser, changePasswordDto: ChangePasswordDto): Promise<any> {
    const userAcc = await this.userModel.findOne({ _id: user.id }).select('+password');
    const { current, newPass } = changePasswordDto;

    try {
      const isMatch = await argon2.verify(userAcc.password, current);

      if (isMatch) {
        userAcc['password'] = newPass;
        await userAcc.save();

        this.logger.verbose(`Password changed for user "${userAcc.username}"`);
      } else {
        this.logger.error('Password incorret');
        return { message: 'Password incorrect' };
      };

      return {
        user: userAcc.username,
        message: 'Password updated',
      };
    } catch (err) {
      this.logger.error(`Error updating password: ${err.message}`);
      throw new InternalServerErrorException(`Error updating password: ${err.message}`);
    };
  };
}
