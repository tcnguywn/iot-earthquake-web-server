import express from 'express';
// Sửa dòng import
import { syncUser, updateTelegramId, getUserProfile } from '../controller/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả các route đều được bảo vệ
router.use(protectRoute);

// GET /api/user
router.get('/', getUserProfile);

// POST /api/user/sync
// (Dùng để user tự đồng bộ khi đăng nhập lần đầu)
router.post('/sync', syncUser);

// PUT /api/user/telegram
// (Dùng để user cập nhật Telegram ID của họ)
router.put('/telegram', updateTelegramId);

export default router;