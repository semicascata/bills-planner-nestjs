import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from './interface/user.interface';
import { CreditDto } from './dto/credit.dto';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  // fetch users
  async fetchUsers(): Promise<IUser[]> {
    try {
      const users = await this.userModel.find();
      this.logger.verbose('Fetching users');
      return users;
    } catch (err) {
      this.logger.error(`Failed fetching users> ${err.message}`);
      throw new InternalServerErrorException(err.message);
    }
  }

  // delete user
  async deleteUser(id: string): Promise<any> {
    const foundUser = await this.userModel.findOne({ _id: id });

    try {
      await this.userModel.deleteOne({ _id: foundUser.id });
      this.logger.verbose(`User "${foundUser.username}" deleted`);
      return {
        message: 'User deleted',
        user: foundUser,
      };
    } catch (err) {
      this.logger.error(`No user found by Id "${id}"`);
      throw new InternalServerErrorException(`No user found by Id "${id}"`);
    }
  }

  // add money to wallet
  async fatWallet(id: string, user: IUser, creditDto: CreditDto): Promise<any> {
    const { credit } = creditDto;

    try {
      const userWallet = await this.userModel.findOne({ _id: user.id });

      userWallet['wallet'] = userWallet.wallet + credit;
      userWallet.save();

      this.logger.verbose(
        `User: "${user.username}", wallet credit: ${user.wallet + credit}`,
      );

      return {
        userAccount: user.username,
        wallet: `${user.wallet + credit}`,
      };
    } catch (err) {
      this.logger.error(
        `Failed to update wallet for user Id of "${id}", ${err.message}"`,
      );
      throw new InternalServerErrorException(
        `Failed to update wallet for user Id of "${id}", ${err.message}"`,
      );
    }
  }
}
