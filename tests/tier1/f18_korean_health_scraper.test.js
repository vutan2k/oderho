import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
} from '../framework/assert.js';
import {
  translateKoreanHealthTitle,
  categorizeHealthProduct,
  extractActiveIngredients,
  generateHealthUsageGuide
} from '../../src/utils/koreanHealthDictionary.js';
import {
  VERIFIED_KOREAN_HEALTH_CATALOG,
  scrapeKoreanHealthProduct,
  evaluateHealthFilterCriteria
} from '../../src/services/koreanHealthScraperCore.js';

setTier('Tier 1: Feature Coverage');

test('[F18-1] Korean Health dictionary translation accuracy for Ginseng & Supplements', () => {
  const kr1 = '[정관장] 6년근 홍삼정 에브리타임 10ml x 30포 [건강기능식품]';
  const vi1 = translateKoreanHealthTitle(kr1);
  assertContains(vi1, 'KGC CheongKwanJang', 'Translates CheongKwanJang brand');
  assertContains(vi1, 'Cao Hồng Sâm', 'Translates Red Ginseng extract');
  assertContains(vi1, '6 Năm Tuổi', 'Translates 6-year Red Ginseng');
  assertContains(vi1, 'Everytime', 'Translates Everytime extract');

  const kr2 = '[종근당건강] 락토핏 생유산균 골드 50포 [국민 유산균]';
  const vi2 = translateKoreanHealthTitle(kr2);
  assertContains(vi2, 'Chong Kun Dang Health', 'Translates Chong Kun Dang brand');
  assertContains(vi2, 'Men Vi Sinh Lợi Khuẩn Sống', 'Translates Probiotics');
});

test('[F18-2] Automatic categorization for Ginseng vs Supplements', () => {
  assertEquals(categorizeHealthProduct('6년근 홍삼정 240g', '정관장'), 'ginseng', 'Cao hồng sâm is categorized as ginseng');
  assertEquals(categorizeHealthProduct('자연산 영지버섯 500g', '농협'), 'ginseng', 'Nấm linh chi is categorized as ginseng');
  assertEquals(categorizeHealthProduct('락토핏 생유산균 골드', '종근당'), 'supplements', 'Lacto-Fit is categorized as supplements');
  assertEquals(categorizeHealthProduct('비타민C 1000 120정', '고려은단'), 'supplements', 'Vitamin C is categorized as supplements');
});

test('[F18-3] Bioactive and nutrition ingredient extraction (Ginsenoside, CFU, Vitamin C)', () => {
  const text1 = '6년근 홍삼농축액 100% 진세노사이드 Rg1+Rb1+Rg3 11.6mg 함유';
  const ings1 = extractActiveIngredients(text1);
  assert(ings1.length >= 1, 'Should extract ginsenoside active ingredients');
  assertContains(ings1[0], '11.6mg', 'Extracted ginsenoside amount is accurate');

  const text2 = '살아있는 생유산균 20억 CFU 함유 프로바이오틱스';
  const ings2 = extractActiveIngredients(text2);
  assert(ings2.length >= 1, 'Should extract CFU count');
  assertContains(ings2[0], '20억 CFU', 'Extracted 2 billion CFU');
});

test('[F18-4] 3-Tier Filter Evaluation (Best Seller, Rating >= 4.7, Reviews >= 500, GMP/MFDS)', () => {
  const goodProduct = VERIFIED_KOREAN_HEALTH_CATALOG[0]; // KGC Everytime (4.9★, 18,450 reviews, GMP)
  const evalGood = evaluateHealthFilterCriteria(goodProduct);
  assertEquals(evalGood.passed, true, 'Top product passes 3-tier health criteria');
  assertEquals(evalGood.score >= 90, true, 'Score is at least 90/100');

  const poorProduct = {
    name: 'Sản phẩm thử nghiệm',
    rating: 3.5,
    reviewsCount: 12,
    isVerifiedHealthFood: false,
    isGmpCertified: false
  };
  const evalPoor = evaluateHealthFilterCriteria(poorProduct);
  assertEquals(evalPoor.passed, false, 'Poor product fails 3-tier criteria');
  assert(evalPoor.reasons.length >= 2, 'Gives clear failure reasons');
});

test('[F18-5] Dynamic Multi-Source Health Scraper execution and price conversion', async () => {
  const res = await scrapeKoreanHealthProduct('A000000213255');
  assert(res !== null, 'Scraped object exists');
  assertEquals(res.goodsNo, 'A000000213255', 'GoodsNo matches KGC Everytime');
  assertEquals(res.brand, 'KGC CheongKwanJang (Sâm Chính Phủ)', 'Brand is verified');
  assertEquals(res.foreignPrice, 52750, 'Exact Won price 52,750 W');
  assert(res.photoReviews.length >= 1, 'Contains unboxing customer review photos');
  assert(res.filterEvaluation.passed, 'Passed filter evaluation');
});
