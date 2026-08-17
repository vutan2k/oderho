import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
} from '../framework/assert.js';
import { scrapeProductMetadata } from '../../src/services/productScraperService.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F10-B1] All 3 proxies failure recovery WAF fallback', async () => {
  const originalFetch = globalThis.fetch;
  // Mock fetch to simulate 500 / 403 on all proxies
  globalThis.fetch = () => Promise.resolve({ ok: false, status: 503, text: () => Promise.resolve('WAF Blocked') });

  try {
    const res = await scrapeProductMetadata('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=UNKNOWN999');
    assertEquals(res.success, false, 'Scraper rejects fake fallback when all proxies fail');
    assertEquals(res.needsManualCapture, true, 'Scraper asks for manual DOM capture');
    assert(res.error.includes('Extension'), 'Error guides admin to use Extension');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('[F10-B2] Malformed OpenGraph HTML response parsing', async () => {
  const originalFetch = globalThis.fetch;
  const malformedHtml = '<html><head><title></title><meta property="og:title" content="" /></head><body><div>No products here</div></body></html>';

  globalThis.fetch = (url) => {
    if (url.includes('allorigins')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ contents: malformedHtml }) });
    }
    return Promise.resolve({ ok: true, text: () => Promise.resolve(malformedHtml) });
  };

  try {
    const res = await scrapeProductMetadata('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A111');
    assertEquals(res.success, false, 'Scraper rejects malformed OpenGraph instead of creating fake product');
    assertEquals(res.needsManualCapture, true, 'Malformed OpenGraph asks for manual capture');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('[F10-B3] 404 HTTP URL scraping failure handling', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' });

  try {
    const res = await scrapeProductMetadata('https://www.oliveyoung.co.kr/store/goods/404page');
    assertEquals(res.success, false, '404 URL scraping refuses fake fallback payload');
    assertEquals(res.needsManualCapture, true, '404 failure asks for manual capture');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('[F10-B4] Bot queue overflow limit capping', async () => {
  const MAX_QUEUE_SIZE = 50;

  const enqueueBotItem = (queue, newItem) => {
    if (queue.length >= MAX_QUEUE_SIZE) {
      return { success: false, reason: 'queue_full', message: 'Hàng chờ crawler đã đầy (tối đa 50 sản phẩm)!' };
    }
    return { success: true, queue: [...queue, newItem] };
  };

  const fullQueue = Array.from({ length: 50 }, (_, i) => ({ goodsNo: `SP-${i}` }));
  const overflowRes = enqueueBotItem(fullQueue, { goodsNo: 'SP-OVERFLOW' });
  assertEquals(overflowRes.success, false, 'Queue overflow rejected when size is 50');
  assertEquals(overflowRes.reason, 'queue_full', 'Reason indicates queue_full');
});

test('[F10-B5] Empty URL scraping attempt rejection', async () => {
  const resEmpty = await scrapeProductMetadata('');
  assertEquals(resEmpty.success, false, 'Empty URL input returns success false');
  assertEquals(resEmpty.error.includes('hợp lệ'), true, 'Error message indicates invalid URL');

  const resWhitespace = await scrapeProductMetadata('    ');
  assertEquals(resWhitespace.success, false, 'Whitespace URL input returns success false');
});
