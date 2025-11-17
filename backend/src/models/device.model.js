import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  // Đây là MAC address từ ESP32
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Vui lòng đặt tên cho thiết bị'],
  },
  location: {
    type: String,
  },
  // Liên kết thiết bị này với một người dùng
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // --- CÁC TRƯỜNG ĐƯỢC THÊM ---
  lastSeen: {
    type: Date,
    default: null,
  },
  lastMagnitude: {
    type: Number,
    default: 0,
  },
  lastRssi: {
    type: Number,
    default: 0,
  }

}, { timestamps: true });

export const Device = mongoose.model('Device', DeviceSchema);