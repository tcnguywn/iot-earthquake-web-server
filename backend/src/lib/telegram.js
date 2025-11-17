import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot;

if (token) {
  bot = new TelegramBot(token);
} else {
  console.warn('TELEGRAM_BOT_TOKEN is not set. Telegram alerts will be disabled.');
}

/**
 * Gửi tin nhắn cảnh báo qua Telegram
 * @param {string} chatId - ID của người nhận
 * @param {string} deviceName - Tên thiết bị
 * @param {string} location - Vị trí (từ device.location)
 * @param {number} level - Cấp độ rung (0-3)
 * @param {number} magnitude - Độ lớn (g)
 */
export async function sendTelegramAlert(chatId, deviceName, location, level, magnitude) { // <-- THÊM "location"
  if (!bot || !chatId) {
    console.log('Skipping Telegram alert (bot not configured or no chatId).');
    return;
  }

  let levelText = "NHẸ";
  let icon = "⚠️";
  if (level === 2) {
    levelText = "TRUNG BÌNH";
    icon = "🚨";
  }
  if (level === 3) {
    levelText = "MẠNH";
    icon = "🆘";
  }

  // Thêm dòng <b>Vị trí:</b>
  const message = `
${icon} <b>CẢNH BÁO RUNG CHẤN</b> ${icon}

<b>Thiết bị:</b> ${deviceName}
<b>Vị trí:</b> ${location || 'Không rõ vị trí'}
<b>Mức độ:</b> CẤP ${level} (${levelText})
<b>Độ lớn:</b> ${magnitude.toFixed(4)} g

Hãy kiểm tra và đảm bảo an toàn!
`;

    try {
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error(`Lỗi gửi tin nhắn Telegram tới ${chatId}:`, error.message);
    }
}