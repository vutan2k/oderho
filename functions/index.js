// Firebase Cloud Function: proxy Jina AI Reader + PayOS Webhook Auto Confirmation
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const PayOS = require('@payos/node');

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Khởi tạo PayOS SDK với biến môi trường
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID || 'dummy_client_id',
  process.env.PAYOS_API_KEY || 'dummy_api_key',
  process.env.PAYOS_CHECKSUM_KEY || 'dummy_checksum_key'
);

exports.scrapeJina = onRequest({ cors: true }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return res.status(204).send('');
  }
  try {
    const url = (req.query.url || (req.body && req.body.url) || '').toString().trim();
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: 'URL không hợp lệ' });
    }
    const jinaUrl = `https://r.jina.ai/${url}`;
    const jinaKey = process.env.JINA_API_KEY || '';
    const headers = { 'Accept': 'text/markdown' };
    if (jinaKey) headers['Authorization'] = `Bearer ${jinaKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const r = await fetch(jinaUrl, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (!r.ok) return res.status(r.status).json({ error: `Jina lỗi ${r.status}` });
      const text = await r.text();
      if (!text || text.length < 200) return res.status(502).json({ error: 'Jina trả nội dung rỗng hoặc bị chặn' });
      return res.json({ success: true, content: text });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Lỗi proxy Jina' });
  }
});

/**
 * Endpoint 1: Tạo Payment Link PayOS VietQR Động
 */
exports.createPayOSPaymentLink = onRequest({ cors: true }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return res.status(204).send('');
  }

  try {
    const { orderId, amount } = req.body || {};
    if (!orderId || !amount) {
      return res.status(400).json({ success: false, error: 'Thiếu orderId hoặc amount' });
    }

    // Chuyển orderId chuỗi (VD: ORD-509218) sang số duy nhất cho PayOS
    const numericPart = parseInt(orderId.replace(/\D/g, ''), 10) || Math.floor(Date.now() / 1000);
    const orderCode = Number(numericPart);

    const body = {
      orderCode: orderCode,
      amount: Number(amount),
      description: `Coc ${orderId.slice(0, 15)}`,
      returnUrl: `https://tavyorder.web.app/orders`,
      cancelUrl: `https://tavyorder.web.app/orders`,
    };

    const paymentLinkData = await payOS.createPaymentLink(body);
    return res.json({ success: true, data: paymentLinkData, orderCode });
  } catch (err) {
    console.error('Lỗi tạo PayOS Payment Link:', err);
    return res.status(500).json({ success: false, error: err.message || 'Lỗi kết nối cổng PayOS' });
  }
});

/**
 * Endpoint 2: PayOS Webhook - Tự động đối soát & xác nhận cọc 100% khi nhận tin chuyển khoản
 */
exports.payosWebhook = onRequest({ cors: true }, async (req, res) => {
  try {
    const webhookData = req.body;
    if (!webhookData) {
      return res.status(400).json({ success: false, message: 'Dữ liệu webhook rỗng' });
    }

    // Verify HMAC Signature chữ ký từ PayOS
    let verifiedData;
    try {
      verifiedData = payOS.verifyPaymentWebhookData(webhookData);
    } catch (err) {
      // Trong môi trường testing/local giả lập, nếu không có chữ ký thật thì ghi nhận cảnh báo
      if (process.env.NODE_ENV === 'test' || process.env.FUNCTIONS_EMULATOR) {
        console.warn('⚠️ [Test Mode] Bỏ qua xác thực chữ ký PayOS Webhook:', err.message);
        verifiedData = webhookData.data || webhookData;
      } else {
        console.error('❌ Chữ ký PayOS Webhook không hợp lệ:', err);
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    if (verifiedData && verifiedData.orderCode) {
      const orderCodeNum = Number(verifiedData.orderCode);
      const searchId = `ORD-${orderCodeNum}`;

      console.log(`⚡ [PayOS Webhook] Nhận xác nhận thanh toán cho đơn hàng ${searchId} (orderCode: ${orderCodeNum}), số tiền: ${verifiedData.amount} đ`);

      // Tìm kiếm đơn hàng trong Firestore DB theo Document ID hoặc orderCode/id field
      let orderDocRef = db.collection('orders').doc(searchId);
      let orderSnap = await orderDocRef.get();

      if (!orderSnap.exists) {
        // Tìm kiếm query nếu ID không trùng tuyệt đối hoặc query theo orderCode
        let querySnap = await db.collection('orders').where('orderCode', '==', orderCodeNum).limit(1).get();
        if (querySnap.empty) {
          querySnap = await db.collection('orders').where('id', '==', searchId).limit(1).get();
        }
        if (!querySnap.empty) {
          orderDocRef = querySnap.docs[0].ref;
          orderSnap = querySnap.docs[0];
        }
      }

      if (orderSnap.exists) {
        await orderDocRef.update({
          status: 'deposit_paid', // Tự động đổi trạng thái sang "Đã cọc 100%"
          paymentStatus: 'paid',   // Đã thanh toán
          paidAmountVnd: verifiedData.amount,
          paidAt: new Date().toISOString(),
          payosTransactionRef: verifiedData.reference || '',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ [PayOS Webhook] Đã cập nhật đơn hàng ${searchId} sang 'Đã cọc 100%' thành công!`);
        return res.json({ success: true, message: 'Đã xác nhận đơn hàng thành công' });
      } else {
        console.warn(`⚠️ [PayOS Webhook] Không tìm thấy đơn hàng ${searchId} trong Database`);
      }
    }

    return res.json({ success: true, message: 'Webhook đã ghi nhận' });
  } catch (err) {
    console.error('❌ Lỗi xử lý PayOS Webhook:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

