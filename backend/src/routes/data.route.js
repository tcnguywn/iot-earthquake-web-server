import express from 'express';
import { logEarthquakeData } from '../controller/data.controller.js';

const router = express.Router();

// POST /api/data/
// Đây là endpoint công khai cho ESP32
router.post('/', logEarthquakeData);

export default router;