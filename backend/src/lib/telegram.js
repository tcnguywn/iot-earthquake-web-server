import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot;

if (token) {
  // We initialize the bot here, but we don't need it to poll for updates
  // because we are only using it to *send* messages.
  bot = new TelegramBot(token);
} else {
  console.warn('TELEGRAM_BOT_TOKEN is not set. Telegram alerts will be disabled.');
}

/**
 * Gửi tin nhắn cảnh báo qua Telegram
 * @param {string} chatId - ID của người nhận
 * @param {string} deviceName - Tên thiết bị (ví dụ: "Phòng khách")
 * @param {number} level - Cấp độ rung (0-3)
 * @param {number} magnitude - Độ lớn (g)
 */
export async function sendTelegramAlert(chatId, deviceName, level, magnitude) {
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

 const message = `
${icon} <b>CẢNH BÁO RUNG CHẤN</b> ${icon}

<b>Thiết bị:</b> ${deviceName}<br>
<b>Mức độ:</b> CẤP ${level} (${levelText})<br>
<b>Độ lớn:</b> ${magnitude.toFixed(4)} g<br><br>

Hãy kiểm tra và đảm bảo an toàn!
`;

    try {
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error(`Lỗi gửi tin nhắn Telegram tới ${chatId}:`, error.message);
    }

}