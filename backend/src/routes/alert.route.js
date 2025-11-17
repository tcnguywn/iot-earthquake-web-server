import express from 'express';
import {
  getAllAlerts,
  getAlertStats,
  markAlertAsRead,
  getRecentAlerts
} from '../controller/alert.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả đều được bảo vệ
router.use(protectRoute);

// GET /api/alerts (Cho trang AlertsPage)
router.get('/', getAllAlerts);

// GET /api/alerts/stats (Cho trang AlertsPage và Navbar)
router.get('/stats', getAlertStats);

// GET /api/alerts/recent (Cho trang Dashboard)
router.get('/recent', getRecentAlerts);

// POST /api/alerts/:id/read (Đánh dấu đã đọc)
router.post('/:id/read', markAlertAsRead);

export default router;