import mongoose from 'mongoose';

const DataEntrySchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  timestamp: { type: Number, required: true },
  magnitude: { type: Number, required: true },
  level: { type: Number, required: true, index: true }, // index: true để truy vấn nhanh
  alarm: { type: Boolean, required: true },
  rssi: { type: Number },
  linear: {
    x: Number,
    y: Number,
    z: Number,
  },
  raw: {
    x: Number,
    y: Number,
    z: Number,
  },

  read: {
    type: Boolean,
    default: false,
  }

}, {
  timestamps: { createdAt: 'receivedAt' }
});

export const DataEntry =  mongoose.model('DataEntry', DataEntrySchema);