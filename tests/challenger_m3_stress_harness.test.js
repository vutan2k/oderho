/**
 * Challenger 1 Stress Test Harness for Milestone M3 & M4
 * Smart Product Research Engine & UI Component Verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  detectInputType,
  extractOliveYoungGoodsNo,
  cleanAndUnescapeKoreanText,
  validate10RequiredFields,
  buildVisionPayload,
  analyzeProductImage,
  executeMultiLoopScraperWithRetry,
  SUPPORTED_KOREAN_DOMAINS,
  QUALITY_CASCADE_ORDER
} from '../src/services/smartProductResearchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passedCount = 0;
let failedCount = 0;
const errors = [];

function assert(condition, message) {
  if (!condition) {
    failedCount++;
    errors.push(`FAIL: ${message}`);
    console.error(`  ❌ FAIL: ${message}`);
  } else {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    failedCount++;
    errors.push(`FAIL: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`);
    console.error(`  ❌ FAIL: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`);
  } else {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

console.log('\n================================================================');
console.log('  CHALLENGER 1: EMPIRICAL STRESS & FUZZING HARNESS (M3 & M4)');
console.log('================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. FUZZ DOMAIN DETECTION (60+ DIVERSE URL FORMATS & CORNER CASES)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST GROUP 1: FUZZ DOMAIN DETECTION (60+ URL FORMATS) ---');

const domainFuzzVectors = [
  // Olive Young (10 vectors)
  { input: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000223414' },
  { input: 'http://oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000192831&dispCatNo=90000010001', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000192831' },
  { input: 'https://m.oliveyoung.co.kr/m/goods/getGoodsDetail.do?goodsNo=A000000164829', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000164829' },
  { input: 'www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=a000000223414', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000223414' },
  { input: 'oliveyoung.co.kr/store/main/getPlanShopDetail.do?dispCatNo=500000100010001', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: null },
  { input: 'A000000223414', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000223414' },
  { input: 'a000000192831', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000192831' },
  { input: '  https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414  ', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000223414' },
  { input: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000999999&tracking=search', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: 'A000000999999' },
  { input: 'http://m.oliveyoung.co.kr/goods/A000000111222', expectedType: 'url', expectedDomain: 'oliveyoung', expectedGoodsNo: null },

  // Naver Brand Store / SmartStore (10 vectors)
  { input: 'https://smartstore.naver.com/somebrand/products/10482910', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: '10482910' },
  { input: 'https://brand.naver.com/kgc/products/98765432', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: '98765432' },
  { input: 'https://shopping.naver.com/products/55512345', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: '55512345' },
  { input: 'http://smartstore.naver.com/cosmetic/products/123456789?NaPm=ct%3D123', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: '123456789' },
  { input: 'm.smartstore.naver.com/store/products/99988877', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: '99988877' },
  { input: 'brand.naver.com/official/products/11223344', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: '11223344' },
  { input: 'https://smartstore.naver.com/main', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: null },
  { input: 'https://shopping.naver.com/window-products/detail/7890123', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: null },
  { input: '  https://brand.naver.com/kgc/products/10482910  ', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: '10482910' },
  { input: 'http://shopping.naver.com/home', expectedType: 'url', expectedDomain: 'naver', expectedGoodsNo: null },

  // Coupang (8 vectors)
  { input: 'https://www.coupang.com/vp/products/8237194451', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: '8237194451' },
  { input: 'https://www.coupang.com/vp/products/8237194451?itemId=23647182741&vendorItemId=90672619445', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: '8237194451' },
  { input: 'https://m.coupang.com/vm/products/7766554433', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: '7766554433' },
  { input: 'coupang.com/vp/products/1234567890', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: '1234567890' },
  { input: 'http://www.coupang.com/np/categories/12345', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: null },
  { input: 'https://www.coupang.com/products/44332211', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: '44332211' },
  { input: '  https://www.coupang.com/vp/products/8237194451  ', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: '8237194451' },
  { input: 'https://m.coupang.com/nm/home', expectedType: 'url', expectedDomain: 'coupang', expectedGoodsNo: null },

  // Hwahae (6 vectors)
  { input: 'https://www.hwahae.co.kr/products/555123', expectedType: 'url', expectedDomain: 'hwahae', expectedGoodsNo: '555123' },
  { input: 'https://hwahae.co.kr/products/987654', expectedType: 'url', expectedDomain: 'hwahae', expectedGoodsNo: '987654' },
  { input: 'http://hwahae.com/products/112233', expectedType: 'url', expectedDomain: 'hwahae', expectedGoodsNo: '112233' },
  { input: 'www.hwahae.co.kr/search?q=torriden', expectedType: 'url', expectedDomain: 'hwahae', expectedGoodsNo: null },
  { input: 'https://hwahae.co.kr/reviews/999', expectedType: 'url', expectedDomain: 'hwahae', expectedGoodsNo: null },
  { input: '  https://www.hwahae.co.kr/products/555123  ', expectedType: 'url', expectedDomain: 'hwahae', expectedGoodsNo: '555123' },

  // Gmarket & 11st (8 vectors)
  { input: 'https://item.gmarket.co.kr/Item?goodscode=123456789', expectedType: 'url', expectedDomain: 'gmarket', expectedGoodsNo: '123456789' },
  { input: 'http://gmarket.co.kr/goodscode=987654321', expectedType: 'url', expectedDomain: 'gmarket', expectedGoodsNo: '987654321' },
  { input: 'https://browse.gmarket.co.kr/search?keyword=mediheal', expectedType: 'url', expectedDomain: 'gmarket', expectedGoodsNo: null },
  { input: 'https://www.11st.co.kr/products/987654321', expectedType: 'url', expectedDomain: '11st', expectedGoodsNo: '987654321' },
  { input: 'https://m.11st.co.kr/products/1122334455', expectedType: 'url', expectedDomain: '11st', expectedGoodsNo: '1122334455' },
  { input: 'http://11st.co.kr/products/5544332211?query=abc', expectedType: 'url', expectedDomain: '11st', expectedGoodsNo: '5544332211' },
  { input: 'https://search.11st.co.kr/Search.tmall?kwd=anua', expectedType: 'url', expectedDomain: '11st', expectedGoodsNo: null },
  { input: '  https://www.11st.co.kr/products/987654321  ', expectedType: 'url', expectedDomain: '11st', expectedGoodsNo: '987654321' },

  // Musinsa (6 vectors)
  { input: 'https://www.musinsa.com/goods/3498211', expectedType: 'url', expectedDomain: 'musinsa', expectedGoodsNo: '3498211' },
  { input: 'https://musinsa.com/goods/9988776', expectedType: 'url', expectedDomain: 'musinsa', expectedGoodsNo: '9988776' },
  { input: 'http://m.musinsa.com/goods/12345?ref=search', expectedType: 'url', expectedDomain: 'musinsa', expectedGoodsNo: '12345' },
  { input: 'musinsa.com/goods/777888', expectedType: 'url', expectedDomain: 'musinsa', expectedGoodsNo: '777888' },
  { input: 'https://www.musinsa.com/ranking/best', expectedType: 'url', expectedDomain: 'musinsa', expectedGoodsNo: null },
  { input: '  https://www.musinsa.com/goods/3498211  ', expectedType: 'url', expectedDomain: 'musinsa', expectedGoodsNo: '3498211' },

  // Foreign Platforms (8 vectors -> MUST NOT match Korean domain)
  { input: 'https://www.amazon.com/dp/B08N5WRWNW', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://shopee.vn/product/12345/67890', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://tiki.vn/san-pham-p12345678.html', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://www.lazada.vn/products/i123456789.html', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://www.ebay.com/itm/1234567890', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://detail.tmall.com/item.htm?id=12345', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://www.walmart.com/ip/Product/123456', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://www.google.com/search?q=korean+cosmetics', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },

  // Malformed, Shortlinks & Non-URL Edge Cases (8 vectors)
  { input: 'bit.ly/3koreanProduct', expectedType: 'keyword', expectedDomain: undefined, expectedGoodsNo: undefined },
  { input: 'http://', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'https://localhost:3000/test', expectedType: 'url', expectedDomain: 'unknown', expectedGoodsNo: null },
  { input: 'Torriden Dive In Serum 50ml', expectedType: 'keyword', expectedDomain: undefined, expectedGoodsNo: undefined },
  { input: '아누아 어성초 77 토너', expectedType: 'keyword', expectedDomain: undefined, expectedGoodsNo: undefined },
  { input: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', expectedType: 'image', expectedDomain: undefined, expectedGoodsNo: undefined },
  { input: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...', expectedType: 'image', expectedDomain: undefined, expectedGoodsNo: undefined },
  { input: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=', expectedType: 'image', expectedDomain: undefined, expectedGoodsNo: undefined }
];

let vectorIdx = 0;
for (const vec of domainFuzzVectors) {
  vectorIdx++;
  const res = detectInputType(vec.input);
  assertEquals(res.type, vec.expectedType, `[Vector ${vectorIdx}] Input "${vec.input.length > 50 ? vec.input.slice(0, 50) + '...' : vec.input}" type == ${vec.expectedType}`);
  if (vec.expectedDomain !== undefined) {
    assertEquals(res.domain, vec.expectedDomain, `[Vector ${vectorIdx}] domain == ${vec.expectedDomain}`);
  }
  if (vec.expectedGoodsNo !== undefined) {
    assertEquals(res.goodsNo, vec.expectedGoodsNo, `[Vector ${vectorIdx}] goodsNo == ${vec.expectedGoodsNo}`);
  }
}

// Edge case inputs for detectInputType
assertEquals(detectInputType('').type, 'unknown', 'Empty string -> unknown');
assertEquals(detectInputType('   ').type, 'unknown', 'Whitespace string -> unknown');
assertEquals(detectInputType(null).type, 'unknown', 'null input -> unknown');
assertEquals(detectInputType(undefined).type, 'unknown', 'undefined input -> unknown');

// ─────────────────────────────────────────────────────────────────────────────
// 2. VISION PAYLOAD BUILDER STRESS TESTING
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- TEST GROUP 2: VISION PAYLOAD BUILDER STRESS ---');

// Valid Data URL
const validDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const payload1 = buildVisionPayload(validDataUrl);
assert(payload1 && payload1.contents && payload1.contents[0].parts.length === 2, 'Valid PNG Data URL builds 2 parts');
assertEquals(payload1.contents[0].parts[1].inlineData.mimeType, 'image/png', 'Correct mimeType image/png extracted');
assertEquals(payload1.generationConfig.responseMimeType, 'application/json', 'generationConfig enforces application/json');

// Valid JPEG base64 raw string
const rawBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/...';
const payload2 = buildVisionPayload(rawBase64);
assertEquals(payload2.contents[0].parts[1].inlineData.mimeType, 'image/jpeg', 'Raw base64 defaults to image/jpeg');

// Valid WebP object input
const webpObject = { type: 'image/webp', base64: 'UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=' };
const payload3 = buildVisionPayload(webpObject);
assertEquals(payload3.contents[0].parts[1].inlineData.mimeType, 'image/webp', 'Object input with image/webp supported');

// Valid GIF object input
const gifObject = { type: 'image/gif', data: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' };
const payload4 = buildVisionPayload(gifObject);
assertEquals(payload4.contents[0].parts[1].inlineData.mimeType, 'image/gif', 'Object input with image/gif supported');

// Invalid MIME types with Object inputs -> correctly throws
try {
  buildVisionPayload({ type: 'application/pdf', data: 'JVBERi0xLjQKJcOkw7zDtsOf...' });
  assert(false, 'application/pdf object should throw unsupported error');
} catch (e) {
  assert(e.message.includes('Unsupported image mime type'), 'application/pdf object correctly rejected');
}

try {
  buildVisionPayload({ type: 'text/plain', data: 'SGVsbG8gV29ybGQ=' });
  assert(false, 'text/plain object should throw unsupported error');
} catch (e) {
  assert(e.message.includes('Unsupported image mime type'), 'text/plain object correctly rejected');
}

try {
  buildVisionPayload({ type: 'image/svg+xml', data: 'PHN2Zz48L3N2Zz4=' });
  assert(false, 'image/svg+xml object should throw unsupported error');
} catch (e) {
  assert(e.message.includes('Unsupported image mime type'), 'image/svg+xml object correctly rejected');
}

// Null/empty input -> should throw
try {
  buildVisionPayload(null);
  assert(false, 'null input should throw error');
} catch (e) {
  assert(e.message.includes('Image input is required'), 'null input rejected');
}

// Oversized image handling in analyzeProductImage (>10MB)
(async () => {
  const hugeBase64 = 'A'.repeat(14 * 1024 * 1024); // ~10.5 MB base64
  try {
    await analyzeProductImage(`data:image/jpeg;base64,${hugeBase64}`);
    assert(false, 'Oversized image (>10MB) should throw error');
  } catch (e) {
    assert(e.message.includes('exceeds maximum allowed 10MB'), 'Oversized image cleanly rejected with 10MB limit error');
  }
})();

// ─────────────────────────────────────────────────────────────────────────────
// 3. FALLBACK CASCADE AND MULTI-LOOP RETRY VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- TEST GROUP 3: MULTI-LOOP CASCADE & RETRY SIMULATION ---');

(async () => {
  const validMockProduct = {
    name: 'Mặt Nạ Dưỡng Ẩm Mediheal N.M.F Ampoule Mask 10 Miếng',
    nameKr: '메디힐 N.M.F 앰플 마스크 10매',
    brand: 'Mediheal',
    category: 'skincare',
    foreignPrice: 20000,
    productImage: 'https://image.oliveyoung.co.kr/uploads/images/goods/400/10/0000/0019/A00000019283101ko.jpg',
    images: [
      'https://image.oliveyoung.co.kr/uploads/images/goods/800/10/0000/0019/A00000019283101ko.jpg',
      'https://image.oliveyoung.co.kr/uploads/images/goods/800/10/0000/0019/A00000019283102ko.jpg',
      'https://image.oliveyoung.co.kr/uploads/images/goods/800/10/0000/0019/A00000019283103ko.jpg'
    ],
    photoReviews: [
      'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/review1.jpg',
      'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/review2.jpg'
    ],
    ingredients: ['Nước tinh khiết', 'Glycerin', 'Sodium Hyaluronate'],
    description: 'Mặt nạ cấp ẩm sâu với công thức N.M.F độc quyền.',
    rating: 4.8,
    reviewsCount: 1420
  };

  // Case A: Source 1 (oliveyoung) fails all 3 loops (403, 500, timeout) -> advances to Naver -> Naver succeeds on loop 2
  const logsA = [];
  const resA = await executeMultiLoopScraperWithRetry({
    sources: ['oliveyoung', 'naver', 'coupang'],
    maxRetriesPerSource: 3,
    fetchFn: async (source, attempt) => {
      if (source === 'oliveyoung') {
        if (attempt === 1) return { status: 403, error: 'WAF Cloudflare Challenge' };
        if (attempt === 2) return { status: 500, error: 'Internal Server Error' };
        return { timeout: true };
      }
      if (source === 'naver') {
        if (attempt === 1) return { status: 500, error: 'Gateway timeout' };
        return { status: 200, data: { ...validMockProduct, source: 'naver' } };
      }
      return { status: 404 };
    },
    onLog: (msg) => logsA.push(msg)
  });

  assert(resA.success === true, 'Cascade Scenario A succeeded');
  assertEquals(resA.source, 'naver', 'Cascade Scenario A winning source is naver');
  assert(logsA.some(l => l.includes('❌ [oliveyoung] Thất bại sau 3 vòng thử')), 'OliveYoung failed after 3 loops recorded in log');
  assert(logsA.some(l => l.includes('✅ [naver] Lấy đủ 10 trường thông tin thành công!')), 'Naver success recorded in log');

  // Case B: All sources fail across all 3 loops (21 attempts total)
  const logsB = [];
  const resB = await executeMultiLoopScraperWithRetry({
    sources: QUALITY_CASCADE_ORDER,
    maxRetriesPerSource: 3,
    fetchFn: async (source, attempt) => {
      return { status: 403, error: 'Blocked by Anti-bot' };
    },
    onLog: (msg) => logsB.push(msg)
  });

  assert(resB.success === false, 'Cascade Scenario B cleanly failed without crash');
  assertEquals(resB.source, null, 'Cascade Scenario B source is null');
  assertEquals(resB.product, null, 'Cascade Scenario B product is null');
  assertEquals(logsB.filter(l => l.includes('Thất bại sau 3 vòng thử')).length, 7, 'All 7 sources logged 3-loop failures');

  // Case C: Source 1 returns missing required fields (price 0) -> rejected -> advances to Coupang
  const logsC = [];
  const resC = await executeMultiLoopScraperWithRetry({
    sources: ['oliveyoung', 'coupang'],
    maxRetriesPerSource: 3,
    fetchFn: async (source, attempt) => {
      if (source === 'oliveyoung') {
        return { status: 200, data: { ...validMockProduct, foreignPrice: 0 } }; // Price 0 invalid
      }
      if (source === 'coupang') {
        return { status: 200, data: { ...validMockProduct, source: 'coupang' } };
      }
      return { status: 404 };
    },
    onLog: (msg) => logsC.push(msg)
  });

  assert(resC.success === true, 'Cascade Scenario C succeeded via Coupang');
  assertEquals(resC.source, 'coupang', 'Winning source is coupang after OliveYoung missing price rejection');
  assert(logsC.some(l => l.includes('Thiếu trường bắt buộc: foreignPrice')), 'Logged missing foreignPrice validation rejection');
})();

// ─────────────────────────────────────────────────────────────────────────────
// 4. 10 REQUIRED FIELDS BOUNDARY & RULE 0 EMPIRICAL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- TEST GROUP 4: 10 REQUIRED FIELDS BOUNDARY & RULE 0 VERIFICATION ---');

const baseValid = {
  name: 'Serum Torriden DIVE-IN Hyaluronic Acid 50ml',
  nameKr: '토리든 다이브인 저분자 히알루론산 세럼 50ml',
  brand: 'Torriden',
  category: 'skincare',
  foreignPrice: 19000,
  productImage: 'https://image.oliveyoung.co.kr/uploads/images/goods/400/10/0000/0016/A00000016482901ko.jpg',
  images: [
    'https://image.oliveyoung.co.kr/uploads/images/goods/800/10/0000/0016/A00000016482901ko.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/goods/800/10/0000/0016/A00000016482902ko.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/goods/800/10/0000/0016/A00000016482903ko.jpg'
  ],
  photoReviews: [
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/rev1.jpg'
  ],
  ingredients: ['Nước tinh khiết', 'Hyaluronic Acid'],
  description: 'Serum cấp ẩm phục hồi da dịu nhẹ cho mọi loại da.',
  rating: 4.8,
  reviewsCount: 1540
};

// Valid baseline
assert(validate10RequiredFields(baseValid).valid === true, 'Baseline valid product passes 10 required fields check');

// Empty photoReviews and ingredients MUST pass (Rule 0 honest empty arrays)
const emptyArraysProduct = { ...baseValid, photoReviews: [], ingredients: [] };
const vEmpty = validate10RequiredFields(emptyArraysProduct);
assert(vEmpty.valid === true, 'Empty photoReviews [] and ingredients [] are completely valid under Rule 0');

// Missing field test matrix
const boundaryTestCases = [
  { mod: { name: '' }, missing: 'name' },
  { mod: { name: null }, missing: 'name' },
  { mod: { nameKr: '' }, missing: 'nameKr' },
  { mod: { nameKr: null }, missing: 'nameKr' },
  { mod: { brand: '' }, missing: 'brand' },
  { mod: { brand: null }, missing: 'brand' },
  { mod: { foreignPrice: 0 }, missing: 'foreignPrice' },
  { mod: { foreignPrice: -500 }, missing: 'foreignPrice' },
  { mod: { foreignPrice: '25000' }, missing: 'foreignPrice' },
  { mod: { foreignPrice: NaN }, missing: 'foreignPrice' },
  { mod: { productImage: '' }, missing: 'productImage' },
  { mod: { productImage: 'not-a-valid-url' }, missing: 'productImage' },
  { mod: { images: [] }, missing: 'images' },
  { mod: { images: null }, missing: 'images' },
  { mod: { photoReviews: 'none' }, missing: 'photoReviews' },
  { mod: { photoReviews: null }, missing: 'photoReviews' },
  { mod: { ingredients: 'water' }, missing: 'ingredients' },
  { mod: { ingredients: null }, missing: 'ingredients' },
  { mod: { description: '' }, missing: 'description' },
  { mod: { description: null }, missing: 'description' },
  { mod: { rating: 5.5 }, missing: 'rating' },
  { mod: { rating: -1 }, missing: 'rating' },
  { mod: { rating: '4.8' }, missing: 'rating' },
  { mod: { reviewsCount: -10 }, missing: 'reviewsCount' },
  { mod: { reviewsCount: '100' }, missing: 'reviewsCount' }
];

for (const tc of boundaryTestCases) {
  const testObj = { ...baseValid, ...tc.mod };
  const res = validate10RequiredFields(testObj);
  assert(res.valid === false, `Validation failed as expected for invalid ${tc.missing} (${JSON.stringify(tc.mod)})`);
  assert(res.missingFields.includes(tc.missing), `Missing fields correctly contains "${tc.missing}"`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. STATIC SOURCE CODE SCAN FOR RULE 0 VIOLATIONS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- TEST GROUP 5: STATIC AUDIT FOR RULE 0 COMPLIANCE ---');

const filesToAudit = [
  path.resolve(__dirname, '../src/services/smartProductResearchEngine.js'),
  path.resolve(__dirname, '../src/services/aiScraperAgentEngine.js'),
  path.resolve(__dirname, '../src/services/naverHealthScraperEngine.js'),
  path.resolve(__dirname, '../src/services/oliveYoungScraperCore.js'),
  path.resolve(__dirname, '../src/components/AdminProductResearchTab.jsx')
];

for (const f of filesToAudit) {
  const content = fs.readFileSync(f, 'utf8');
  const filename = path.basename(f);

  // Check Math.random() usage
  // Ignore in AdminProductResearchTab if only used for UI log keys (Math.random().toString(36)...)
  const mathRandomMatches = content.match(/Math\.random\(\)/g) || [];
  if (filename === 'aiScraperAgentEngine.js') {
    assert(!content.includes('Math.floor(Math.random()'), `${filename} has ZERO Math.floor(Math.random() fake reviewsCount generator`);
  }
  if (filename === 'smartProductResearchEngine.js') {
    assert(!content.includes('Math.floor(Math.random()'), `${filename} has ZERO fake data random generators`);
  }

  // Check for fake hardcoded ratings like rating = 4.9 or rating: 4.9 in scrapers
  if (filename.includes('Engine') || filename.includes('Core')) {
    const fakeRatingRegex = /rating\s*:\s*4\.9\b/g;
    assert(!fakeRatingRegex.test(content), `${filename} does not contain hardcoded fake rating: 4.9`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL REPORT
// ─────────────────────────────────────────────────────────────────────────────
setTimeout(() => {
  console.log('\n================================================================');
  console.log(`  TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  if (failedCount === 0) {
    console.log('  VERDICT: ALL EMPIRICAL STRESS TESTS PASSED WITH 100% SUCCESS!');
  } else {
    console.error(`  VERDICT: ${failedCount} FAILURES DETECTED. INSPECT LOGS ABOVE.`);
  }
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}, 1000);
