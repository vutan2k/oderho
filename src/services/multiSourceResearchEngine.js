/**
 * Multi-Source Korean Product Research Engine v1.0
 * Supports: Olive Young, Naver, Coupang, Hwahae, Gmarket, 11st, Musinsa
 * Priority: QUALITY over SPEED — no fake data, no Math.random()
 * Rule 0 Compliant: reviewsCount=0 if unknown, rating=0 if unknown, photoReviews=[] if not found
 */

import { runAIScraperAgent } from './aiScraperAgentEngine.js';
import { scrapeKoreanHealthProduct } from './koreanHealthScraperCore.js';
import { cleanNaverCdnImageUrl, isNaverJunkImage } from './naverHealthScraperEngine.js';
import { cleanHighResImageUrl, isOliveYoungJunkImage } from './oliveYoungScraperCore.js';

// ── Domain Detection ──────────────────────────────────────────────────────
export const KOREAN_DOMAIN_MAP = {
  oliveyoung:  ['oliveyoung.co.kr'],
  naver:       ['smartstore.naver.com', 'brand.naver.com', 'shopping.naver.com', 'naver.com'],
  coupang:     ['coupang.com'],
  hwahae:      ['hwahae.com'],
  gmarket:     ['gmarket.co.kr'],
  elevenst:    ['11st.co.kr'],
  musinsa:     ['musinsa.com'],
};

/**
 * Auto-detect source domain from URL string
 * @returns {'oliveyoung'|'naver'|'coupang'|'hwahae'|'gmarket'|'elevenst'|'musinsa'|'unknown'}
 */
export function detectSourceDomain(url = '') {
  const lower = url.toLowerCase();
  for (const [key, patterns] of Object.entries(KOREAN_DOMAIN_MAP)) {
    if (patterns.some(p => lower.includes(p))) return key;
  }
  return 'unknown';
}

/**
 * Detect whether input is a URL or image data (base64/file object)
 * @param {string|File} input
 * @returns {'url'|'image'|'unknown'}
 */
