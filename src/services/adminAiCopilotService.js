/**
 * adminAiCopilotService.js
 * SIÊU TRỢ LÝ ĐIỀU HÀNH & TỰ ĐỘNG HÓA QUẢN TRỊ (TAVY AI ADMIN COPILOT PRO)
 * Tích hợp đa tầng: Live AI Connection + CSDL Dược Điển Hàn Quốc + Bộ máy Phân tích Doanh số & Quản trị Kho Đơn hàng
 */

import { scrapeKoreanHealthProduct, VERIFIED_KOREAN_HEALTH_CATALOG } from './koreanHealthScraperCore.js';
import { scrapeProductMetadata } from './productScraperService.js';
import {
  translateKoreanHealthTitle,
  extractActiveIngredients,
  generateHealthUsageGuide,
  categorizeHealthProduct
} from '../utils/koreanHealthDictionary.js';
import { getOrderTotalVnd } from '../utils/priceCalculator.js';

const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const OPENAI_BASE_URL = import.meta.env?.VITE_OPENAI_BASE_URL || 'http://localhost:20128/v1';
const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '';
const OPENAI_MODEL = import.meta.env?.VITE_OPENAI_MODEL || 'ag/gemini-3.6-flash-medium';

/**
 * Xử lý thông minh & phản hồi theo từng tác vụ điều hành cụ thể
 */
