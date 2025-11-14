import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/user.model.js';
import { Device } from '../models/device.model.js';
import { DataEntry } from '../models/dataEntry.model.js';

config();

// Đây là code để "mồi" dữ liệu, thay cho việc bạn làm thủ công
// Chạy bằng: npm run seed

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Kết nối CSDL để seed...');

    // Xóa dữ liệu cũ
    await DataEntry.deleteMany({});
    await Device.deleteMany({});
    await User.deleteMany({});
    console.log('Đã xóa dữ liệu cũ.');

    // Tạo User mẫu
    // LƯU Ý: clerkId này là GIẢ.
    // Bạn cần lấy 1 clerkId THẬT từ dashboard Clerk
    // và telegramChatId THẬT từ @get_id_bot
    const mockClerkId = 'user_2abcdef...'; // THAY BẰNG CLERK ID THẬT
    const mockTelegramId = '123456789'; // THAY BẰNG TELEGRAM ID THẬT

    const user = await User.create({
      clerkId: mockClerkId,
      email: 'test@example.com',
      telegramChatId: mockTelegramId
    });
    console.log(`Đã tạo User mẫu: ${user.email}`);

    // Tạo Device mẫu
    // LƯU Ý: deviceId này là GIẢ.
    // Bạn cần dùng MAC Address THẬT của ESP32
    const mockDeviceId = 'AA:BB:CC:DD:EE:FF'; // THAY BẰNG MAC THẬT

    const device = await Device.create({
      deviceId: mockDeviceId,
      name: 'Thiết bị Test (Seed)',
      location: 'Văn phòng',
      owner: user._id
    });
    console.log(`Đã tạo Device mẫu: ${device.name}`);

    console.log('Seed dữ liệu thành công!');

  } catch (error) {
    console.error('Lỗi khi seed CSDL:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đóng kết nối CSDL.');
  }
};

seedDatabase();