export function detectInputType(input) {
  if (!input) return 'unknown';
  if (input instanceof File || input instanceof Blob) return 'image';
  if (typeof input === 'string') {
    if (/^https?:\/\//i.test(input.trim())) return 'url';
    if (/^data:image\//i.test(input.trim())) return 'image';
  }
  return 'unknown';
}

// ── Jina AI Reader helper (shared across sources) ─────────────────────────
const fetchWithTimeout = async (url, opts = {}, timeoutMs = 18000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
};

async function fetchMarkdownViaJina(targetUrl) {
  const jinaUrl = `https://r.jina.ai/${targetUrl}`;
  const opts = { headers: { Accept: 'text/markdown', 'X-Return-Format': 'markdown' } };

  // 1. Firebase Cloud Function proxy
  try {
    const r = await fetchWithTimeout(
      `https://scrapejina-r5ncp5gdvq-uc.a.run.app?url=${encodeURIComponent(targetUrl)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (r.ok) {
      const j = await r.json();
      if (j.success && j.content && j.content.length > 300) return j.content;
    }
  } catch { /* proxy not deployed */ }

  // 2. Direct Jina
  try {
    const r = await fetchWithTimeout(jinaUrl, opts);
    if (r.ok) { const t = await r.text(); if (t.length > 300) return t; }
  } catch { /* CORS */ }

  // 3. CORS proxies
  const proxies = [
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  ];
  for (const proxyFn of proxies) {
    try {
      const r = await fetchWithTimeout(proxyFn(jinaUrl), { headers: { Accept: 'text/markdown' } });
      if (r.ok) {
        const t = await r.text();
        if (t && t.length > 300 && !/error code: 522|<html/i.test(t)) return t;
      }
    } catch { /* try next */ }
  }

  return '';
}

// ── AI Text Extraction helper ─────────────────────────────────────────────
const getOpenAIConfig = () => {
  const e = typeof import.meta !== 'undefined' ? import.meta.env : {};
  return {
    baseUrl: e?.VITE_OPENAI_BASE_URL || 'http://localhost:20128/v1',
    apiKey:  e?.VITE_OPENAI_API_KEY  || '',
    model:   e?.VITE_OPENAI_MODEL    || 'ag/gemini-3.6-flash-medium',
  };
};

async function aiExtractFromMarkdown(markdown, sourceHint, url) {
  const cfg = getOpenAIConfig();
  if (!cfg.apiKey) return null;

  const prompt = `Bạn là chuyên gia sản phẩm Hàn Quốc. Phân tích nội dung Markdown từ trang ${sourceHint} và trích xuất JSON CHÍNH XÁC sau (không bịa):
{
  "name": "tên tiếng Việt đầy đủ mượt mà",
  "nameKr": "tên tiếng Hàn chính xác",
  "brand": "thương hiệu",
  "category": "skincare|makeup|haircare|bodycare|supplements|ginseng|fashion|other",
  "foreignPrice": <số KRW - giá sale ưu tiên, integer>,
  "originalPrice": <số KRW giá gốc trước sale, hoặc null>,
  "discountPercent": <% giảm giá hoặc null>,
  "productImage": "URL ảnh chính HD (không phải logo/banner)",
  "images": ["URL 1","URL 2",...],
  "photoReviews": ["URL ảnh review người dùng thật",...],
  "ingredients": "thành phần nguyên liệu (tiếng Hàn hoặc dịch Việt)",
  "description": "mô tả công dụng tiếng Việt ngắn gọn",
  "rating": <số thực 0-5 từ nguồn, null nếu không có>,
  "reviewsCount": <số lượt đánh giá từ nguồn, 0 nếu không có>,
  "goodsNo": "mã SKU nếu có"
}
TUYỆT ĐỐI không bịa. Nếu không có trường nào thì để null hoặc [] hoặc 0 tương ứng.
URL: ${url}
Nội dung (${markdown.length} ký tự):
${markdown.slice(0, 15000)}`;

  try {
    const endpoint = `${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        stream: false,
      }),
    }, 30000);

    if (!res.ok) return null;
    const raw = await res.text();
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return null; }
    const text = parsed?.choices?.[0]?.message?.content || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end < 0) return null;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch { return null; }
}

// ── Image Cleaning helpers ────────────────────────────────────────────────
function cleanAndFilterImages(urls = [], source = 'oliveyoung') {
  return [...new Set(urls)]
    .filter(u => u && typeof u === 'string' && u.startsWith('http'))
    .filter(u => source === 'naver' ? !isNaverJunkImage(u) : !isOliveYoungJunkImage(u))
    .map(u => source === 'naver' ? cleanNaverCdnImageUrl(u) : cleanHighResImageUrl(u))
    .slice(0, 8);
}

function extractImagesFromMarkdown(markdown, source = 'oliveyoung') {
  const re = /!\[[^\]]*\]\((https:\/\/[^\s)]+)\)/g;
  const urls = [];
  let m;
  while ((m = re.exec(markdown)) !== null) urls.push(m[1]);
  return cleanAndFilterImages(urls, source);
}

function extractReviewPhotosFromMarkdown(markdown) {
  const re = /!\[[^\]]*\]\((https:\/\/[^\s)]+)\)/g;
  const urls = [];
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const u = m[1];
    // Olive Young GDAS review photos
    if (/gdas[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)/i.test(u)) urls.push(u);
    // Naver Pay review photos
    if (/review[A-Za-z0-9_.-]+pstatic\.net/i.test(u)) urls.push(u);
    // Hwahae review photos
    if (/hwahae[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)/i.test(u)) urls.push(u);
    // General review patterns
    if (/\/review\/|\/reviews?\//i.test(u) && /\.(jpg|jpeg|png|webp)/i.test(u)) urls.push(u);
  }
  return [...new Set(urls)].slice(0, 10);
}

// ── Source-Specific Scrapers ──────────────────────────────────────────────

