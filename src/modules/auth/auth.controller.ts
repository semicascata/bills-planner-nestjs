import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NewUserDto } from '../user/dto/new-user.dto';
// import { IUser } from '../user/interface/user.interface';

@Controller('bp/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async registerUser(@Body() newUserDto: NewUserDto): Promise<any> {
    return await this.authService.registerUser(newUserDto);
  }
}
