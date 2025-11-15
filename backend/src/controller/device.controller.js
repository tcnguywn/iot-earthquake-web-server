import { Device } from '../models/device.model.js';
import { User } from '../models/user.model.js';
import { clerkClient } from '@clerk/express';

/**
 * @controller registerDevice
 * @desc Đăng ký một thiết bị mới cho người dùng đang đăng nhập
 * @route POST /api/devices/register
 * @access Private
 */
export const registerDevice = async (req, res) => {
  try {
    const { deviceId, name, location } = req.body;
    const clerkId = req.auth.userId; // Lấy từ middleware Clerk

    if (!deviceId || !name) {
      return res.status(400).json({ message: 'Vui lòng cung cấp deviceId (MAC Address) và Tên thiết bị' });
    }

    // 1. Kiểm tra xem thiết bị này đã được đăng ký bởi ai khác chưa
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(409).json({ message: 'Thiết bị này đã được đăng ký bởi một tài khoản khác' });
    }

    // 2. Tìm hoặc tạo User trong CSDL của chúng ta
    let user = await User.findOne({ clerkId });
    console.log("registerDevice: user:", user);
    if (!user) {
      // Nếu user chưa có trong CSDL (lần đầu đăng ký), tạo mới
      const clerkUser = await clerkClient.users.getUser(clerkId);
      user = await User.create({
        clerkId: clerkId,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        // Ban đầu telegramChatId là null, user phải cập nhật sau
      });
    }

    // 3. Tạo thiết bị mới và gán owner
    const newDevice = await Device.create({
      deviceId,
      name,
      location: location || '',
      owner: user._id
    });

    res.status(201).json({ message: 'Đăng ký thiết bị thành công', device: newDevice });

  } catch (error) {
    console.error("Lỗi đăng ký thiết bị:", error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký thiết bị' });
  }
};

/**
 * @controller getUserDevices
 * @desc Lấy tất cả các thiết bị của người dùng đang đăng nhập
 * @route GET /api/devices
 * @access Private
 */
export const getUserDevices = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    console.log("getUserDevices: clerkId:", clerkId);
    const user = await User.findOne({ clerkId });
    console.log("getUserDevices: user:", user);
    if (!user) {
      // User đã login (Clerk) nhưng chưa có trong CSDL (chưa đăng ký thiết bị nào)
      return res.status(200).json([]);
    }
    console.log("getUserDevices: user:", user._id);
    const devices = await Device.find({ owner: user._id });
    res.status(200).json(devices);

  } catch (error) {
    console.error("Lỗi lấy danh sách thiết bị:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};