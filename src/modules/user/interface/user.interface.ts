import { Document } from 'mongoose';

export interface IUser extends Document {
  readonly username: string;
  readonly email: string;
  password: string;
  role: Role;
  wallet: number;
  readonly created_at: Date;
}

export enum Role {
  admin = 'admin',
  user = 'user',
}
