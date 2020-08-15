import * as mongoose from 'mongoose';

export const WalletSchema = new mongoose.Schema({
  // _user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },

  wallet: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
