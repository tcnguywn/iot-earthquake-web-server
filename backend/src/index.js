import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import connectToDB from './lib/db.js';

// Tải biến môi trường
config();

// Import các bộ định tuyến (routes)
import dataRoute from "./routes/data.route.js";
import userRoute from "./routes/user.route.js";
import deviceRoute from "./routes/device.route.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors());
app.use(express.json());

// === CÁC ROUTE CÔNG KHAI (Public) ===
// Endpoint này KHÔNG cần Clerk, vì ESP32 không thể đăng nhập
// Nó sẽ có logic bảo mật riêng (kiểm tra deviceId)
app.use('/api/data', dataRoute);

// === CÁC ROUTE BẢO VỆ (Protected) ===
app.use(clerkMiddleware());

app.use('/api/devices', deviceRoute);
app.use('/api/user', userRoute);
// Thêm các route khác cho người dùng ở đây (ví dụ: /api/stats)

// Route chào mừng
app.get('/', (req, res) => {
  res.send('Earthquake Backend đang chạy tại port : ' + 5001);
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy endpoint' });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error("Lỗi:", err.message);
  res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  connectToDB();
});