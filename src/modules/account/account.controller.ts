import { Controller, Body, Get, Param, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { NewBillDto } from './dto/account.dto';

@Controller('bp/v1/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post(':id')
  async newBill(
    @Body() newBillDto: NewBillDto,
    @Param('id') id: string,
  ): Promise<any> {
    return this.accountService.newBill(newBillDto, id);
  }

  @Get()
  async sumBills(): Promise<any> {
    return await this.accountService.sumBills();
  }
}
