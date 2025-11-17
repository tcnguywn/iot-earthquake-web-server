import express from 'express';
// Sửa dòng import
import { registerDevice, getUserDevices, deleteDevice } from '../controller/device.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


// POST /api/devices/register
router.post('/register', protectRoute, registerDevice);

// GET /api/devices/
router.get('/', protectRoute, getUserDevices);

// DELETE /api/devices/:deviceId
router.delete('/:deviceId', protectRoute, deleteDevice);

export default router;