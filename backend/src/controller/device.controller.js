import { Device } from '../models/device.model.js';
import { User } from '../models/user.model.js';
import { DataEntry } from '../models/dataEntry.model.js'; // Thêm import này
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
    if (!user) {
      // Nếu user chưa có trong CSDL (lần đầu đăng ký), tạo mới
      const clerkUser = await clerkClient.users.getUser(clerkId);
      user = await User.create({
        clerkId: clerkId,
        email: clerkUser.primaryEmailAddress?.emailAddress,
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
    const user = await User.findOne({ clerkId });

    if (!user) {
      // User đã login (Clerk) nhưng chưa có trong CSDL (chưa đăng ký thiết bị nào)
      return res.status(200).json([]);
    }

    const devices = await Device.find({ owner: user._id }).lean(); // Dùng .lean() để có object JS thuần

    // --- LOGIC TÍNH TOÁN STATUS ---
    const devicesWithStatus = devices.map(device => {
      const now = new Date();
      const lastSeen = device.lastSeen;
      let status = "offline";

      if (lastSeen) {
        // Thiết bị gửi mỗi 10s (khi bình thường).
        // Đặt timeout là 60s (60 * 1000 ms)
        const diffInMilliseconds = now.getTime() - lastSeen.getTime();
        if (diffInMilliseconds < 60000) {
          status = "online";
        }
      }

      return {
        ...device,
        status: status, // Trả về status đã tính toán
      };
    });
    // --- KẾT THÚC THÊM ---

    res.status(200).json(devicesWithStatus); // Trả về mảng mới

  } catch (error) {
    console.error("Lỗi lấy danh sách thiết bị:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

/**
 * @controller deleteDevice
 * @desc Xóa một thiết bị và tất cả dữ liệu liên quan
 * @route DELETE /api/devices/:deviceId
 * @access Private
 */
export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const clerkId = req.auth.userId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy người dùng' });
    }

    // Tìm thiết bị bằng deviceId (MAC) VÀ owner
    const device = await Device.findOne({ deviceId: deviceId, owner: user._id });

    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị hoặc bạn không có quyền' });
    }

    // 1. Xóa tất cả DataEntry liên quan
    await DataEntry.deleteMany({ device: device._id });

    // 2. Xóa thiết bị
    await Device.findByIdAndDelete(device._id);

    res.status(200).json({ message: 'Đã xóa thiết bị và dữ liệu liên quan' });

  } catch (error) {
    console.error("Lỗi xóa thiết bị:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};