/** Coupang scraper via Jina + AI */
async function scrapeCoupang(url, onLog) {
  onLog('📡 [Coupang] Đang đọc nội dung qua Jina AI Reader...', 'info');
  const markdown = await fetchMarkdownViaJina(url);
  if (!markdown || markdown.length < 200) {
    onLog('⚠️ [Coupang] Không đọc được nội dung (WAF hoặc CORS). Chuyển nguồn tiếp theo.', 'warn');
    return null;
  }
  onLog(`📄 [Coupang] Đọc được ${markdown.length} ký tự. Đang trích xuất AI...`, 'info');
  const data = await aiExtractFromMarkdown(markdown, 'Coupang Hàn Quốc', url);
  if (!data || !data.name) {
    onLog('⚠️ [Coupang] AI không trích xuất được thông tin đủ.', 'warn');
    return null;
  }
  const images = data.images?.length ? cleanAndFilterImages(data.images, 'other') : extractImagesFromMarkdown(markdown, 'other');
  const photoReviews = extractReviewPhotosFromMarkdown(markdown);
  onLog(`✅ [Coupang] Lấy được: Tên ✓ Giá ${data.foreignPrice || '?'}₩ ✓ Ảnh x${images.length} ✓ Review x${photoReviews.length}`, 'success');
  return { ...data, images, photoReviews, source: 'COUPANG', productUrl: url };
}

/** Hwahae scraper — focus on review photos */
async function scrapeHwahae(url, onLog) {
  onLog('📷 [Hwahae] Đang tìm ảnh review thực tế từ cộng đồng Hwahae...', 'info');
  const markdown = await fetchMarkdownViaJina(url);
  if (!markdown || markdown.length < 200) {
    onLog('⚠️ [Hwahae] Không đọc được nội dung. Chuyển nguồn tiếp theo.', 'warn');
    return null;
  }
  const data = await aiExtractFromMarkdown(markdown, 'Hwahae (화해)', url);
  const images = data?.images?.length ? cleanAndFilterImages(data.images, 'other') : extractImagesFromMarkdown(markdown, 'other');
  const photoReviews = extractReviewPhotosFromMarkdown(markdown);
  onLog(`✅ [Hwahae] Lấy được: Ảnh x${images.length} ✓ Review x${photoReviews.length}`, 'success');
  if (!data || !data.name) return { images, photoReviews, source: 'HWAHAE_REVIEWS_ONLY', productUrl: url };
  return { ...data, images, photoReviews, source: 'HWAHAE', productUrl: url };
}

/** Gmarket scraper */
async function scrapeGmarket(url, onLog) {
  onLog('📡 [Gmarket] Đang đọc nội dung...', 'info');
  const markdown = await fetchMarkdownViaJina(url);
  if (!markdown || markdown.length < 200) {
    onLog('⚠️ [Gmarket] Không đọc được nội dung. Bỏ qua.', 'warn');
    return null;
  }
  const data = await aiExtractFromMarkdown(markdown, 'Gmarket Hàn Quốc', url);
  if (!data || !data.name) { onLog('⚠️ [Gmarket] Không đủ thông tin.', 'warn'); return null; }
  const images = data.images?.length ? cleanAndFilterImages(data.images, 'other') : extractImagesFromMarkdown(markdown, 'other');
  const photoReviews = extractReviewPhotosFromMarkdown(markdown);
  onLog(`✅ [Gmarket] Lấy được: ${data.name} — ${data.foreignPrice || '?'}₩`, 'success');
  return { ...data, images, photoReviews, source: 'GMARKET', productUrl: url };
}

/** 11st scraper */
async function scrapElevenSt(url, onLog) {
  onLog('📡 [11st] Đang đọc nội dung...', 'info');
  const markdown = await fetchMarkdownViaJina(url);
  if (!markdown || markdown.length < 200) {
    onLog('⚠️ [11st] Không đọc được nội dung. Bỏ qua.', 'warn');
    return null;
  }
  const data = await aiExtractFromMarkdown(markdown, '11st (11번가) Hàn Quốc', url);
  if (!data || !data.name) { onLog('⚠️ [11st] Không đủ thông tin.', 'warn'); return null; }
  const images = data.images?.length ? cleanAndFilterImages(data.images, 'other') : extractImagesFromMarkdown(markdown, 'other');
  const photoReviews = extractReviewPhotosFromMarkdown(markdown);
  onLog(`✅ [11st] Lấy được: ${data.name} — ${data.foreignPrice || '?'}₩`, 'success');
  return { ...data, images, photoReviews, source: '11ST', productUrl: url };
}

