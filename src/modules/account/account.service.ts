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
    newBill.credited = false;
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
  async insertBillToAccount(user: IUser): Promise<any> {
    // user account
    const userAccount = await this.userModel.findOne({ _id: user.id });

    // bills
    const bills = await this.accountModel
      .find({ _user: userAccount })
      .where({ credited: false });

    if (bills.length === 0) {
      this.logger.verbose(
        `All bills already credited, wallet: ${userAccount.wallet}`,
      );
      return { wallet: userAccount.wallet };
    }

    bills.map(bill => {
      if (bill.credited === false) {
        bill.credited = true;
        userAccount['wallet'] = userAccount.wallet - bill.bill;

        bill.save();
      }
    });

    await userAccount.save();

    this.logger.verbose(
      `Bills inserted on wallet. User: "${userAccount.username}", Wallet: ${userAccount.wallet}`,
    );

    return { wallet: userAccount.wallet, bills };
  }

  // sum all bills
  async sumBills(user: IUser): Promise<any> {
    const bills = await this.accountModel.find({ _user: user });

    // bills payed
    const creditedBills = bills.reduce((a, b) => {
      if (b.credited === true) {
        return a + b.bill;
      } else {
        return false;
      }
    }, 0);

    // items payed
    const itemsPayed = bills.map(bill => {
      if (bill.credited === true) {
        return bill.description;
      } else {
        return '';
      }
    });

    // bills to pay
    const needToPay = bills.reduce((a, b) => {
      if (b.credited === false) {
        return a + b.bill;
      } else {
        return false;
      }
    }, 0);

    // items to pay
    const itemsToPay = bills.map(bill => {
      if (bill.credited === false) {
        return bill.description;
      } else {
        return '';
      }
    });

    this.logger.verbose(
      `User: ${user.username}, Wallet: ${user.wallet}, Payed: ${
        creditedBills ? true : 'All good'
      }, Need to pay: ${needToPay ? 'R$' + needToPay.toFixed(2) : 'All good'}`,
    );

    // return bills;
    return {
      userWallet: user.wallet,
      payed: `${creditedBills ? 'R$' + creditedBills.toFixed(2) : 'All good'}`,
      itemsPayed,
      needToPay: `${needToPay ? 'R$' + needToPay.toFixed(2) : 'All good'}`,
      itemsToPay,
    };
  }
}
