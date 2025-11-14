import { Device } from '../models/device.model.js';
import { DataEntry } from '../models/dataEntry.model.js';
import { User } from '../models/user.model.js'; // Cần import User để populate
import { sendTelegramAlert } from '../lib/telegram.js';

/**
 * @controller logEarthquakeData
 * @desc Nhận và ghi log dữ liệu từ ESP32
 * @route POST /api/data
 * @access Public
 */
export const logEarthquakeData = async (req, res) => {
  const { device_id, ...data } = req.body;

  // 1. Kiểm tra dữ liệu đầu vào
  if (!device_id || data.magnitude == null || data.level == null) {
    console.log("Request bị từ chối: thiếu device_id hoặc dữ liệu", req.body);
    return res.status(400).json({ message: 'Thiếu trường device_id hoặc dữ liệu' });
  }

  try {
    // 2. Tìm thiết bị VÀ lấy thông tin owner (bao gồm telegramChatId)
    // Dùng populate để lấy thông tin từ collection 'User'
    const device = await Device.findOne({ deviceId: device_id }).populate({
      path: 'owner',
      model: 'User',
      select: 'telegramChatId' // Chỉ lấy trường telegramChatId
    });

    // 3. Bảo mật: Nếu không tìm thấy thiết bị, từ chối
    if (!device) {
      console.log(`Request bị từ chối: không tìm thấy thiết bị ${device_id}`);
      return res.status(401).json({ message: 'Thiết bị không hợp lệ hoặc chưa được đăng ký' });
    }

    // 4. Lưu dữ liệu vào CSDL
    await DataEntry.create({
      device: device._id,
      timestamp: data.timestamp,
      magnitude: data.magnitude,
      level: data.level,
      alarm: data.alarm,
      rssi: data.rssi,
      linear: data.linear,
      raw: data.raw,
    });

    // 5. Gửi thông báo Telegram nếu có rung chấn (ví dụ: cấp 2 trở lên)
    if (data.level >= 2 && device.owner && device.owner.telegramChatId) {
      // Chạy bất đồng bộ, không cần chờ
      await sendTelegramAlert(
          device.owner.telegramChatId,
          device.name,
          data.level,
          data.magnitude
      );
    }

    // 6. Phản hồi thành công cho ESP32
    return res.status(201).json({ message: 'Đã ghi nhận dữ liệu' });

  } catch (error) {
    console.error('Lỗi xử lý dữ liệu:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};