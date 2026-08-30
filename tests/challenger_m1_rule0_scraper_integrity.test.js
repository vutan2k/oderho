/**
 * Empirical Challenger Test Suite for Milestone M1 (Rule 0 Remediation & Scraper Integrity)
 * Author: Empirical Challenger 2
 * Focus:
 * 1. Data integrity across aiScraperAgentEngine.js, naverHealthScraperEngine.js, koreanHealthScraperCore.js
 * 2. Fallback branches under failed network, empty responses, malformed JSON, uncataloged URLs
 * 3. Zero fake data assertion (Rule 0): 0 / [] honest values
 */

import { assert, assertEquals, assertDeepEquals, assertGreaterThan, assertThrows } from './framework/assert.js';
import { runAIScraperAgent } from '../src/services/aiScraperAgentEngine.js';
import {
  cleanNaverCdnImageUrl,
  isNaverJunkImage,
  parseNaverProductPayload,
  OFFICIAL_NAVER_BRAND_STORES
} from '../src/services/naverHealthScraperEngine.js';
import {
  scrapeKoreanHealthProduct,
  evaluateHealthFilterCriteria,
  VERIFIED_KOREAN_HEALTH_CATALOG
} from '../src/services/koreanHealthScraperCore.js';
import fs from 'fs';
import path from 'path';