/** Musinsa scraper */
async function scrapeMusinsa(url, onLog) {
  onLog('📡 [Musinsa] Đang đọc nội dung...', 'info');
  const markdown = await fetchMarkdownViaJina(url);
  if (!markdown || markdown.length < 200) {
    onLog('⚠️ [Musinsa] Không đọc được nội dung. Bỏ qua.', 'warn');
    return null;
  }
  const data = await aiExtractFromMarkdown(markdown, 'Musinsa (무신사) Hàn Quốc', url);
  if (!data || !data.name) { onLog('⚠️ [Musinsa] Không đủ thông tin.', 'warn'); return null; }
  const images = data.images?.length ? cleanAndFilterImages(data.images, 'other') : extractImagesFromMarkdown(markdown, 'other');
  const photoReviews = extractReviewPhotosFromMarkdown(markdown);
  onLog(`✅ [Musinsa] Lấy được: ${data.name} — ${data.foreignPrice || '?'}₩`, 'success');
  return { ...data, images, photoReviews, source: 'MUSINSA', productUrl: url };
}

// ── Merge Results (quality-first) ─────────────────────────────────────────
function mergeProductData(base, supplement) {
  if (!supplement) return base;
  const merged = { ...base };
  // Fill missing fields from supplement
  const fields = ['name','nameKr','brand','category','foreignPrice','originalPrice','discountPercent',
    'productImage','description','ingredients','rating','reviewsCount'];
  for (const f of fields) {
    if (!merged[f] && supplement[f]) merged[f] = supplement[f];
  }
  // Merge images (deduplicate, max 8)
  const allImages = [...(merged.images || []), ...(supplement.images || [])];
  merged.images = [...new Set(allImages)].filter(u => u && u.startsWith('http')).slice(0, 8);
  if (!merged.productImage && merged.images.length > 0) merged.productImage = merged.images[0];
  // Merge review photos (deduplicate, max 10)
  const allReviews = [...(merged.photoReviews || []), ...(supplement.photoReviews || [])];
  merged.photoReviews = [...new Set(allReviews)].filter(u => u && u.startsWith('http')).slice(0, 10);
  return merged;
}

// ── Image Upload → AI Vision Analysis ────────────────────────────────────
export async function analyzeProductImage(imageFile, onLog) {
  onLog('🖼️ [Vision AI] Đang phân tích ảnh sản phẩm bằng Gemini Vision...', 'info');
  const e = typeof import.meta !== 'undefined' ? import.meta.env : {};
  const geminiKey = e?.VITE_GEMINI_API_KEY || '';

  if (!geminiKey) {
    onLog('⚠️ [Vision AI] Thiếu Gemini API Key. Không thể phân tích ảnh.', 'warn');
    return null;
  }

  try {
    // Convert image to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const mimeType = imageFile.type || 'image/jpeg';
    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-pro-vision'];

    for (const model of models) {
      try {
        const res = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: `Phân tích ảnh sản phẩm Hàn Quốc này và trả về JSON:
{
  "productNameKr": "tên tiếng Hàn nếu đọc được",
  "brand": "thương hiệu",
  "searchQuery": "từ khóa tìm kiếm tiếng Hàn để tra cứu sản phẩm này trên Naver/OliveYoung",
  "category": "skincare|makeup|haircare|supplements|fashion|other",
  "estimatedPrice": <giá KRW ước tính hoặc null>,
  "description": "mô tả sản phẩm tiếng Việt"
}
Chỉ trả JSON thuần.` },
                  { inlineData: { mimeType, data: base64 } }
                ]
              }]
            })
          },
          20000
        );
        if (!res.ok) continue;
        const d = await res.json();
        const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = text.replace(/```json|```/g, '').trim();
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end >= 0) {
          const parsed = JSON.parse(cleaned.slice(start, end + 1));
          onLog(`✅ [Vision AI] Nhận diện: ${parsed.brand || ''} — ${parsed.searchQuery || ''}`, 'success');
          return parsed;
        }
      } catch { /* try next model */ }
    }
  } catch (err) {
    onLog(`⚠️ [Vision AI] Lỗi: ${err.message}`, 'warn');
  }
  return null;
}

