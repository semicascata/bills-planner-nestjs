import { IJwtPayload } from './interface/jwt-payload.interface';
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { NewUserDto } from '../user/dto/new-user.dto';
import { IUser } from '../user/interface/user.interface';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('bp/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async registerUser(
    @Body(ValidationPipe) newUserDto: NewUserDto,
  ): Promise<any> {
    return await this.authService.registerUser(newUserDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async validateUser(@Body(ValidationPipe) loginDto: LoginDto): Promise<IUser> {
    return await this.authService.validateUser(loginDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('refresh'))
  async validateRefresh(
    @Body(ValidationPipe) payload: IJwtPayload,
  ): Promise<{ token: string }> {
    return await this.authService.validateRefresh(payload);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Req() reqBody: any): Promise<IUser> {
    return await this.authService.getUser(reqBody);
  }
}
