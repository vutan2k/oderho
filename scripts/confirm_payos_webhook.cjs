/**
 * Script tự động xác thực và đăng ký Webhook URL với PayOS
 * Sử dụng: node scripts/confirm_payos_webhook.cjs <WEBHOOK_URL>
 */
const path = require('path');
const dotenv = require('dotenv');

// Nạp biến môi trường từ functions/.env
dotenv.config({ path: path.join(__dirname, '../functions/.env') });

const { PayOS } = require('../functions/node_modules/@payos/node');

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

if (!clientId || !apiKey || !checksumKey) {
  console.error('❌ Thiếu biến môi trường trong functions/.env');
  process.exit(1);
}

const payos = new PayOS({ clientId, apiKey, checksumKey });

async function confirmWebhook(webhookUrl) {
  try {
    console.log(`📡 Đang gửi yêu cầu đăng ký Webhook tới PayOS với URL: ${webhookUrl}...`);
    const res = await payos.webhooks.confirm(webhookUrl);
    console.log('✅ XÁC THỰC WEBHOOK THÀNH CÔNG!');
    console.log('Phản hồi từ PayOS:', res);
  } catch (err) {
    console.error('❌ LỖI XÁC THỰC WEBHOOK:', err.message);
    if (err.message?.includes('not found') || err.message?.includes('status')) {
      console.log('💡 Lưu ý: PayOS yêu cầu URL webhook phải đang chạy thực tế trên Internet và phản hồi HTTP 200 trước khi xác nhận.');
    }
  }
}

const targetUrl = process.argv[2];
if (!targetUrl) {
  console.log('👉 Cách sử dụng: node scripts/confirm_payos_webhook.cjs https://dia-chi-webhook-cua-ban.com/payosWebhook');
  process.exit(1);
}

confirmWebhook(targetUrl);
