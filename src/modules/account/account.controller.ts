import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { NewBillDto } from './dto/account.dto';
import { GetUser } from '../../common';
import { IUser } from '../user/interface/user.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('bp/v1/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @Post('userbill')
  @UseGuards(AuthGuard('jwt'))
  async newBill(
    @GetUser() user: IUser,
    @Body(ValidationPipe) newBillDto: NewBillDto,
  ): Promise<any> {
    return this.accountService.newBill(newBillDto, user);
  }

  @Get('payed')
  @UseGuards(AuthGuard('jwt'))
  async payedBills(@GetUser() user: IUser): Promise<any> {
    return await this.accountService.payedBills(user);
  }

  @Get('needtopay')
  @UseGuards(AuthGuard('jwt'))
  async needToPay(@GetUser() user: IUser): Promise<any> {
    return await this.accountService.needToPay(user);
  }

  @Put('userbill/commit')
  @UseGuards(AuthGuard('jwt'))
  async insertBillToAccount(@GetUser() user: IUser): Promise<any> {
    return await this.accountService.insertBillToAccount(user);
  }

  @Get('billsdate/:date')
  @UseGuards(AuthGuard('jwt'))
  async billsPerDate(@GetUser() user: IUser, @Param('date') date: string): Promise<any> {
    return await this.accountService.billsPerDate(user, date);
  }

  @Put('credited/:id')
  @UseGuards(AuthGuard('jwt'))
  async changeCredited(@GetUser() user: IUser, @Param('id') id: string): Promise<any> {
    return await this.accountService.changeCredited(user, id);
  };

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteSingleBill(@GetUser() user: IUser, @Param('id') id: string): Promise<any> {
    return await this.accountService.deleteSingleBill(user, id);
  }
}