export async function sendAdminCopilotMessage({
  userMessage = '',
  chatHistory = [],
  contextData = {
    orders: [],
    products: [],
    pendingProducts: [],
    rates: { KRW: { rate: 19.5 }, serviceFeePercent: 5 },
    urgentQueue: { needQuote: [], needPurchase: [] }
  }
}) {
  const cleanMsg = String(userMessage || '').trim();
  if (!cleanMsg) {
    return {
      role: 'assistant',
      content: 'Chào bạn! Tôi là Tavy AI Admin Copilot Pro. Hãy cho tôi biết bạn cần hỗ trợ gì: Quản lý đơn hàng, cào dữ liệu Naver/KGC, cập nhật tỷ giá hay viết bài quảng cáo?'
    };
  }

  const lowerMsg = cleanMsg.toLowerCase();
  const krwRate = contextData.rates?.KRW?.rate || 19.5;
  const serviceFee = contextData.rates?.serviceFeePercent || 5;
  const orders = contextData.orders || [];
  const products = contextData.products || [];

  // ════════════════════════════════════════════════════════════════
  // 1. TÁC VỤ 1: CÀO SẢN PHẨM TỰ ĐỘNG TỪ LINK (SCRAPING AGENT)
  // ════════════════════════════════════════════════════════════════
  const urlMatch = cleanMsg.match(/https?:\/\/[^\s]+/i);
  if (urlMatch || lowerMsg.includes('cào') || lowerMsg.includes('scrape') || lowerMsg.includes('lấy ảnh')) {
    const targetUrl = urlMatch ? urlMatch[0] : cleanMsg;
    try {
      if (/kgc|nhmall|nonghyup|naver|smartstore|brand\.naver|health|ginseng|홍삼|유산균|비타민/i.test(targetUrl)) {
        const scraped = await scrapeKoreanHealthProduct(targetUrl);
        const estVnd = Math.round(scraped.foreignPrice * krwRate * (1 + serviceFee / 100));
        return {
          role: 'assistant',
          content: `🌿 **BÁO CÁO BÓC TÁCH DƯỢC LIỆU & TPCN HÀN QUỐC**\n\n- **Tên SP:** ${scraped.name}\n- **Tên gốc Hàn:** \`${scraped.koreanTitle || 'N/A'}\`\n- **Thương hiệu:** **${scraped.brand}** (Nguồn: ${scraped.source})\n- **Giá gốc Hàn:** **${scraped.foreignPrice.toLocaleString('vi-VN')} ₩** (~ **${estVnd.toLocaleString('vi-VN')} VNĐ** tính theo tỷ giá ${krwRate})\n- **Đánh giá thật:** ⭐ **${scraped.rating}★** (${scraped.reviewsCount?.toLocaleString('vi-VN')} đánh giá người Hàn)\n- **Hoạt chất sinh học:** ${(scraped.activeIngredients || []).join(' | ')}\n- **Công dụng chính:** ${scraped.description}\n- **Liều lượng:** ${scraped.usage}\n\n👉 *Tôi đã sẵn sàng nút nạp sản phẩm vào kho bên dưới:*`,
          action: {
            type: 'IMPORT_HEALTH_PRODUCT',
            product: scraped,
            label: `+ Nhập "${scraped.name.slice(0, 35)}..." vào Kho Live`
          }
        };
      } else {
        const res = await scrapeProductMetadata(targetUrl);
        if (res.success && res.product) {
          const estVnd = Math.round(res.product.foreignPrice * krwRate * (1 + serviceFee / 100));
          return {
            role: 'assistant',
            content: `✨ **BÁO CÁO BÓC TÁCH MỸ PHẨM OLIVE YOUNG HÀN QUỐC**\n\n- **Mã sản phẩm:** \`${res.product.goodsNo}\`\n- **Tên SP:** ${res.product.name}\n- **Thương hiệu:** **${res.product.brand}**\n- **Giá bán Hàn:** **${res.product.foreignPrice.toLocaleString('vi-VN')} ₩** (~ **${estVnd.toLocaleString('vi-VN')} VNĐ**)\n- **Đánh giá:** ⭐ **${res.product.rating}★** (${res.product.reviewsCount?.toLocaleString('vi-VN')} reviews)\n- **Album ảnh:** Đã bóc tách ${res.product.images?.length || 1} ảnh sắc nét và ${res.product.photoReviews?.length || 0} ảnh review thật.`,
            action: {
              type: 'IMPORT_PRODUCT',
              product: res.product,
              label: `+ Nhập "${res.product.name.slice(0, 35)}..." vào Kho Live`
            }
          };
        }
      }
    } catch (err) {
      console.warn('Lỗi cào sản phẩm qua AI:', err);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 2. TÁC VỤ 2: CẬP NHẬT TỶ GIÁ WON & PHÍ DỊCH VỤ (RATE ENGINE)
  // ════════════════════════════════════════════════════════════════
  const rateMatch = cleanMsg.match(/(?:tỷ giá|đổi tỷ giá|won|krw|rate|set rate).*?([1-2][0-9](?:\.[0-9]{1,2})?|[0-9]{2,3})/i);
  if (rateMatch && (lowerMsg.includes('tỷ giá') || lowerMsg.includes('đổi') || lowerMsg.includes('cập nhật') || lowerMsg.includes('set'))) {
    const newRate = parseFloat(rateMatch[1]);
    if (newRate >= 10 && newRate <= 40) {
      return {
        role: 'assistant',
        content: `💱 **YÊU CẦU ĐIỀU CHỈNH TỶ GIÁ KRW / VNĐ**\n\n- **Tỷ giá hiện tại:** 1 KRW = **${krwRate} VNĐ**\n- **Tỷ giá mới đề xuất:** 1 KRW = **${newRate} VNĐ**\n- **Phí dịch vụ:** ${serviceFee}%\n\nVí dụ sản phẩm 50.000 ₩:\n- Giá cũ: ${(Math.round(50000 * krwRate * (1 + serviceFee / 100))).toLocaleString('vi-VN')} VNĐ\n- Giá mới: ${(Math.round(50000 * newRate * (1 + serviceFee / 100))).toLocaleString('vi-VN')} VNĐ (chênh lệch: ${(Math.round(50000 * (newRate - krwRate) * (1 + serviceFee / 100))).toLocaleString('vi-VN')} VNĐ)\n\n*Bấm nút bên dưới để áp dụng ngay toàn hệ thống:*`,
        action: {
          type: 'UPDATE_RATES',
          newRate: newRate,
          label: `⚡ Áp dụng Tỷ giá mới: 1 KRW = ${newRate} VNĐ`
        }
      };
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 3. TÁC VỤ 3: TÌM KIẾM & PHÂN TÍCH ĐƠN HÀNG (ORDER QUERY ENGINE)
  // ════════════════════════════════════════════════════════════════
  if (lowerMsg.includes('tìm đơn') || lowerMsg.includes('khách') || lowerMsg.includes('đơn hàng') || lowerMsg.includes('tra cứu') || lowerMsg.includes('chờ báo giá') || lowerMsg.includes('cần mua')) {
    const pendingQuotes = orders.filter(o => o.status === 'pending');
    const needPurchasing = orders.filter(o => o.status === 'deposit_paid' || o.status === 'paid');
    
    // Tìm theo số điện thoại hoặc mã đơn nếu có
    const phoneOrIdMatch = cleanMsg.match(/(?:0[0-9]{9}|[A-Z0-9_-]{5,20})/i);
    let matchedOrder = null;
    if (phoneOrIdMatch) {
      const keyword = phoneOrIdMatch[0].toLowerCase();
      matchedOrder = orders.find(o => 
        (o.id && o.id.toLowerCase().includes(keyword)) ||
        (o.customerPhone && o.customerPhone.includes(keyword)) ||
        (o.customerName && o.customerName.toLowerCase().includes(keyword))
      );
    }

    if (matchedOrder) {
      const totalVnd = getOrderTotalVnd(matchedOrder, krwRate, serviceFee);
      return {
        role: 'assistant',
        content: `📦 **KẾT QUẢ TRA CỨU ĐƠN HÀNG: #${matchedOrder.id}**\n\n- **Khách hàng:** **${matchedOrder.customerName || 'Khách vãng lai'}** (${matchedOrder.customerPhone || 'Chưa có SĐT'})\n- **Trạng thái:** \`${matchedOrder.status}\` | Thanh toán: \`${matchedOrder.paymentStatus || 'unpaid'}\`\n- **Địa chỉ nhận:** ${matchedOrder.customerAddress || 'Chưa cập nhật'}\n- **Tổng giá trị:** **${totalVnd.toLocaleString('vi-VN')} VNĐ**\n- **Sản phẩm (${matchedOrder.items?.length || 0} món):**\n${(matchedOrder.items || []).map((it, i) => `  ${i+1}. ${it.name} (x${it.quantity || 1}) - ${it.priceWon?.toLocaleString('vi-VN') || it.price?.toLocaleString('vi-VN') || 0} ₩`).join('\n')}`,
        action: {
          type: 'NAVIGATE_ORDER',
          orderId: matchedOrder.id,
          label: `🔍 Mở chi tiết đơn hàng #${matchedOrder.id}`
        }
      };
    }

    return {
      role: 'assistant',
      content: `📊 **TỔNG QUAN XỬ LÝ ĐƠN HÀNG HIỆN TẠI**\n\n- 🔴 **Cần Báo Giá Ngay:** **${pendingQuotes.length} đơn** (${pendingQuotes.map(o => `#${o.id}`).slice(0, 4).join(', ')}${pendingQuotes.length > 4 ? '...' : ''})\n- 🟡 **Đã Thanh Toán Cần Đặt Mua Tại Hàn:** **${needPurchasing.length} đơn**\n- 🟢 **Tổng số đơn trong hệ thống:** **${orders.length} đơn**\n\n💡 *Gợi ý thao tác:* Bạn có thể gõ "Báo giá đơn #ORD-..." hoặc nhập số điện thoại khách hàng để tôi tra cứu chi tiết!`
    };
  }

  // ════════════════════════════════════════════════════════════════
  // 4. TÁC VỤ 4: VIẾT BÀI MARKETING / CHĂM SÓC KHÁCH HÀNG (COPYWRITING)
  // ════════════════════════════════════════════════════════════════
  if (lowerMsg.includes('soạn') || lowerMsg.includes('viết bài') || lowerMsg.includes('quảng cáo') || lowerMsg.includes('zalo') || lowerMsg.includes('facebook') || lowerMsg.includes('tin nhắn')) {
    if (lowerMsg.includes('sâm') || lowerMsg.includes('kgc') || lowerMsg.includes('everytime')) {
      return {
        role: 'assistant',
        content: `✍️ **MẪU BÀI ĐĂNG FACEBOOK / ZALO QUẢNG CÁO CAO HỒNG SÂM KGC**\n\n👑 **[SÂM CHÍNH PHỦ HÀN QUỐC KGC] - BÍ QUYẾT NĂNG LƯỢNG & ĐỀ KHÁNG ĐỈNH CAO CHO NGƯỜI BẬN RỘN** 🌿\n\n✨ Bạn có biết vì sao hơn 80% người Hàn Quốc đều mang theo 1 gói *Everytime* mỗi ngày?\n\n🔥 **ĐIỂM NỔI BẬT KHÔNG THỂ BỎ QUA:**\n✔️ 100% Củ Hồng Sâm 6 năm tuổi cô đặc tinh khiết từ tập đoàn chính phủ KGC CheongKwanJang.\n✔️ Hàm lượng Ginsenoside cực cao (11.6mg/g) - Tăng miễn dịch, giảm căng thẳng stress và phục hồi thể lực cấp tốc.\n✔️ Thiết kế dạng stick xé uống liền siêu tiện lợi mọi lúc mọi nơi.\n\n💰 **Giá order trực tiếp từ Hàn:** Chỉ từ **830.000đ / hộp** (Cam kết 100% Bill chính hãng Naver / KGC Flagship Seoul).\n\n📦 *Giao hàng tận nơi toàn quốc - Đền gấp 10 nếu phát hiện hàng giả!*\n👉 Inbox ngay Tavy Korea để nhận ưu đãi vận chuyển tuần này nhé!\n\n#OrderHanQuoc #SamChinhPhu #KGC #Everytime #HongSamHanQuoc #TavyKorea`
      };
    } else {
      return {
        role: 'assistant',
        content: `💬 **MẪU TIN NHẮN ZALO / FACEBOOK BÁO GIÁ CHO KHÁCH HÀNG**\n\n"Dạ chào Anh/Chị ạ! Tavy Korea xin gửi thông tin báo giá chi tiết đơn hàng order từ Hàn Quốc của mình như sau:\n\n📦 **Chi tiết đơn hàng:**\n- Giá gốc sản phẩm tại Hàn: [Tên sản phẩm] - [Giá Won] ₩\n- Tỷ giá áp dụng: 1 KRW = ${krwRate} VNĐ\n- Phí dịch vụ mua hộ & bảo hiểm hàng hóa: ${serviceFee}%\n👉 **Tổng chi phí về tận tay Việt Nam:** [Tổng tiền] VNĐ\n\n⏱️ **Thời gian dự kiến nhận hàng:** 5 - 7 ngày làm việc kể từ khi mua tại Seoul.\n💳 Anh/Chị có thể chuyển khoản cọc qua tài khoản sau để bên em tiến hành mua ngay nhé:\n- Ngân hàng: [Tên Ngân Hàng]\n- Số TK: [Số Tài Khoản]\n- Chủ TK: [Tên Chủ TK]\n- Cú pháp: [Mã Đơn Hàng] - [SĐT]\n\nEm cảm ơn Anh/Chị đã tin tưởng Tavy Korea ạ! ❤️"`
      };
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 5. TÁC VỤ 5: PHÂN TÍCH DOANH THU & KINH DOANH (BUSINESS ANALYTICS)
  // ════════════════════════════════════════════════════════════════
  if (lowerMsg.includes('doanh thu') || lowerMsg.includes('kinh doanh') || lowerMsg.includes('phân tích') || lowerMsg.includes('lời khuyên') || lowerMsg.includes('chiến lược')) {
    let totalGmv = 0;
    orders.forEach(o => {
      totalGmv += getOrderTotalVnd(o, krwRate, serviceFee);
    });
    const avgOrderVal = orders.length > 0 ? Math.round(totalGmv / orders.length) : 0;

    return {
      role: 'assistant',
      content: `📈 **BÁO CÁO PHÂN TÍCH CHIẾN LƯỢC KINH DOANH TAVY KOREA**\n\n1. **Chỉ số Vận Hành:**\n   - Tổng doanh số (GMV): **${totalGmv.toLocaleString('vi-VN')} VNĐ**\n   - Giá trị trung bình/đơn (AOV): **${avgOrderVal.toLocaleString('vi-VN')} VNĐ**\n   - Tỷ lệ hoàn tất đơn: **${orders.filter(o => o.status === 'completed').length}/${orders.length || 1}**\n\n2. **Danh mục tiềm năng lợi nhuận cao nhất:**\n   - 🌿 **Sâm Nấm KGC & Nông Hiệp Nonghyup**: Biên độ lợi nhuận cao, khách hàng trung thành mua định kỳ làm quà biếu.\n   - 💊 **TPCN Quốc Dân (Lacto-Fit, Korea Eundan Vitamin C)**: Lượng mua số lượng lớn (Combo 3-6 tháng), tỷ lệ quay lại cực cao.\n\n3. **Lời khuyên hành động ngay:**\n   - Đẩy mạnh chương trình *"Mua Combo Men Vi Sinh Lacto-Fit + Vitamin C"* để tăng AOV lên trên 1.500.000đ.\n   - Giữ tỷ giá ở mức **19.5 - 20.0** để đảm bảo mức cạnh tranh tối đa so với thị trường xách tay.`
    };
  }

  // ════════════════════════════════════════════════════════════════
  // 6. GỌI GEMINI HOẶC MÔ HÌNH NGOÀI NẾU CÓ CÂU HỎI MỞ RỘNG
  // ════════════════════════════════════════════════════════════════
  if (OPENAI_API_KEY && !OPENAI_BASE_URL.includes('localhost')) {
    try {
      const res = await fetch(`${OPENAI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: 'Bạn là Tavy AI Admin Copilot Pro - Chuyên gia điều hành sàn thương mại điện tử Order Hàng Hàn Quốc. Trả lời sắc bén, thực tế, hỗ trợ tận tâm bằng tiếng Việt.' },
            { role: 'user', content: cleanMsg }
          ],
          temperature: 0.7
        })
      });
      if (res.ok) {
        const data = await res.json();
        const txt = data?.choices?.[0]?.message?.content;
        if (txt) return { role: 'assistant', content: txt.trim() };
      }
    } catch (e) {
      console.warn('Lỗi gọi OpenAI Endpoint:', e.message);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 7. PHẢN HỒI THÔNG MINH TỔNG QUAN NẾU KHÔNG THUỘC CÁC NHÓM TRÊN
  // ════════════════════════════════════════════════════════════════
  const topGinseng = VERIFIED_KOREAN_HEALTH_CATALOG.slice(0, 3);
  return {
    role: 'assistant',
    content: `🤖 **TAVY AI ADMIN COPILOT PRO — SẴN SÀNG HỖ TRỢ!**\n\nTôi đã được nâng cấp toàn diện để giúp bạn điều hành hệ thống:\n\n1. 🌿 **Bóc tách dữ liệu tức thì:** Dán link bất kỳ từ **Naver Brand Store**, **KGC**, **Nonghyup**, **Olive Young** để lấy ảnh HD và nạp vào kho 1-click.\n2. 📊 **Quản trị đơn hàng:** Kiểm tra danh sách ${orders.filter(o => o.status === 'pending').length} đơn chờ báo giá, ${orders.filter(o => o.status === 'deposit_paid' || o.status === 'paid').length} đơn cần mua tại Hàn.\n3. 💱 **Điều chỉnh tỷ giá:** Gõ *"Đổi tỷ giá sang 19.8"* để cập nhật giá tự động toàn hệ thống.\n4. ✍️ **Viết nội dung bán hàng:** Soạn tin nhắn Zalo báo giá, bài đăng Facebook thu hút khách hàng.\n\n*Hãy nhập bất kỳ câu hỏi hoặc dán link sản phẩm bên dưới!*`
  };
}
