import {
  Controller,
  Body,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { NewBillDto } from './dto/account.dto';
import { GetUser } from '../../common';
import { IUser } from '../user/interface/user.interface';
import { AuthGuard } from '@nestjs/passport';
// import { IAccount } from '../account/interface/account.interface';

@Controller('bp/v1/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('userbill')
  @UseGuards(AuthGuard('jwt'))
  async newBill(
    @GetUser() user: IUser,
    @Body() newBillDto: NewBillDto,
  ): Promise<any> {
    return this.accountService.newBill(newBillDto, user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async sumBills(@GetUser() user: IUser): Promise<any> {
    return await this.accountService.sumBills(user);
  }

  @Put('newbill/:id')
  async insertBillToAccount(
    @Body() newBillDto: NewBillDto,
    @Param('id') id: string,
  ): Promise<any> {
    return await this.accountService.insertBillToAccount(newBillDto, id);
  }
}