console.log('================================================================================');
console.log('  CHALLENGER 2: EMPIRICAL STRESS TEST SUITE (RULE 0 & SCRAPER INTEGRITY)');
console.log('================================================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const testFindings = [];

function runTest(name, fn) {
  const start = performance.now();
  try {
    fn();
    const duration = performance.now() - start;
    console.log(`[PASS] ${name} (${duration.toFixed(2)}ms)`);
    totalPassed++;
  } catch (err) {
    const duration = performance.now() - start;
    console.error(`[FAIL] ${name} (${duration.toFixed(2)}ms): ${err.message}`);
    testFindings.push({ name, error: err.message, stack: err.stack });
    totalFailed++;
  }
}

async function runAsyncTest(name, fn) {
  const start = performance.now();
  try {
    await fn();
    const duration = performance.now() - start;
    console.log(`[PASS] ${name} (${duration.toFixed(2)}ms)`);
    totalPassed++;
  } catch (err) {
    const duration = performance.now() - start;
    console.error(`[FAIL] ${name} (${duration.toFixed(2)}ms): ${err.message}`);
    testFindings.push({ name, error: err.message, stack: err.stack });
    totalFailed++;
  }
}

// -----------------------------------------------------------------------------
// TEST GROUP 1: NAVER HEALTH SCRAPER ENGINE INTEGRITY & CLEANERS
// -----------------------------------------------------------------------------

runTest('[CHALLENGE-M1-01] cleanNaverCdnImageUrl edge cases (null, non-string, query stripping)', () => {
  assertEquals(cleanNaverCdnImageUrl(''), '');
  assertEquals(cleanNaverCdnImageUrl(null), '');
  assertEquals(cleanNaverCdnImageUrl(undefined), '');
  assertEquals(cleanNaverCdnImageUrl(12345), '');
  assertEquals(cleanNaverCdnImageUrl({}), '');

  const standardUrl = 'https://shop-phinf.pstatic.net/20260806/image.jpg?type=f80_80';
  assertEquals(cleanNaverCdnImageUrl(standardUrl), 'https://shop-phinf.pstatic.net/20260806/image.jpg?type=f800');

  const nonPstaticUrl = 'https://image.oliveyoung.co.kr/uploads/image.jpg?type=small';
  assertEquals(cleanNaverCdnImageUrl(nonPstaticUrl), nonPstaticUrl);
});

runTest('[CHALLENGE-M1-02] isNaverJunkImage junk detection & false positive avoidance', () => {
  assertEquals(isNaverJunkImage(''), true);
  assertEquals(isNaverJunkImage(null), true);
  assertEquals(isNaverJunkImage('https://shop-phinf.pstatic.net/banner_promo_main.jpg'), true);
  assertEquals(isNaverJunkImage('https://shop-phinf.pstatic.net/icon_new.png'), true);
  assertEquals(isNaverJunkImage('https://shop-phinf.pstatic.net/btn_submit.png'), true);
  assertEquals(isNaverJunkImage('https://shop-phinf.pstatic.net/gnb_menu_bg.png'), true);
  assertEquals(isNaverJunkImage('https://shop-phinf.pstatic.net/sp_shop_sprite.png'), true);
  assertEquals(isNaverJunkImage('https://shop-phinf.pstatic.net/promo_npay_point.jpg'), true);

  // Legitimate product image should not be marked as junk
  assertEquals(isNaverJunkImage('https://shop-phinf.pstatic.net/20260806_59/1786007625721fkLpX_JPEG/40533958083576298_2012085661.jpg'), false);
});

runTest('[CHALLENGE-M1-03] parseNaverProductPayload default values & Rule 0 honesty', () => {
  // Empty payload
  const emptyRes = parseNaverProductPayload({});
  assertEquals(emptyRes.foreignPrice, 0);
  assertEquals(emptyRes.originalPrice, 0);
  assertEquals(emptyRes.rating, 0);
  assertEquals(emptyRes.reviewsCount, 0);
  assertDeepEquals(emptyRes.photoReviews, []);
  assert(emptyRes.goodsNo.startsWith('NAVER-'));

  // Payload with string formatted price and numeric ratings
  const populated = parseNaverProductPayload({
    rawTitle: '정관장 에브리타임 밸런스 30포',
    priceWon: '₩52,000원',
    rawImages: ['https://shop-phinf.pstatic.net/product1.jpg?type=f160_160', 'https://shop-phinf.pstatic.net/banner.jpg'],
    reviewPhotos: ['https://shop-phinf.pstatic.net/review1.jpg', 'https://shop-phinf.pstatic.net/promo_npay.jpg'],
    storeBrand: 'KGC CheongKwanJang',
    sourceUrl: 'https://brand.naver.com/kgcshop/products/1234567890',
    rating: 4.85,
    reviewsCount: 1540
  });

  assertEquals(populated.goodsNo, 'NAVER-1234567890');
  assertEquals(populated.foreignPrice, 52000);
  assertEquals(populated.originalPrice, 52000);
  assertEquals(populated.rating, 4.85);
  assertEquals(populated.reviewsCount, 1540);
  assertEquals(populated.images.length, 1);
  assertEquals(populated.images[0], 'https://shop-phinf.pstatic.net/product1.jpg?type=f800');
  assertEquals(populated.photoReviews.length, 1);
  assertEquals(populated.photoReviews[0], 'https://shop-phinf.pstatic.net/review1.jpg?type=f800');
});

runTest('[CHALLENGE-M1-04] parseNaverProductPayload adversarial inputs (negative price, NaN, malformed types)', () => {
  const advRes = parseNaverProductPayload({
    rawTitle: '비타민C 1000',
    priceWon: -5000,
    rating: 'invalid_rating',
    reviewsCount: 'invalid_count',
    reviewPhotos: 'not_an_array_string'
  });

  assertEquals(advRes.foreignPrice, -5000); // Numeric conversion preserves value
  assertEquals(advRes.rating, 0); // Invalid string rating safely falls back to 0
  assertEquals(advRes.reviewsCount, 0); // Invalid string count safely falls back to 0
  assertDeepEquals(advRes.photoReviews, []); // Non-array reviewPhotos safely falls back to []
});

// -----------------------------------------------------------------------------
// TEST GROUP 2: AI SCRAPER AGENT ENGINE (OLIVE YOUNG) ADVERSARIAL FALLBACKS
// -----------------------------------------------------------------------------

await runAsyncTest('[CHALLENGE-M1-05] runAIScraperAgent with invalid / empty inputs', async () => {
  const emptyRes = await runAIScraperAgent('');
  assertEquals(emptyRes.success, false);
  assertEquals(emptyRes.error, 'URL không hợp lệ');

  const nullRes = await runAIScraperAgent(null);
  assertEquals(nullRes.success, false);
  assertEquals(nullRes.error, 'URL không hợp lệ');

  const whitespaceRes = await runAIScraperAgent('   \t\n  ');
  assertEquals(whitespaceRes.success, false);
  assertEquals(whitespaceRes.error, 'URL không hợp lệ');
});

await runAsyncTest('[CHALLENGE-M1-06] runAIScraperAgent fallback branch with simulated network failure on valid goodsNo', async () => {
  // Use an un-cached, non-resolving Olive Young goodsNo
  const url = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000999123';
  const res = await runAIScraperAgent(url);

  assert(res.success, 'Fallback should generate fallback product structure');
  assert(res.product !== undefined, 'Product object must exist');
  const p = res.product;

  assertEquals(p.goodsNo, 'A000000999123');
  // Rule 0 checks on fallback
  assertEquals(p.foreignPrice, 0, 'Fallback foreignPrice must be 0 (no fake price)');
  assertEquals(p.rating, 0, 'Fallback rating must be 0 (no fake 4.9)');
  assertEquals(p.reviewsCount, 0, 'Fallback reviewsCount must be 0 (no fake random count)');
  assertDeepEquals(p.photoReviews, [], 'Fallback photoReviews must be []');
  assertDeepEquals(p.ingredients, [], 'Fallback ingredients must be []');
  assert(p.productImage.includes('A000000999123'), 'Image URL should reference goodsNo');
});

await runAsyncTest('[CHALLENGE-M1-07] runAIScraperAgent non-goodsNo unknown URL failure handling', async () => {
  const url = 'https://www.oliveyoung.co.kr/store/main/getSpecialOfferList.do';
  const res = await runAIScraperAgent(url);

  assertEquals(res.success, false, 'Non-goodsNo unknown page should fail cleanly without inventing fake data');
  assertEquals(res.needsManualCapture, true);
});

// -----------------------------------------------------------------------------
// TEST GROUP 3: KOREAN HEALTH SCRAPER CORE & VERIFIED CATALOG
// -----------------------------------------------------------------------------

await runAsyncTest('[CHALLENGE-M1-08] scrapeKoreanHealthProduct empty input throws error', async () => {
  await assertThrows(async () => {
    await scrapeKoreanHealthProduct('');
  }, 'Vui lòng nhập đường dẫn');
});

await runAsyncTest('[CHALLENGE-M1-09] scrapeKoreanHealthProduct verified catalog lookup', async () => {
  // Test by goodsNo
  const p1 = await scrapeKoreanHealthProduct('A000000213255');
  assertEquals(p1.goodsNo, 'A000000213255');
  assertEquals(p1.brand, 'KGC CheongKwanJang (Sâm Chính Phủ)');
  assertEquals(p1.foreignPrice, 52750);
  assertEquals(p1.rating, 4.9);
  assertEquals(p1.reviewsCount, 18450);
  assert(p1.filterEvaluation !== undefined);
  assertEquals(p1.filterEvaluation.passed, true);

  // Test by legacyCode
  const p2 = await scrapeKoreanHealthProduct('NAVER-KGC-SOFT-50');
  assertEquals(p2.goodsNo, '10556547785');
  assertEquals(p2.foreignPrice, 79000);
});

await runAsyncTest('[CHALLENGE-M1-10] scrapeKoreanHealthProduct uncataloged dynamic Olive Young health link', async () => {
  const url = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000888777';
  const p = await scrapeKoreanHealthProduct(url);

  assertEquals(p.goodsNo, 'A000000888777');
  assertEquals(p.foreignPrice, 0, 'Uncataloged dynamic health product must have foreignPrice = 0');
  assertEquals(p.originalPrice, 0);
  assertEquals(p.rating, 0, 'Uncataloged dynamic health product must have rating = 0');
  assertEquals(p.reviewsCount, 0, 'Uncataloged dynamic health product must have reviewsCount = 0');
  assertDeepEquals(p.photoReviews, []);
});

await runAsyncTest('[CHALLENGE-M1-11] scrapeKoreanHealthProduct uncataloged dynamic Nonghyup / KGC link', async () => {
  const url = 'https://www.nhmall.kr/goods/detail.do?goodsNo=NH999999';
  const p = await scrapeKoreanHealthProduct(url);

  assertEquals(p.brand, 'Hansamin Nonghyup (Nông Hiệp Hàn Quốc)');
  assertEquals(p.foreignPrice, 0);
  assertEquals(p.rating, 0);
  assertEquals(p.reviewsCount, 0);
  assertDeepEquals(p.photoReviews, []);
});

await runAsyncTest('[CHALLENGE-M1-12] [ADVERSARIAL STRESS] scrapeKoreanHealthProduct uncataloged Naver Brand Store link', async () => {
  const url = 'https://brand.naver.com/unknown_brand/products/9876543210';
  const p = await scrapeKoreanHealthProduct(url);

  console.log(`   [Observation on uncataloged Naver URL]: foreignPrice=${p.foreignPrice}, rating=${p.rating}, reviewsCount=${p.reviewsCount}`);

  // Check if foreignPrice is honest 0 or hardcoded 45000
  if (p.foreignPrice === 45000) {
    throw new Error(`Rule 0 violation detected: uncataloged Naver URL returned hardcoded priceWon 45000 instead of honest 0 at koreanHealthScraperCore.js:484`);
  }
  assertEquals(p.foreignPrice, 0);
  assertEquals(p.rating, 0);
  assertEquals(p.reviewsCount, 0);
});

// -----------------------------------------------------------------------------
// TEST GROUP 4: REPO-WIDE STATIC HONESTY SCAN
// -----------------------------------------------------------------------------

runTest('[CHALLENGE-M1-13] Zero Math.random in all scraper engines and scripts', () => {
  const filesToScan = [
    'src/services/aiScraperAgentEngine.js',
    'src/services/naverHealthScraperEngine.js',
    'src/services/koreanHealthScraperCore.js',
    'scripts/firecrawl_scraper.js',
    'scripts/playwright_ai_scraper.js'
  ];

  for (const relPath of filesToScan) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(/Math\.random/g);
    assertEquals(matches, null, `Found Math.random in ${relPath}: ${matches ? matches.length : 0} occurrences`);
  }
});

runTest('[CHALLENGE-M1-14] Zero hardcoded fallback ratings in AdminProductSourcing.jsx', () => {
  const fullPath = path.resolve(process.cwd(), 'src/components/AdminProductSourcing.jsx');
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Look for patterns like `rating: prod.rating || 4.9` or `reviewsCount: prod.reviewsCount || 1500`
  const fakeRatingPattern = /rating:\s*(?:prod\.rating\s*\|\|\s*4\.|4\.9|item\.rating\s*\|\|\s*4\.)/g;
  const matches = content.match(fakeRatingPattern);
  assertEquals(matches, null, `Found hardcoded fake rating defaults in AdminProductSourcing.jsx: ${matches ? matches.join(', ') : ''}`);
});

console.log('\n================================================================================');
console.log(`CHALLENGER 2 SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
console.log('================================================================================\n');

if (totalFailed > 0) {
  console.log(`Detected ${totalFailed} finding(s) requiring attention:`);
  testFindings.forEach((f, i) => {
    console.log(`\n${i + 1}) Test: ${f.name}`);
    console.log(`   Error: ${f.error}`);
  });
}
