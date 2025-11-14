import express from 'express';
import { registerDevice, getUserDevices } from '../controller/device.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


// POST /api/devices/register
router.post('/register', protectRoute, registerDevice);

// GET /api/devices/
router.get('/', protectRoute, getUserDevices);

export default router;