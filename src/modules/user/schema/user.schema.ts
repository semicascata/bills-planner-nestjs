import * as mongoose from 'mongoose';
import { IUser } from '../interface/user.interface';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

export const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username cannot be empty'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'email cannot be empty'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'password cannot be empty'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  wallet: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  _bills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
  ],
});

UserSchema.pre<IUser>('save', async function(next) {
  // argon2 salt
  const salt = randomBytes(32);

  // only hash password if it has been modified or new
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await argon2.hash(this.password, { salt });
});
