import {
  Controller,
  Get,
  Delete,
  Param,
  Body,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, Role } from './interface/user.interface';
import { CreditDto } from './dto/credit.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRole, GetUser } from '../../common';

@Controller('bp/v1/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @AuthRole(Role.admin)
  async fetchUsers(): Promise<IUser[]> {
    return await this.userService.fetchUsers();
  }

  @Delete(':id')
  @AuthRole(Role.admin)
  async deleteUser(@Param('id') id: string): Promise<any> {
    return await this.userService.deleteUser(id);
  }

  @Put('wallet/:id')
  async fatWallet(
    @Param('id') id: string,
    @GetUser() user: IUser,
    @Body(ValidationPipe) creditDto: CreditDto,
  ): Promise<any> {
    return await this.userService.fatWallet(id, user, creditDto);
  }
}
