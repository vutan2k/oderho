/**
 * Tier 2: Boundary & Corner Cases — Feature 23: Smart Product Research
 * Covers F23-B01 to F23-B08:
 * - F23-B01: Invalid / unsupported URL rejection with clear error
 * - F23-B02: Corrupt / oversized / invalid image file handling
 * - F23-B03: Source WAF 403 / 500 error cascade to next fallback source
 * - F23-B04: Multi-loop retry (max 3 loops per source before advancing)
 * - F23-B05: Missing optional fields (photoReviews: [], ingredients: []) without throwing
 * - F23-B06: Missing required fields (price 0 / empty name) triggers next source
 * - F23-B07: Timeout / network abort handling in scraping engine
 * - F23-B08: Special Korean characters, HTML entity escaping in extracted text
 */

import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertGreaterThan,
  assertContains,
  assertThrows
} from '../framework/assert.js';

import {
  detectInputType,
  extractOliveYoungGoodsNo,
  buildVisionPayload,
  validate10RequiredFields,
  QUALITY_CASCADE_ORDER
} from '../tier1/f23_smart_product_research.test.js';

import {
  cleanKoreanTitle
} from '../../src/services/oliveYoungScraperCore.js';

setTier('Tier 2: Boundary & Corner Cases');

/**
 * Reference Helper: Unescape HTML entities & clean special characters in Korean strings
 */
export function cleanAndUnescapeKoreanText(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Apply cleanKoreanTitle (strip promotional bracket tags like [1+1], [단독기획])
  return cleanKoreanTitle(cleaned);
}

/**
 * Reference Multi-Loop Cascade Simulator with Retry & Fallback
 */
