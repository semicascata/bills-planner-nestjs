import {
  Controller,
  Get,
  Delete,
  Param,
  Body,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, Role } from './interface/user.interface';
import { CreditDto } from './dto/credit.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRole } from '../../common';

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
  async deleteUser(@Param('id') id: string): Promise<any> {
    return await this.userService.deleteUser(id);
  }

  @Put('wallet/:id')
  async fatWallet(
    @Param('id') id: string,
    @Body() creditDto: CreditDto,
  ): Promise<any> {
    return await this.userService.fatWallet(id, creditDto);
  }
}
