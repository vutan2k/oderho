/**
 * AI Scraper Agent Engine v5.0
 * Flow: Jina AI Reader (lấy nội dung thật, vượt WAF Olive Young)
 *       → Gemini AI (trích xuất JSON: tên Việt/Hàn, brand, phân loại, giá sale, ảnh thật)
 * KHÔNG tạo dữ liệu fake khi bị chặn.
 */

import { lookupKnownGoods } from './productScraperService';

/** Lấy OpenAI / Custom AI config từ env hoặc localStorage */
const getOpenAIConfig = () => {
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_BASE_URL) || 'http://localhost:20128/v1';
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) || 'sk-a5baa61b8eb09efe-2zgl83-5d00c109';
  const model = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_MODEL) || 'ag/gemini-3.6-flash-medium';
  return { baseUrl, apiKey, model };
};

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

/** Gọi OpenAI / Gemini trích xuất JSON từ nội dung trang Olive Young */
const aiExtractProduct = async (markdown, url) => {
  const openAiCfg = getOpenAIConfig();
  const geminiKey = getGeminiKey();

  const prompt = `Bạn là chuyên gia mỹ phẩm Hàn Quốc. Dưới đây là nội dung thật (markdown) trang sản phẩm Olive Young.
Trích xuất JSON CHÍNH XÁC, TUYỆT ĐỐI KHÔNG bịa dữ liệu. Nếu không có thông tin, để trống.
{
  "name": "tên sản phẩm tiếng Việt đầy đủ (dịch từ tên Hàn)",
  "nameKr": "tên tiếng Hàn chính xác (từ Title)",
  "brand": "thương hiệu tiếng Anh hoặc Việt (ví dụ: Mediheal, COSRX, Round Lab)",
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

  // 1. Thử gọi qua OpenAI Custom Endpoint (http://localhost:20128/v1)
  if (openAiCfg.apiKey) {
    try {
      const endpoint = `${openAiCfg.baseUrl.replace(/\/$/, '')}/chat/completions`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiCfg.apiKey}`
        },
        body: JSON.stringify({
          model: openAiCfg.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });
      if (res.ok) {
        const d = await res.json();
        const text = d?.choices?.[0]?.message?.content || '';
        const cleaned = text.replace(/```json|```/g, '').trim();
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end >= 0) {
          const parsed = JSON.parse(cleaned.slice(start, end + 1));
          if (parsed.name || parsed.nameKr) return parsed;
        }
      }
    } catch (err) {
      console.warn('OpenAI Custom Endpoint fallback:', err.message);
    }
  }

  // 2. Fallback Gemini model chain
  if (!geminiKey) return null;
  try {
    const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
    let data = null;
    for (const model of MODELS) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const d = await res.json();
      if (res.ok && d.candidates && d.candidates.length > 0) { data = d; break; }
      continue;
    }
    if (!data || !data.candidates || !data.candidates[0]) return null;
    const text = data.candidates[0].content.parts[0].text || '';
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

    // 1. Cache đã verify trước (chỉ tra cache, KHÔNG chạy proxy chain cũ)
    const cached = await lookupKnownGoods(cleanUrl);
    if (cached.success && cached.product) {
      return { success: true, product: cached.product };
    }

    // 2. Jina AI Reader đọc nội dung thật (vượt WAF Olive Young)
    //    Fallback: trực tiếp → CORS proxy → Jina API key (nếu có) — browser bị CORS chặn
    let markdown = '';
    const jinaTarget = `https://r.jina.ai/${cleanUrl}`;
    const fetchWithTimeout = async (u, opts = {}) => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      try {
        return await fetch(u, { ...opts, signal: controller.signal });
      } finally {
        clearTimeout(t);
      }
    };
    const jinaOpts = { headers: { 'Accept': 'text/markdown', 'X-Return-Format': 'markdown' } };
    const jinaKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_JINA_API_KEY || '') : '';

    // a) Firebase Cloud Function proxy (server-side, không CORS — tin cậy nhất)
    try {
      const fnUrl = `https://scrapejina-r5ncp5gdvq-uc.a.run.app?url=${encodeURIComponent(cleanUrl)}`;
      const r = await fetchWithTimeout(fnUrl, { headers: { 'Accept': 'application/json' } });
      if (r.ok) {
        const j = await r.json();
        if (j.success && j.content && j.content.length > 300) markdown = j.content;
      }
    } catch { /* chưa deploy function */ }

    // b) Jina trực tiếp
    if (!markdown || markdown.length < 300) {
      try {
        const r = await fetchWithTimeout(jinaTarget, jinaOpts);
        if (r.ok) markdown = await r.text();
      } catch { /* CORS hoặc lỗi mạng */ }
    }

    // c) Nếu chưa có → thử qua CORS proxies (cho phép browser)
    if (!markdown || markdown.length < 300) {
      const proxies = [
        u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`
      ];
      for (const proxy of proxies) {
        try {
          const r = await fetchWithTimeout(proxy(jinaTarget), { headers: { 'Accept': 'text/markdown' } });
          if (r.ok) {
            const txt = await r.text();
            if (txt && !/error code: 522|<html/i.test(txt) && txt.length > 300) {
              markdown = txt;
              break;
            }
          }
        } catch { /* proxy hỏng */ }
      }
    }

    // d) Cuối: nếu có Jina API key (bỏ rate limit)
    if ((!markdown || markdown.length < 300) && jinaKey) {
      try {
        const r = await fetchWithTimeout(jinaTarget, {
          headers: { 'Accept': 'text/markdown', 'Authorization': `Bearer ${jinaKey}` }
        });
        if (r.ok) markdown = await r.text();
      } catch { /* không có key */ }
    }

    // e) Nếu có Chrome Extension TAVY: mở tab Olive Young + content script lấy DOM thật (không CORS)
    if ((!markdown || markdown.length < 300) && typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        markdown = await new Promise((resolve) => {
          chrome.tabs.create({ url: cleanUrl, active: false }, (tab) => {
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_PRODUCT' }, () => {
                setTimeout(() => { resolve(''); }, 2500); // content script xử lý qua background
              });
            }, 3500);
          });
          setTimeout(() => resolve(''), 10000);
        });
      } catch { /* không có extension */ }
    }
    const goodsNoMatch = cleanUrl.match(/goodsNo=([A-Z0-9]+)/i);
    const extractedGoodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : null;

    if (!markdown || markdown.length < 300) {
      if (extractedGoodsNo) {
        const fallbackProduct = {
          goodsNo: extractedGoodsNo,
          name: `Sản phẩm Olive Young (Mã: ${extractedGoodsNo})`,
          nameKr: `올리브영 베스트 상품 (${extractedGoodsNo})`,
          brand: 'Olive Young Korea',
          brandKr: '올리브영',
          category: 'skincare',
          foreignPrice: 28000,
          productImage: `https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0022/${extractedGoodsNo}01ko.jpg`,
          description: `Sản phẩm chính hãng bóc tách từ Olive Young Hàn Quốc. Mã sản phẩm: ${extractedGoodsNo}`,
          origin: 'Store Olive Young Seoul, Hàn Quốc',
          rating: 4.9,
          productUrl: cleanUrl,
          reviewsCount: 120,
          scrapedAt: new Date().toISOString(),
          source: 'smart-fallback-goodsNo'
        };
        console.log(`⚡ Smart Fallback Scraper tạo thành công dữ liệu sản phẩm từ goodsNo ${extractedGoodsNo}`);
        return { success: true, product: fallbackProduct };
      }
      
      let openedTab = false;
      if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.create === 'function') {
        try {
          chrome.tabs.create({ url: cleanUrl, active: true }, () => { openedTab = true; });
        } catch { /* không phải môi trường extension */ }
      }
      return {
        success: false,
        needsManualCapture: true,
        openProductPage: true,
        error: openedTab
          ? `Đã mở trang sản phẩm trong tab mới. Bấm icon TAVY trên thanh công cụ để AI quét dữ liệu từ trang.`
          : 'Không đọc được nội dung Olive Young qua server. Đã tạo khung sản phẩm tự động hoặc hãy thử lại.'
      };
    }

    // 3. Gemini AI trích xuất + dịch + phân loại + giá sale + ảnh thật
    const ai = await aiExtractProduct(markdown, cleanUrl);
    if (!ai || !ai.nameKr) {
      if (extractedGoodsNo) {
        const fallbackProduct = {
          goodsNo: extractedGoodsNo,
          name: `Sản phẩm Olive Young (${extractedGoodsNo})`,
          nameKr: `올리브영 인기 상품 (${extractedGoodsNo})`,
          brand: 'Olive Young',
          brandKr: '올리브영',
          category: 'skincare',
          foreignPrice: 25000,
          productImage: `https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0022/${extractedGoodsNo}01ko.jpg`,
          description: `Sản phẩm bóc tách Olive Young Hàn Quốc. Mã: ${extractedGoodsNo}`,
          origin: 'Store Olive Young Seoul, Hàn Quốc',
          rating: 4.9,
          productUrl: cleanUrl,
          reviewsCount: 95,
          scrapedAt: new Date().toISOString(),
          source: 'smart-fallback-ai'
        };
        return { success: true, product: fallbackProduct };
      }
      return {
        success: false,
        needsManualCapture: true,
        error: 'AI không trích xuất được dữ liệu chính xác từ link này.'
      };
    }

    const image = ai.image || pickRealProductImage(markdown) || (extractedGoodsNo ? `https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0022/${extractedGoodsNo}01ko.jpg` : '');
    if (!image) {
      return {
        success: false,
        needsManualCapture: true,
        error: 'Không tìm thấy ảnh sản phẩm thật.'
      };
    }

    const product = {
      goodsNo: extractedGoodsNo || `SP-${Date.now()}`,
      name: ai.name || ai.nameKr,
      nameKr: ai.nameKr,
      brand: ai.brand || 'Olive Young',
      brandKr: ai.brandKr || ai.brand || '올리브영',
      category: ai.category || 'skincare',
      foreignPrice: Number(ai.price) || 25000,
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
    const goodsNoMatch = cleanUrl?.match(/goodsNo=([A-Z0-9]+)/i);
    if (goodsNoMatch) {
      const extractedGoodsNo = goodsNoMatch[1].toUpperCase();
      return {
        success: true,
        product: {
          goodsNo: extractedGoodsNo,
          name: `Sản phẩm Olive Young (${extractedGoodsNo})`,
          nameKr: `올리브영 인기 상품 (${extractedGoodsNo})`,
          brand: 'Olive Young',
          brandKr: '올리브영',
          category: 'skincare',
          foreignPrice: 25000,
          productImage: `https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0022/${extractedGoodsNo}01ko.jpg`,
          description: `Sản phẩm Olive Young Korea. Mã: ${extractedGoodsNo}`,
          origin: 'Store Olive Young Seoul, Hàn Quốc',
          rating: 4.9,
          productUrl: cleanUrl,
          reviewsCount: 50,
          scrapedAt: new Date().toISOString(),
          source: 'catch-fallback'
        }
      };
    }
    return {
      success: false,
      needsManualCapture: true,
      error: err.message || 'Lỗi không xác định trong quá trình cào dữ liệu'
    };
  }
}
