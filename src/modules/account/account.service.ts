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
  ) { }

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
        `New bill "${newBillDto.description}" of value ${newBillDto.bill} added to your account`,
      );

      return newBill;
    } catch (err) {
      this.logger.error(`Failed to insert new bill: ${err.message}`);
      throw new InternalServerErrorException(
        `Failed to insert new bill: ${err.message}`,
      );
    }
  }

  // pay single bill
  async paySingleBill(user: IUser, id: string): Promise<any> {
    const userWallet = await this.userModel.findOne({ _id: user });
    const bill = await this.accountModel.findOne({ _id: id }).where({ _user: user });

    try {
      userWallet['wallet'] = userWallet.wallet - bill.bill;
      bill['credited'] = true;

      userWallet.save();
      bill.save();

      this.logger.verbose(`Bill "${bill.description}" credited to account of user "${userWallet.username}"`);

      return {
        wallet: userWallet.wallet,
        walletBefore: userWallet.wallet + bill.bill,
        billDescription: bill.description,
        billValue: bill.bill,
        credited: bill.credited,
      };
    } catch (err) {
      this.logger.error(`Error paying bill: ${err}`);
      throw new InternalServerErrorException(`Error paying bill: ${err}`);
    }
  };

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

  // payed bills
  async payedBills(user: IUser): Promise<any> {
    const bills = await this.accountModel
      .find({ _user: user })
      .where({ credited: true });

    const userAccount = await this.userModel.findOne({ _id: user.id });

    const pBills = bills.reduce((a, b) => {
      return a + b.bill;
    }, 0);

    // const items = bills.map(item => {
    //   return item.description;
    // });

    return {
      userWallet: userAccount.wallet,
      total: pBills,
      items: bills,
    };
  }

  // bill to pay
  async needToPay(user: IUser): Promise<any> {
    const bills = await this.accountModel
      .find({ _user: user })
      .where({ credited: false });

    const userAccount = await this.userModel.findOne({ _id: user.id });

    const npBills = bills.reduce((a, b) => {
      return a + b.bill;
    }, 0);

    // const items = bills.map(item => {
    //   return item.description;
    // });

    return {
      userWallet: userAccount.wallet,
      afterPayBills: userAccount.wallet - npBills,
      total: npBills,
      items: bills.length <= 0 ? 'All good' : bills,
    };
  }

  // get bills per date
  async billsPerDate(user: IUser, date: string): Promise<any> {
    const bills = await this.accountModel
      .find({ _user: user })
      // $gte = greater than or equal, $lte = less then or equal
      .where({ createdAt: { $gte: `${date}-01`, $lte: `${date}-30` } });

    return bills;
  }

  // change bill "credited"
  async changeCredited(user: IUser, id: string): Promise<any> {
    const bill = await this.accountModel
      .findOne({ _id: id })
      .where({ _user: user.id, credited: true }); // account
    const userWallet = await this.userModel.findOne({ _id: user.id }); // user

    try {
      bill['credited'] = false;
      await bill.save();

      userWallet['wallet'] = userWallet.wallet + bill.bill; // return 
      await userWallet.save();

      this.logger.verbose(`Bill "${bill.description}" changed to pendent bills`);
      return {
        bill,
        walletBefore: userWallet.wallet - bill.bill,
        walletAfter: userWallet.wallet.toFixed(2),
      };
    } catch (err) {
      this.logger.error(`Cannot find bill by Id: "${id}"`);
      throw new InternalServerErrorException(`Cannot find bill by Id: "${id}"`);
    };
  };

  // delete single bill
  async deleteSingleBill(user: IUser, id: string): Promise<any> {
    const bill = await this.accountModel.findOne({ _id: id }).where({ _user: user.id }); // bill

    try {
      await this.accountModel.deleteOne({ _id: bill.id });
      this.logger.verbose(`Bill "${bill.description}" deleted`);

      return { bill };
    } catch (err) {
      this.logger.error(`Bill not founded by Id: ${id}`);
      throw new InternalServerErrorException(`Bill not founded by Id: ${id}`);
    };
  };
};