// ── MAIN: Multi-Source Research Engine ───────────────────────────────────
/**
 * Research sản phẩm Hàn Quốc từ đa nguồn
 * @param {string} url - URL sản phẩm
 * @param {function} onLog - callback(message, type='info'|'success'|'warn'|'error')
 * @returns {Promise<object|null>}
 */
export async function researchProductFromUrl(url, onLog = () => {}) {
  const source = detectSourceDomain(url);
  onLog(`🔍 Đã nhận URL từ: ${source.toUpperCase()}`, 'info');

  let primaryResult = null;
  let supplementResult = null;

  // ── Phase 1: Primary source ────────────────────────────────────────────
  if (source === 'oliveyoung') {
    onLog('📡 [OliveYoung] Đang bóc tách dữ liệu qua AI Scraper Engine...', 'info');
    try {
      const r = await runAIScraperAgent(url);
      if (r?.success && r.product) {
        primaryResult = r.product;
        onLog(`✅ [OliveYoung] Lấy được: ${primaryResult.name} — ${primaryResult.foreignPrice}₩`, 'success');
      } else {
        onLog(`⚠️ [OliveYoung] ${r?.error || 'Không lấy được dữ liệu'}. Thử nguồn khác...`, 'warn');
      }
    } catch (e) {
      onLog(`⚠️ [OliveYoung] Lỗi: ${e.message}. Thử nguồn khác...`, 'warn');
    }
  } else if (source === 'naver') {
    onLog('📡 [Naver] Đang bóc tách dữ liệu sức khoẻ/sâm Hàn Quốc...', 'info');
    try {
      const r = await scrapeKoreanHealthProduct(url);
      if (r) {
        primaryResult = r;
        onLog(`✅ [Naver] Lấy được: ${r.name} — ${r.foreignPrice}₩`, 'success');
      }
    } catch (e) {
      onLog(`⚠️ [Naver] Lỗi: ${e.message}`, 'warn');
    }
  } else if (source === 'coupang') {
    primaryResult = await scrapeCoupang(url, onLog);
  } else if (source === 'hwahae') {
    primaryResult = await scrapeHwahae(url, onLog);
  } else if (source === 'gmarket') {
    primaryResult = await scrapeGmarket(url, onLog);
  } else if (source === 'elevenst') {
    primaryResult = await scrapElevenSt(url, onLog);
  } else if (source === 'musinsa') {
    primaryResult = await scrapeMusinsa(url, onLog);
  } else {
    // Unknown — try OliveYoung AI engine first as generic
    onLog('❓ Domain không xác định. Thử bóc tách thông thường...', 'warn');
    try {
      const r = await runAIScraperAgent(url);
      if (r?.success && r.product) primaryResult = r.product;
    } catch { /* */ }
  }

  // ── Phase 2: Supplement from Hwahae for review photos ─────────────────
  if (primaryResult && (!primaryResult.photoReviews || primaryResult.photoReviews.length < 2)) {
    const missingFields = getMissingFields(primaryResult);
    if (missingFields.includes('photoReviews')) {
      onLog('📷 [Hwahae] Chưa có ảnh review. Đang tìm bổ sung từ Hwahae...', 'info');
      try {
        const brandSearch = encodeURIComponent(`${primaryResult.brand || ''} ${primaryResult.nameKr || primaryResult.name || ''}`);
        const hwahaeSearchUrl = `https://hwahae.com/search?q=${brandSearch}`;
        supplementResult = await scrapeHwahae(hwahaeSearchUrl, onLog);
      } catch { /* */ }
    }
  }

  // ── Phase 3: Fallback cascade if primary failed ────────────────────────
  if (!primaryResult) {
    onLog('🔄 Khởi động fallback cascade: Coupang → Gmarket → 11st...', 'info');
    const fallbacks = [
      { name: 'Coupang', fn: () => scrapeCoupang(url, onLog) },
      { name: 'Gmarket', fn: () => scrapeGmarket(url, onLog) },
      { name: '11st',    fn: () => scrapElevenSt(url, onLog) },
    ];
    for (const fb of fallbacks) {
      try {
        primaryResult = await fb.fn();
        if (primaryResult?.name) break;
      } catch { /* try next */ }
    }
  }

  if (!primaryResult) {
    onLog('❌ Tất cả nguồn đều thất bại. Không thể lấy thông tin sản phẩm.', 'error');
    return null;
  }

  // ── Phase 4: Merge & Normalize ────────────────────────────────────────
  const merged = mergeProductData(primaryResult, supplementResult);
  const normalized = normalizeProductFields(merged, url);

  // ── Phase 5: Log missing fields ───────────────────────────────────────
  const missing = getMissingFields(normalized);
  if (missing.length > 0) {
    onLog(`⚠️ Thiếu trường: ${missing.join(', ')} (để trống, không dùng dữ liệu giả)`, 'warn');
  }

  onLog(`📋 Hoàn tất nghiên cứu sản phẩm! Đang đưa vào Hàng Chờ Duyệt...`, 'success');
  return normalized;
}

