/**
 * AI Scraper Agent Engine v5.0
 * Flow: Jina AI Reader (lấy nội dung thật, vượt WAF Olive Young)
 *       → Gemini AI (trích xuất JSON: tên Việt/Hàn, brand, phân loại, giá sale, ảnh thật)
 * KHÔNG tạo dữ liệu fake khi bị chặn.
 */

import { scrapeProductMetadata } from './productScraperService';

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Lấy API key từ env (build) hoặc localStorage (admin nhập) */
const getGeminiKey = () => {
  const envKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey) return envKey;
  try {
    return localStorage.getItem('tavy_gemini_api_key') || '';
  } catch {
    return '';
  }
};

/** Gọi Gemini trích xuất JSON từ nội dung trang Olive Young */
const aiExtractProduct = async (markdown, url) => {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  const prompt = `Bạn là chuyên gia mỹ phẩm Hàn Quốc. Dưới đây là nội dung thật (markdown) trang sản phẩm Olive Young.
Trích xuất JSON CHÍNH XÁC, TUYỆT ĐỐI KHÔNG bịa dữ liệu. Nếu không có thông tin, để trống.
{
  "name": "tên sản phẩm tiếng Việt đầy đủ (dịch từ tên Hàn)",
  "nameKr": "tên tiếng Hàn chính xác (từ Title)",
  "brand": "thương hiệu tiếng Việt",
  "brandKr": "thương hiệu tiếng Hàn",
  "category": "skincare|makeup|haircare|bodycare|health|pharmacy",
  "price": 27000,
  "image": "URL ảnh sản phẩm chính (bắt đầu bằng https://image.oliveyoung.co.kr, KHÔNG phải logo/menu/icon/quà tặng)",
  "description": "mô tả ngắn tiếng Việt"
}
Lưu ý giá: nếu có "~~X원~~ _Y%_" thì giá sale = X × (100-Y)/100, làm tròn. Ưu tiên giá sale.
Chỉ trả JSON thuần, không markdown, không giải thích.
URL: ${url}
Nội dung:
${markdown.slice(0, 15000)}`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end < 0) return null;
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!parsed.nameKr && !parsed.name) return null;
    return parsed;
  } catch (e) {
    console.warn('AI extract error:', e);
    return null;
  }
};

/** Tìm ảnh sản phẩm thật: ưu tiên alt "상품명" (tên sản phẩm), bỏ logo/menu */
const pickRealProductImage = (markdown) => {
  const imgRe = /!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)/g;
  const candidates = [];
  let m;
  while ((m = imgRe.exec(markdown)) !== null) {
    const alt = m[1] || '';
    const src = m[2] || '';
    if (!src.startsWith('https://image.oliveyoung.co.kr')) continue;
    if (/logo|menu|icon|banner|reviewProfile|thumbnail|crop/i.test(alt + src)) continue;
    candidates.push({ alt, src });
  }
  // 1. alt chứa "상품명" = ảnh sản phẩm chính
  const main = candidates.find(c => /상품명/.test(c.alt));
  if (main) return main.src;
  // 2. alt chứa tên sản phẩm (Hàn) & không phải quà tặng
  const named = candidates.find(c => /[가-힣]{2,}/.test(c.alt) && !/증정|기프트|카이/.test(c.alt));
  if (named) return named.src;
  // 3. ảnh đầu tiên dạng goods uploads (thumbnails)
  const goods = candidates.find(c => /thumbnails/.test(c.src));
  return goods ? goods.src : '';
};

/**
 * AI Scraper Agent: bóc tách sản phẩm Olive Young bằng AI
 * @param {string} url - Link sản phẩm
 * @returns {Promise<{success: boolean, product?: object, error?: string}>}
 */
export async function runAIScraperAgent(url) {
  try {
    if (!url || typeof url !== 'string') {
      return { success: false, error: 'URL không hợp lệ' };
    }
    const cleanUrl = url.trim();
    console.log(`🤖 AI Scraper Agent đang xử lý đường dẫn: ${cleanUrl}...`);

    // 1. Cache đã verify trước
    const cached = await scrapeProductMetadata(cleanUrl);
    if (cached.success && cached.product) {
      return { success: true, product: cached.product };
    }

    // 2. Jina AI Reader đọc nội dung thật (vượt WAF Olive Young)
    let markdown = '';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
        signal: controller.signal,
        headers: { 'Accept': 'text/markdown', 'X-Return-Format': 'markdown' }
      });
      clearTimeout(timeout);
      if (jinaRes.ok) markdown = await jinaRes.text();
    } catch (e) {
      console.warn('Jina fetch error:', e);
    }
    if (!markdown || markdown.length < 300) {
      return {
        success: false,
        needsManualCapture: true,
        error: 'Olive Young chặn bóc tách. Hãy mở trang sản phẩm và dùng Chrome Extension TAVY (đã cài) để lấy ảnh/tên thật, hoặc nhập thủ công.'
      };
    }

    // 3. Gemini AI trích xuất + dịch + phân loại + giá sale + ảnh thật
    const ai = await aiExtractProduct(markdown, cleanUrl);
    if (!ai || !ai.nameKr) {
      return {
        success: false,
        needsManualCapture: true,
        error: 'AI không trích xuất được dữ liệu chính xác từ link này. Dùng Chrome Extension hoặc nhập thủ công.'
      };
    }

    const image = ai.image || pickRealProductImage(markdown);
    if (!image) {
      return {
        success: false,
        needsManualCapture: true,
        error: 'Không tìm thấy ảnh sản phẩm thật. Dùng Chrome Extension hoặc nhập ảnh thủ công.'
      };
    }

    const goodsNoMatch = cleanUrl.match(/goodsNo=([A-Z0-9]+)/i);
    const product = {
      goodsNo: goodsNoMatch ? goodsNoMatch[1].toUpperCase() : `SP-${Date.now()}`,
      name: ai.name || ai.nameKr,
      nameKr: ai.nameKr,
      brand: ai.brand || 'Olive Young',
      brandKr: ai.brandKr || ai.brand || '올리브영',
      category: ai.category || 'skincare',
      foreignPrice: Number(ai.price) || 0,
      productImage: image,
      description: ai.description || `Sản phẩm Olive Young Korea. Tên gốc: ${ai.nameKr}`,
      origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 4.9,
      productUrl: cleanUrl,
      reviewsCount: 0,
      scrapedAt: new Date().toISOString(),
      source: 'ai-v5'
    };

    console.log(`✅ AI Scraper Agent đã trích xuất thành công sản phẩm: ${product.name}`);
    return { success: true, product };
  } catch (err) {
    console.error('❌ Lỗi AI Scraper Agent Engine:', err);
    return {
      success: false,
      needsManualCapture: true,
      error: err.message || 'Lỗi không xác định trong quá trình cào dữ liệu'
    };
  }
}
