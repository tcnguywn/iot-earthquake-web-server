import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
    type: String,
    required: [true, 'Vui lòng cung cấp email'],
    unique: true,
  },
  // password: {
  //   type: String,
  //   required: [true, 'Vui lòng cung cấp mật khẩu'],
  // },
  telegramChatId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);