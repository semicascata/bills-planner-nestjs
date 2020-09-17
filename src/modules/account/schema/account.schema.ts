import * as mongoose from 'mongoose';

export const AccountSchema = new mongoose.Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  bill: {
    type: Number,
    required: [true, 'please, insert a bill'],
  },

  description: {
    type: String,
    // unique: true,
    max: 100,
    required: [true, 'please, insert a description'],
  },

  credited: {
    type: Boolean,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
