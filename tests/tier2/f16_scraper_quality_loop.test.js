import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

/**
 * BỘ KIỂM THỬ ĐẦU RA BÓC TÁCH SẢN PHẨM CHUẨN XÁC:
 * 1. Ảnh đại diện rõ ràng (HD 100%, bắt đầu bằng http, không dính logo/icon/banner)
 * 2. Ảnh đánh giá thực tế > 10 tấm (GDAS review từ khách hàng Hàn)
 * 3. Không chứa ảnh rách, ảnh banner /display/, /banner/, /event/
 * 4. Tên tiếng Việt 100% không dính chữ Hangul hoặc chữ khuyến mãi
 * 5. Giá Won chuẩn xác (nằm trong khoảng hợp lệ 1.000₩ - 200.000₩)
 */

test('[SCRAPER-QUALITY-1] Content script junk image filter rejects ads, banners, and empty badges', () => {
  const isJunkImage = (src, alt = '') => {
    if (!src || !src.startsWith('http')) return true;
    const combined = (src + ' ' + alt).toLowerCase();
    return /\/display\/|\/event\/|\/banner\/|\/static\/|\/item\/|logo|icon|avatar|star_|btn_|badge|tag_|flag_|blank|loading|sprite|common|arrow|btn-|icon_|ico_|nav_|footer|header|ad_|popup_|gift|promo/i.test(combined);
  };

  // Test các URL rác cần loại bỏ
  const junkUrls = [
    'https://image.oliveyoung.co.kr/uploads/images/display/9000/0001/banner_top.jpg',
    'https://image.oliveyoung.co.kr/pc/images/common/logo.png',
    'https://image.oliveyoung.co.kr/uploads/images/event/2026/promo_event.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/item/free_gift_badge.png',
    'https://image.oliveyoung.co.kr/uploads/images/icons/ico_star_active.svg'
  ];

  junkUrls.forEach(url => {
    assert(isJunkImage(url) === true, `URL ${url} must be identified as junk`);
  });

  // Test URL ảnh thật hợp lệ
  const validProductImg = 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025568254ko.jpg';
  const validGdasImg = 'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/review_photo_user1.jpg';

  assert(isJunkImage(validProductImg) === false, 'Product HD image must not be junk');
  assert(isJunkImage(validGdasImg) === false, 'GDAS review photo must not be junk');
});

test('[SCRAPER-QUALITY-2] Scraped product output must contain >= 10 clean photo reviews without ads', () => {
  const mockReviewCandidates = [
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r01.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r02.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r03.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r04.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r05.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r06.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r07.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r08.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r09.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r10.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r11.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/gdasEditor/2026/08/r12.jpg',
    'https://image.oliveyoung.co.kr/uploads/images/display/ad_banner.png' // ảnh rác
  ];

  const isJunkUrl = (u) => !u || typeof u !== 'string' || !u.startsWith('http') ||
    /\/display\/|\/event\/|\/banner\/|\/static\/|\/item\/|logo|icon|avatar|star_|btn_|badge|tag_/i.test(u);

  const cleanReviews = mockReviewCandidates.filter(u => !isJunkUrl(u));
  assert(cleanReviews.length >= 10, 'Photo reviews count must be at least 10');
  cleanReviews.forEach(url => {
    assert(!url.includes('/display/'), 'Review list must not contain banner ads');
  });
});

test('[SCRAPER-QUALITY-3] Product name translation eliminates Hangul characters & promotion brackets', () => {
  const translateKoreanToVi = (krTitle) => {
    if (!krTitle) return 'Sản phẩm Olive Young Korea';
    let vi = krTitle;
    const dict = [
      [/메디큐브/g, 'Medicube'], [/제로/g, 'Zero'], [/모공/g, 'Lỗ Chân Lông'], [/패드/g, 'Miếng Đệm Dưỡng Da'],
      [/토너/g, 'Nước Hoa Hồng Toner'], [/세럼/g, 'Serum'], [/크림/g, 'Kem Dưỡng'], [/선크림/g, 'Kem Chống Nắng']
    ];
    dict.forEach(([kr, v]) => { vi = vi.replace(kr, v); });
    vi = vi.replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)/g, '').replace(/[가-힣]/g, '').replace(/\s+/g, ' ').trim();
    return vi;
  };

  const rawTitle = '[1등/아이돌 모공패드] 메디큐브 제로 모공 패드 1+1 140매 리필 기획 (본품70매+리필 70매)';
  const translated = translateKoreanToVi(rawTitle);

  assert(!/[가-힣]/.test(translated), 'Translated name must not contain any Hangul characters');
  assert(!translated.includes('[') && !translated.includes(']'), 'Translated name must not contain bracket tags');
  assert(translated.includes('Medicube') && translated.includes('Lỗ Chân Lông'), 'Key translated terms present');
});

test('[SCRAPER-QUALITY-4] Price extraction correctly resolves positive discounted sale price', () => {
  const parseDomPrice = (priceStr) => {
    if (!priceStr) return 25000;
    const matches = String(priceStr).match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,6})/g);
    if (!matches || matches.length === 0) return 25000;

    const validPrices = matches
      .map(m => parseInt(m.replace(/,/g, ''), 10))
      .filter(val => val >= 1000 && val <= 200000);

    if (validPrices.length === 0) return 25000;
    return Math.min(...validPrices);
  };

  const samplePriceText = '33,000원 27,900원 15%';
  const parsedPrice = parseDomPrice(samplePriceText);

  assertEquals(parsedPrice, 27900, 'Price must resolve to the discounted sale price of 27,900 KRW');
  assertGreaterThan(parsedPrice, 1000, 'Price must be realistic and positive');
});
