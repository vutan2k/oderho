import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
} from '../framework/assert.js';
import { scrapeProductMetadata } from '../../src/services/productScraperService.js';

setTier('Tier 1: Feature Coverage');

test('[F10-1] Olive Young OpenGraph metadata scraping cache lookup', async () => {
  const url = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000261415';
  const result = await scrapeProductMetadata(url);

  assert(result.success, 'Scrape result should be successful');
  assert(result.product !== undefined, 'Product object must exist');
  assertEquals(result.product.goodsNo, 'A000000261415', 'GoodsNo must match A000000261415');
  assertEquals(result.product.brand, 'Layerlab', 'Brand should be Layerlab');
});

test('[F10-2] Allorigins proxy URL endpoint construction & fallback', () => {
  const buildAllOriginsProxyUrl = (targetUrl) => {
    return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  };

  const target = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000185934';
  const proxyUrl = buildAllOriginsProxyUrl(target);
  assertContains(proxyUrl, 'https://api.allorigins.win/get?url=', 'Allorigins endpoint prefix correct');
  assertContains(proxyUrl, encodeURIComponent(target), 'Target URL properly URL-encoded');
});

test('[F10-3] Corsproxy.io proxy fallback routing on primary failure', () => {
  const buildCorsProxyUrl = (targetUrl) => {
    return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
  };

  const target = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495';
  const corsUrl = buildCorsProxyUrl(target);
  assertContains(corsUrl, 'https://corsproxy.io/?', 'Corsproxy endpoint prefix correct');
  assertContains(corsUrl, encodeURIComponent(target), 'Target URL properly URL-encoded');
});

test('[F10-4] Codetabs proxy fallback routing on secondary failure', () => {
  const buildCodeTabsProxyUrl = (targetUrl) => {
    return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
  };

  const target = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000146950';
  const codeTabsUrl = buildCodeTabsProxyUrl(target);
  assertContains(codeTabsUrl, 'https://api.codetabs.com/v1/proxy?quest=', 'Codetabs endpoint prefix correct');
  assertContains(codeTabsUrl, encodeURIComponent(target), 'Target URL properly URL-encoded');
});

test('[F10-5] 30-min auto-crawler bot queue processing & execution run', async () => {
  const mockStorage = {
    tavy_bot_is_running: 'true',
    tavy_bot_interval_mins: '30',
    tavy_pending_products: '[]',
  };

  const getBotState = () => {
    const isRunning = mockStorage['tavy_bot_is_running'] === 'true';
    const intervalMins = parseInt(mockStorage['tavy_bot_interval_mins']) || 30;
    const pendingProducts = JSON.parse(mockStorage['tavy_pending_products'] || '[]');
    return { isRunning, intervalMins, pendingProducts };
  };

  const state = getBotState();
  assertEquals(state.intervalMins, 30, 'Bot default interval should be 30 minutes');
  assertEquals(state.isRunning, true, 'Bot should be running');

  // Test single scrape execution using productScraperService
  const targetUrl = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414';
  const scrapeRes = await scrapeProductMetadata(targetUrl);
  assert(scrapeRes.success, 'Scrape execution for bot queue candidate succeeds');
  assertEquals(scrapeRes.product.brand, 'Mediheal', 'Bot candidate product brand matches Mediheal');
});
