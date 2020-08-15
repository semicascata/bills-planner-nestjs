import { Document } from 'mongoose';
import { IUser } from '../../user/interface/user.interface';

export interface IAccount extends Document {
  _user: IUser;
  bill: number;
  description: string;
  readonly created_at: Date;
}
