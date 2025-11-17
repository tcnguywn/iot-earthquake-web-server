import { User } from '../models/user.model.js';
import { clerkClient } from '@clerk/express';

/**
 * @controller syncUser
 * @desc Đồng bộ (hoặc tạo) user từ Clerk vào CSDL
 * @route POST /api/user/sync
 * @access Private
 */
export const syncUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    let user = await User.findOne({ clerkId });

    if (user) {
      // Người dùng đã tồn tại
      return res.status(200).json({ message: 'Người dùng đã đồng bộ', user });
    }

    // Nếu user chưa có trong CSDL, tạo mới
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const newUser = await User.create({
      clerkId: clerkId,
      email: clerkUser.primaryEmailAddress?.emailAddress,
    });

    res.status(201).json({ message: 'Tạo người dùng mới thành công', user: newUser });
  } catch (error) {
    console.error("Lỗi đồng bộ user:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

/**
 * @controller updateTelegramId
 * @desc Cập nhật Telegram Chat ID cho người dùng
 * @route PUT /api/user/telegram
 * @access Private
 */
export const updateTelegramId = async (req, res) => {
  try {
    const { telegramChatId } = req.body;
    const clerkId = req.auth.userId;

    if (!telegramChatId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp telegramChatId' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { telegramChatId },
      { new: true, upsert: true } // 'upsert: true' sẽ tạo user nếu họ chưa tồn tại (giống sync)
    );

    res.status(200).json({ message: 'Cập nhật Telegram ID thành công', user: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật Telegram ID:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

/**
 * @controller getUserProfile
 * @desc Lấy thông tin user (hoặc đồng bộ nếu chưa có)
 * @route GET /api/user
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Nếu user chưa có trong CSDL, gọi hàm syncUser để tạo
      return syncUser(req, res);
    }

    // Nếu user đã tồn tại, trả về
    res.status(200).json(user);

  } catch (error) {
    console.error("Lỗi lấy hồ sơ user:", error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};