import {
  Controller,
  Get,
  Delete,
  Param,
  Body,
  Put,
  // Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from './interface/user.interface';
import { CreditDto } from './dto/credit.dto';

@Controller('bp/v1/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
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
