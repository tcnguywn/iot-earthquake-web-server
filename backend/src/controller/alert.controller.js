import { DataEntry } from '../models/dataEntry.model.js';
import { User } from '../models/user.model.js';
import { Device } from '../models/device.model.js';

// Helper: Lấy `user._id` từ `clerkId`
const getUserId = async (clerkId) => {
  const user = await User.findOne({ clerkId: clerkId });
  if (!user) throw new Error('Không tìm thấy người dùng');
  return user._id;
};

// Helper: Lấy danh sách `device._id` của user
const getUserDeviceIds = async (userId) => {
  const devices = await Device.find({ owner: userId }).select('_id');
  return devices.map(d => d._id);
};

/**
 * @controller getAllAlerts
 * @desc Lấy tất cả cảnh báo (level > 0) của user
 * @route GET /api/alerts
 */
export const getAllAlerts = async (req, res) => {
  try {
    const userId = await getUserId(req.auth.userId);
    const deviceIds = await getUserDeviceIds(userId);

    // Tìm DataEntry có level > 0 VÀ thuộc các thiết bị của user
    const alerts = await DataEntry.find({
      device: { $in: deviceIds },
      level: { $gt: 0 } // Lấy tất cả rung động (cấp 1, 2, 3)
    })
    .populate({
      path: 'device',
      model: 'Device',
      select: 'name location deviceId' // Lấy thông tin device
    })
    .sort({ receivedAt: -1 }); // Mới nhất lên đầu

    res.status(200).json(alerts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @controller getAlertStats
 * @desc Lấy thống kê cảnh báo
 * @route GET /api/alerts/stats
 */
export const getAlertStats = async (req, res) => {
  try {
    const userId = await getUserId(req.auth.userId);
    const deviceIds = await getUserDeviceIds(userId);

    const baseQuery = {
      device: { $in: deviceIds },
      level: { $gt: 0 }
    };

    // Đếm song song
    const [total, high, moderate, low, unread] = await Promise.all([
      DataEntry.countDocuments(baseQuery),
      DataEntry.countDocuments({ ...baseQuery, level: 3 }),
      DataEntry.countDocuments({ ...baseQuery, level: 2 }),
      DataEntry.countDocuments({ ...baseQuery, level: 1 }),
      DataEntry.countDocuments({ ...baseQuery, read: false }) // Đếm chưa đọc
    ]);

    res.status(200).json({
      totalAlerts: total,
      high: high,
      moderate: moderate,
      low: low,
      unreadCount: unread // Thêm số lượng chưa đọc
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @controller getRecentAlerts
 * @desc Lấy 5 cảnh báo mới nhất (level >= 2)
 * @route GET /api/alerts/recent
 */
export const getRecentAlerts = async (req, res) => {
  try {
    const userId = await getUserId(req.auth.userId);
    const deviceIds = await getUserDeviceIds(userId);

    const alerts = await DataEntry.find({
      device: { $in: deviceIds },
      level: { $gte: 2 } // Chỉ lấy rung động TB và Mạnh
    })
    .populate({ path: 'device', select: 'name location' })
    .sort({ receivedAt: -1 })
    .limit(5);

    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @controller markAlertAsRead
 * @desc Đánh dấu cảnh báo đã đọc
 * @route POST /api/alerts/:id/read
 */
export const markAlertAsRead = async (req, res) => {
  try {
    const { id } = req.params; // Đây là `_id` của DataEntry
    const userId = await getUserId(req.auth.userId);

    // Tìm DataEntry
    const alert = await DataEntry.findById(id).populate('device');

    // Xác thực: Cảnh báo này có thuộc user này không
    if (!alert || String(alert.device.owner) !== String(userId)) {
      return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
    }

    alert.read = true;
    await alert.save();

    res.status(200).json(alert);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};