/** Normalize and ensure Rule 0 compliance — never fake data */
function normalizeProductFields(product, sourceUrl = '') {
  const goodsNoMatch = sourceUrl.match(/goodsNo=([A-Za-z0-9_]+)/i);
  return {
    goodsNo:         product.goodsNo || goodsNoMatch?.[1] || `RESEARCH-${Date.now()}`,
    name:            product.name || '',
    nameKr:          product.nameKr || product.koreanTitle || '',
    brand:           product.brand || '',
    category:        product.category || 'cosmetics',
    foreignPrice:    Number(product.foreignPrice) || Number(product.price) || 0,
    originalPrice:   Number(product.originalPrice) || 0,
    discountPercent: Number(product.discountPercent) || 0,
    price:           Number(product.foreignPrice) || Number(product.price) || 0,
    productImage:    product.productImage || (product.images?.[0]) || '',
    images:          Array.isArray(product.images) ? product.images.filter(u => u) : [],
    photoReviews:    Array.isArray(product.photoReviews) ? product.photoReviews.filter(u => u) : [],
    ingredients:     product.ingredients || product.activeIngredients || '',
    description:     product.description || '',
    usage:           product.usage || '',
    // Rule 0: real data only — 0 or null, never Math.random
    rating:          (typeof product.rating === 'number' && product.rating > 0) ? product.rating : 0,
    reviewsCount:    (typeof product.reviewsCount === 'number') ? product.reviewsCount : 0,
    origin:          product.origin || 'Hàn Quốc',
    productUrl:      product.productUrl || sourceUrl,
    source:          product.source || 'MULTI_SOURCE',
    isPublished:     false,
    status:          'pending',
    researchedAt:    new Date().toISOString(),
  };
}

/** Return list of missing required fields */
function getMissingFields(product) {
  const required = [
    ['name',         v => v && v.length > 0],
    ['nameKr',       v => v && v.length > 0],
    ['brand',        v => v && v.length > 0],
    ['foreignPrice', v => v > 0],
    ['productImage', v => v && v.startsWith('http')],
    ['images',       v => Array.isArray(v) && v.length > 0],
    ['photoReviews', v => Array.isArray(v)],  // [] is acceptable
    ['ingredients',  v => v !== undefined],   // empty string acceptable
    ['description',  v => v && v.length > 0],
    ['rating',       v => v !== undefined],   // 0 is acceptable
  ];
  return required.filter(([k, check]) => !check(product[k])).map(([k]) => k);
}

export { getMissingFields };
