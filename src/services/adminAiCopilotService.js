/**
 * adminAiCopilotService.js
 * AI Trợ Lý Điều Hành Quản Trị Tavy Korea (Admin AI Copilot)
 * Tích hợp đa mô hình: Google Gemini API & Custom OpenAI/Gemini Endpoint
 * Có khả năng trả lời thông minh, phân tích dữ liệu kho/đơn hàng và thực thi công cụ trực tiếp
 */

import { scrapeKoreanHealthProduct } from './koreanHealthScraperCore.js';
import { scrapeProductMetadata } from './productScraperService.js';
import { translateKoreanHealthTitle, extractActiveIngredients, generateHealthUsageGuide } from '../utils/koreanHealthDictionary.js';

const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const OPENAI_BASE_URL = import.meta.env?.VITE_OPENAI_BASE_URL || 'http://localhost:20128/v1';
const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '';
const OPENAI_MODEL = import.meta.env?.VITE_OPENAI_MODEL || 'ag/gemini-3.6-flash-medium';

/**
 * Gửi tin nhắn đến AI Admin Copilot kèm ngữ cảnh hệ thống hiện tại
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
  if (!cleanMsg) return { role: 'assistant', content: 'Tôi có thể giúp gì cho bạn trong việc quản lý đơn hàng, sản phẩm hoặc cào dữ liệu?' };

  // 1. Kiểm tra nếu có yêu cầu cào dữ liệu nhanh từ link
  const urlMatch = cleanMsg.match(/https?:\/\/[^\s]+/i);
  if (urlMatch && (cleanMsg.toLowerCase().includes('cào') || cleanMsg.toLowerCase().includes('lấy') || cleanMsg.toLowerCase().includes('scrape') || cleanMsg.toLowerCase().includes('tìm'))) {
    const targetUrl = urlMatch[0];
    try {
      if (/kgc|nhmall|nonghyup|naver|smartstore|brand\.naver|health/i.test(targetUrl)) {
        const scraped = await scrapeKoreanHealthProduct(targetUrl);
        return {
          role: 'assistant',
          content: `🌿 **Đã bóc tách thành công sản phẩm Sâm Nấm / TPCN từ Hàn Quốc!**\n\n- **Tên:** ${scraped.name}\n- **Thương hiệu:** ${scraped.brand}\n- **Giá Won:** ${scraped.foreignPrice.toLocaleString('vi-VN')} ₩ (~ ${Math.round(scraped.foreignPrice * (contextData.rates?.KRW?.rate || 19.5) * 1.05).toLocaleString('vi-VN')} đ)\n- **Đánh giá:** ${scraped.rating}★ (${scraped.reviewsCount} reviews)\n- **Hoạt chất chính:** ${(scraped.activeIngredients || []).join(', ')}\n- **Công dụng:** ${scraped.description}\n\nBạn có muốn tôi thêm sản phẩm này vào kho hàng Live không?`,
          action: {
            type: 'IMPORT_HEALTH_PRODUCT',
            product: scraped
          }
        };
      } else {
        const res = await scrapeProductMetadata(targetUrl);
        if (res.success && res.product) {
          return {
            role: 'assistant',
            content: `✨ **Đã bóc tách thành công sản phẩm từ Olive Young!**\n\n- **Mã SP:** ${res.product.goodsNo}\n- **Tên:** ${res.product.name}\n- **Thương hiệu:** ${res.product.brand}\n- **Giá Won:** ${res.product.foreignPrice.toLocaleString('vi-VN')} ₩ (~ ${Math.round(res.product.foreignPrice * (contextData.rates?.KRW?.rate || 19.5) * 1.05).toLocaleString('vi-VN')} đ)\n- **Đánh giá:** ${res.product.rating}★ (${res.product.reviewsCount} reviews)`,
            action: {
              type: 'IMPORT_PRODUCT',
              product: res.product
            }
          };
        }
      }
    } catch (err) {
      console.warn('Lỗi cào sản phẩm qua Copilot:', err);
    }
  }

  // 2. Chuẩn bị ngữ cảnh cho AI System Prompt
  const totalOrders = contextData.orders?.length || 0;
  const pendingQuotes = contextData.urgentQueue?.needQuote?.length || 0;
  const needPurchasing = contextData.urgentQueue?.needPurchase?.length || 0;
  const currentKrwRate = contextData.rates?.KRW?.rate || 19.5;
  const totalLiveProducts = contextData.products?.length || 0;

  const systemPrompt = `Bạn là "Tavy AI Admin Copilot" - Trợ lý AI cao cấp chuyên pair-programming, quản trị và vận hành sàn thương mại điện tử Order Hàng Hàn Quốc (Tavy Korea).

NGỮ CẢNH HỆ THỐNG HIỆN TẠI:
- Tỷ giá KRW/VND: 1 KRW = ${currentKrwRate} VNĐ (Phí dịch vụ: ${contextData.rates?.serviceFeePercent || 5}%)
- Tổng số đơn hàng: ${totalOrders} đơn
- Đơn hàng cần báo giá ngay: ${pendingQuotes} đơn
- Đơn hàng đã cọc/thanh toán cần mua ngay tại Hàn: ${needPurchasing} đơn
- Số lượng sản phẩm trong kho Live: ${totalLiveProducts} sản phẩm

NHIỆM VỤ & KHẢ NĂNG CỦA BẠN:
1. Trả lời chi tiết, chính xác, thân thiện bằng Tiếng Việt về cách quản lý đơn hàng, quy trình mua hàng tại Hàn Quốc.
2. Hỗ trợ dịch thuật chuyên ngành Dược/Mỹ phẩm Hàn - Việt chuẩn xác, giải thích hoạt chất (Ginsenoside, Probiotics CFU, Vitamin C, Collagen...).
3. Soạn tin nhắn phản hồi báo giá, thông báo tình trạng vận chuyển cho khách hàng qua Zalo/Facebook.
4. Gợi ý các thao tác quản trị nhanh (Cập nhật tỷ giá, cào sản phẩm từ Olive Young / Naver / KGC, duyệt đơn hàng).
5. Trả lời súc tích, định dạng markdown đẹp mắt, có gạch đầu dòng rõ ràng.`;

  // 3. Gọi AI qua OpenAI API hoặc Gemini
  if (OPENAI_API_KEY) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: cleanMsg }
      ];

      const res = await fetch(`${OPENAI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiReply = data?.choices?.[0]?.message?.content;
        if (aiReply) {
          return { role: 'assistant', content: aiReply.trim() };
        }
      }
    } catch (e) {
      console.warn('Lỗi gọi OpenAI Endpoint:', e.message);
    }
  }

  // Fallback sang Google Gemini API
  if (GEMINI_API_KEY) {
    try {
      const contents = [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nNgười dùng hỏi: ${cleanMsg}` }] }
      ];

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return { role: 'assistant', content: reply.trim() };
        }
      }
    } catch (e) {
      console.warn('Lỗi gọi Gemini API:', e.message);
    }
  }

  // Fallback thông minh cục bộ
  return {
    role: 'assistant',
    content: `🤖 **Tavy AI Admin Copilot Sẵn Sàng!**\n\nHiện tại hệ thống có **${pendingQuotes} đơn hàng chờ báo giá** và **${needPurchasing} đơn cần mua tại Hàn**. Tỷ giá hiện tại là **1 KRW = ${currentKrwRate} VNĐ**.\n\nBạn có thể dán link sản phẩm (Olive Young, Naver, KGC) để tôi cào dữ liệu ngay lập tức, hoặc yêu cầu soạn tin nhắn cho khách hàng!`
  };
}
