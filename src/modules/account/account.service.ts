import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IAccount } from './interface/account.interface';
import { Model } from 'mongoose';
import { NewBillDto } from './dto/account.dto';
import { IUser } from '../user/interface/user.interface';

@Injectable()
export class AccountService {
  private logger = new Logger('AccountService');

  constructor(
    @InjectModel('Account') private readonly accountModel: Model<IAccount>,
    @InjectModel('User') private readonly userModel: Model<IUser>,
  ) {}

  // new bill
  async newBill(newBillDto: NewBillDto, user: IUser): Promise<any> {
    // new bill
    const { bill, description } = newBillDto;
    const newBill = new this.accountModel();

    newBill.bill = bill;
    newBill.description = description;
    newBill._user = user;

    try {
      // const userAccount = await this.insertBillToAccount(newBill, id);
      await newBill.save();

      this.logger.verbose(
        `New bill "${newBillDto.description}" of value ${newBillDto.bill} added to your account. Wallet: `,
      );

      return newBill;
    } catch (err) {
      this.logger.error(`Failed to insert new bill: ${err.message}`);
      throw new InternalServerErrorException(
        `Failed to insert new bill: ${err.message}`,
      );
    }
  }

  // insert bill to the account
  async insertBillToAccount(newBillDto: NewBillDto, id: string): Promise<any> {
    // user account
    const userAccount = await this.userModel.findOne({ _id: id });

    userAccount['wallet'] = userAccount.wallet - newBillDto.bill;
    await userAccount.save();

    this.logger.verbose(
      `New bill of "${newBillDto.description}", value: ${newBillDto.bill}. User wallet: ${userAccount.wallet}`,
    );

    return { wallet: userAccount.wallet, userAccount };
  }

  // sum all bills
  async sumBills(user: IUser): Promise<any> {
    const bills = await this.accountModel.find({ _user: user });

    const billsValue = bills.reduce((a, b) => {
      return a + b.bill;
    }, 0);

    const billsDesc = bills.map(a => {
      return a.description;
    });

    this.logger.verbose(`Total of bills: R$ ${billsValue.toFixed(2)}`);

    // return bills;
    return {
      items: billsDesc,
      total: `R$ ${billsValue.toFixed(2)}`,
    };
  }
}