export async function executeMultiLoopScraperWithRetry({
  sources = QUALITY_CASCADE_ORDER,
  maxRetriesPerSource = 3,
  fetchFn,
  onLog
}) {
  const logs = [];
  const log = (msg) => {
    logs.push(msg);
    if (typeof onLog === 'function') onLog(msg);
  };

  let finalProduct = null;
  let successfulSource = null;

  for (const source of sources) {
    log(`[${source}] Bắt đầu cào dữ liệu...`);
    let sourceSuccess = false;

    for (let attempt = 1; attempt <= maxRetriesPerSource; attempt++) {
      log(`[${source}] Thử vòng ${attempt}/${maxRetriesPerSource}...`);
      try {
        const res = await fetchFn(source, attempt);
        if (res && res.status === 200 && res.data) {
          // Check required fields
          const val = validate10RequiredFields(res.data);
          if (val.valid) {
            log(`✅ [${source}] Lấy đủ 10 trường thông tin thành công!`);
            finalProduct = res.data;
            successfulSource = source;
            sourceSuccess = true;
            break;
          } else {
            log(`⚠️ [${source}] Thiếu trường bắt buộc: ${val.missingFields.join(', ')}`);
          }
        } else if (res && (res.status === 403 || res.status === 500)) {
          log(`⚠️ [${source}] Lỗi máy chủ HTTP ${res.status}`);
        } else if (res && res.timeout) {
          log(`⚠️ [${source}] Quá thời gian chờ phản hồi (Timeout)`);
        }
      } catch (err) {
        log(`⚠️ [${source}] Ngoại lệ vòng ${attempt}: ${err.message}`);
      }
    }

    if (sourceSuccess) {
      break;
    } else {
      log(`❌ [${source}] Thất bại sau ${maxRetriesPerSource} vòng thử, chuyển sang nguồn kế tiếp...`);
    }
  }

  return {
    success: !!finalProduct,
    source: successfulSource,
    product: finalProduct,
    logs
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BOUNDARY TEST CASES
// ─────────────────────────────────────────────────────────────────────────────

// 1. F23-B01: Invalid / unsupported URL rejection with clear error
test('[F23-B01] Invalid / unsupported URL rejection with clear error', () => {
  // Empty, null, undefined inputs
  assertEquals(detectInputType('').type, 'unknown', 'Empty string is unknown');
  assertEquals(detectInputType(null).type, 'unknown', 'Null input is unknown');
  assertEquals(detectInputType(undefined).type, 'unknown', 'Undefined input is unknown');

  // Unsupported foreign domains (Amazon, Shopee, generic test domain)
  const amazonRes = detectInputType('https://www.amazon.com/dp/B08XYZ1234');
  assertEquals(amazonRes.type, 'url', 'Amazon is identified as url type');
  assertEquals(amazonRes.domain, 'unknown', 'Amazon domain is marked unknown');

  const randomRes = detectInputType('https://example.com/some/item?id=999');
  assertEquals(randomRes.domain, 'unknown', 'example.com domain is unknown');

  // Check validator rejecting non-object or null
  const nullValidation = validate10RequiredFields(null);
  assertEquals(nullValidation.valid, false, 'Null product is invalid');
  assert(nullValidation.errors.length > 0, 'Returns descriptive error');
});

// 2. F23-B02: Corrupt / oversized / invalid image file handling
test('[F23-B02] Corrupt / oversized / invalid image file handling', () => {
  // A. Non-image file mime type (PDF, EXE, TXT)
  assertThrows(() => {
    buildVisionPayload({ type: 'application/x-msdownload', data: 'MZ9900...' });
  }, /Unsupported image mime type/);

  assertThrows(() => {
    buildVisionPayload({ type: 'text/plain', data: 'Hello World' });
  }, /Unsupported image mime type/);

  // B. Oversized file validation simulation (> 10MB)
  const validateImageSize = (fileSizeInBytes) => {
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB limit
    if (fileSizeInBytes > MAX_IMAGE_BYTES) {
      throw new Error(`File size ${(fileSizeInBytes / (1024 * 1024)).toFixed(1)}MB exceeds maximum allowed 10MB`);
    }
    return true;
  };

  assertEquals(validateImageSize(2 * 1024 * 1024), true, '2MB image is accepted');
  assertThrows(() => {
    validateImageSize(15 * 1024 * 1024); // 15MB
  }, /exceeds maximum allowed 10MB/);

  // C. Empty input throwing assertion
  assertThrows(() => {
    buildVisionPayload(null);
  }, /Image input is required/);
});

// 3. F23-B03: Source WAF 403 / 500 error cascade to next fallback source
test('[F23-B03] Source WAF 403 / 500 error cascades gracefully to next fallback source', async () => {
  // OliveYoung returns 403 WAF block, Naver succeeds with 200
  const mockFetch = async (source) => {
    if (source === 'oliveyoung') {
      return { status: 403, error: 'WAF Cloudflare / Akamai Block' };
    }
    if (source === 'naver') {
      return {
        status: 200,
        data: {
          name: 'Nước Hồng Sâm KGC Everytime 30 Gói',
          nameKr: '정관장 홍삼정 에브리타임 30포',
          brand: 'KGC CheongKwanJang',
          foreignPrice: 52750,
          productImage: 'https://shop-phinf.pstatic.net/kgc_everytime.jpg?type=f800',
          images: ['https://shop-phinf.pstatic.net/kgc_everytime.jpg?type=f800'],
          photoReviews: [],
          ingredients: ['Hồng sâm 6 năm tuổi'],
          description: 'Bồi bổ sức khỏe tăng cường sinh lực',
          rating: 4.9,
          reviewsCount: 18450
        }
      };
    }
    return { status: 500 };
  };

  const result = await executeMultiLoopScraperWithRetry({
    sources: ['oliveyoung', 'naver', 'coupang'],
    maxRetriesPerSource: 1,
    fetchFn: mockFetch
  });

  assertEquals(result.success, true, 'Scraper cascade must succeed via Naver');
  assertEquals(result.source, 'naver', 'Winning source should be naver');
  assert(result.logs.some(l => l.includes('HTTP 403')), 'Logs should record OliveYoung 403 error');
  assert(result.logs.some(l => l.includes('✅ [naver] Lấy đủ 10 trường')), 'Logs should record Naver success');
});

// 4. F23-B04: Multi-loop retry (max 3 loops per source before advancing)
test('[F23-B04] Multi-loop retry executes up to 3 loops per source before advancing', async () => {
  let attemptCount = 0;

  // Source fails 2 times, then succeeds on attempt 3
  const mockFetch = async (source, attempt) => {
    attemptCount++;
    if (attempt < 3) {
      return { status: 500, error: 'Transient network failure' };
    }
    return {
      status: 200,
      data: {
        name: 'Serum Torriden Dive-In',
        nameKr: '토리든 다이브인 세럼',
        brand: 'Torriden',
        foreignPrice: 18000,
        productImage: 'https://image.oliveyoung.co.kr/uploads/images/goods/550/10/A000000185934.jpg',
        images: ['https://image.oliveyoung.co.kr/uploads/images/goods/550/10/A000000185934.jpg'],
        photoReviews: [],
        ingredients: ['Hyaluronic acid'],
        description: 'Cấp ẩm sâu',
        rating: 4.8,
        reviewsCount: 5000
      }
    };
  };

  const result = await executeMultiLoopScraperWithRetry({
    sources: ['oliveyoung'],
    maxRetriesPerSource: 3,
    fetchFn: mockFetch
  });

  assertEquals(attemptCount, 3, 'Must have attempted exactly 3 times before succeeding');
  assertEquals(result.success, true, 'Succeeded on 3rd attempt');
  assertEquals(result.source, 'oliveyoung', 'OliveYoung source succeeded');
});

// 5. F23-B05: Missing optional fields (photoReviews: [], ingredients: []) without throwing
test('[F23-B05] Missing optional fields (photoReviews: [], ingredients: []) handled safely without throwing', () => {
  const minimalProduct = {
    name: 'Son Kem Lì Romand Zero Velvet Tint',
    nameKr: '롬앤 제로 벨벳 틴트',
    brand: 'Romand',
    foreignPrice: 9900,
    productImage: 'https://image.oliveyoung.co.kr/uploads/images/goods/550/romand.jpg',
    images: ['https://image.oliveyoung.co.kr/uploads/images/goods/550/romand.jpg'],
    photoReviews: [],   // Empty optional review photos
    ingredients: [],    // Empty optional ingredients
    description: 'Chất son nhung mịn nhẹ môi',
    rating: 4.7,
    reviewsCount: 1200
  };

  const val = validate10RequiredFields(minimalProduct);
  assertEquals(val.valid, true, 'Product with empty optional arrays [] is completely valid');
  assertEquals(minimalProduct.photoReviews.length, 0, 'photoReviews remains empty array');
  assertEquals(minimalProduct.ingredients.length, 0, 'ingredients remains empty array');
});

// 6. F23-B06: Missing required fields (price 0 / empty name) triggers next source
test('[F23-B06] Missing required fields (price 0 or empty name) triggers next source in cascade', async () => {
  const mockFetch = async (source) => {
    if (source === 'oliveyoung') {
      // Missing price (0) and empty name
      return {
        status: 200,
        data: {
          name: '',
          nameKr: '',
          brand: 'Unknown',
          foreignPrice: 0, // Invalid price 0
          productImage: 'https://image.oliveyoung.co.kr/goods.jpg',
          images: ['https://image.oliveyoung.co.kr/goods.jpg'],
          photoReviews: [],
          ingredients: [],
          description: '',
          rating: 0,
          reviewsCount: 0
        }
      };
    }
    if (source === 'naver') {
      // Complete valid data
      return {
        status: 200,
        data: {
          name: 'Kem Dưỡng Phục Hồi Aestura Atobarrier 365',
          nameKr: '에스트라 아토베리어 365 크림',
          brand: 'Aestura',
          foreignPrice: 31000,
          productImage: 'https://shop-phinf.pstatic.net/aestura.jpg?type=f800',
          images: ['https://shop-phinf.pstatic.net/aestura.jpg?type=f800'],
          photoReviews: [],
          ingredients: ['Ceramide NP', 'Sphingolipid'],
          description: 'Củng cố hàng rào bảo vệ da 100 giờ',
          rating: 4.9,
          reviewsCount: 8900
        }
      };
    }
    return { status: 500 };
  };

  const result = await executeMultiLoopScraperWithRetry({
    sources: ['oliveyoung', 'naver'],
    maxRetriesPerSource: 1,
    fetchFn: mockFetch
  });

  assertEquals(result.success, true, 'Cascade succeeded');
  assertEquals(result.source, 'naver', 'Switched to Naver because OliveYoung lacked required price and name');
  assert(result.logs.some(l => l.includes('Thiếu trường bắt buộc')), 'Logs note missing required fields on OliveYoung');
});

// 7. F23-B07: Timeout / network abort handling in scraping engine
test('[F23-B07] Timeout and network abort handled cleanly without crashing runner', async () => {
  // Simulate abort controller signal triggering timeout
  const mockFetchWithTimeout = async (source) => {
    if (source === 'oliveyoung') {
      return { timeout: true, error: 'Request aborted due to 15000ms timeout' };
    }
    if (source === 'naver') {
      return {
        status: 200,
        data: {
          name: 'Men Vi Sinh Lacto-Fit Gold 50 Gói',
          nameKr: '종근당 락토핏 골드 50포',
          brand: 'Chong Kun Dang',
          foreignPrice: 14500,
          productImage: 'https://shop-phinf.pstatic.net/lactofit.jpg?type=f800',
          images: ['https://shop-phinf.pstatic.net/lactofit.jpg?type=f800'],
          photoReviews: [],
          ingredients: ['Probiotics 2 tỷ CFU'],
          description: 'Hỗ trợ hệ tiêu hóa và đường ruột khỏe mạnh',
          rating: 4.8,
          reviewsCount: 35000
        }
      };
    }
    return { status: 500 };
  };

  const result = await executeMultiLoopScraperWithRetry({
    sources: ['oliveyoung', 'naver'],
    maxRetriesPerSource: 1,
    fetchFn: mockFetchWithTimeout
  });

  assertEquals(result.success, true, 'Cascade continues and succeeds after timeout on first source');
  assertEquals(result.source, 'naver', 'Winning source is naver');
  assert(result.logs.some(l => l.includes('Timeout')), 'Logs record timeout event accurately');
});

// 8. F23-B08: Special Korean characters, HTML entity escaping in extracted text
test('[F23-B08] Special Korean characters, HTML entity escaping in extracted text', () => {
  const rawKoreanWithEntities = '&lt;정관장&gt; [1+1 기획] &amp; [단독특가] &quot;6년근 홍삼정 에브리타임&quot; &#39;10ml x 30포&#39;';
  const cleanTitle = cleanAndUnescapeKoreanText(rawKoreanWithEntities);

  assert(!cleanTitle.includes('&lt;'), 'Decodes &lt;');
  assert(!cleanTitle.includes('&amp;'), 'Decodes &amp;');
  assert(!cleanTitle.includes('&quot;'), 'Decodes &quot;');
  assert(!cleanTitle.includes('&#39;'), 'Decodes &#39;');
  assert(!cleanTitle.includes('[1+1 기획]'), 'Strips promo bracket [1+1 기획]');
  assert(!cleanTitle.includes('[단독특가]'), 'Strips promo bracket [단독특가]');

  assertContains(cleanTitle, '정관장', 'Preserves brand name');
  assertContains(cleanTitle, '6년근 홍삼정 에브리타임', 'Preserves Korean product title');
});
