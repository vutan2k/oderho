import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertGreaterThan
} from '../framework/assert.js';
import {
  calculateVndPrice,
  syncProductPriceWithOliveYoung,
  syncAllProductsWithOliveYoung
} from '../../src/services/oliveYoungPriceSyncService.js';
import {
  executeAutoPriceSync,
  getRecentPriceAlerts
} from '../../src/services/autoScraperBotService.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F22-B1] Empty product inventory handles gracefully without throwing', async () => {
  const result1 = syncAllProductsWithOliveYoung([]);
  assertEquals(result1.totalScanned, 0, 'Empty inventory scanned 0');
  assertEquals(result1.updatedCount, 0, 'Empty inventory updated 0');

  const result2 = syncAllProductsWithOliveYoung(null);
  assertEquals(result2.totalScanned, 0, 'Null inventory scanned 0');

  const execRes = await executeAutoPriceSync([]);
  assertEquals(execRes.success, false, 'executeAutoPriceSync returns false on empty inventory');
});

test('[F22-B2] Price changes below 1% do not trigger false positive alert', () => {
  const product = {
    goodsNo: 'CUSTOM_STABLE_1',
    name: 'Sản phẩm giá ổn định',
    foreignPrice: 10000,
    price: 10000,
    category: 'cosmetics'
  };

  // Change from 10,000 to 10,050 is only +0.5%
  const synced = syncProductPriceWithOliveYoung(product, { scrapedWon: 10050 });
  assertEquals(synced.foreignPrice, 10050, 'Price updated to 10,050');
  assertEquals(synced.priceChangeAlert.hasChanged, false, 'Change < 1% should not set hasChanged=true');
  assertEquals(synced.priceHistory.length, 0, 'No history entry created for sub-1% fluctuations');
});

test('[F22-B3] Unverified product without live scrape retains existing price and sets unverified status', () => {
  const customProd = {
    goodsNo: 'UNKNOWN_BRAND_X',
    name: 'Sản phẩm nội địa chưa xác minh',
    foreignPrice: 18000,
    price: 18000,
    category: 'cosmetics'
  };

  const synced = syncProductPriceWithOliveYoung(customProd);
  assertEquals(synced.foreignPrice, 18000, 'Price remains untouched');
  assertEquals(synced.priceSyncStatus, 'unverified', 'Status set to unverified');
  assertEquals(synced.priceChangeAlert.hasChanged, false, 'No false alert');
});

test('[F22-B4] priceHistory capping at maximum 50 entries to prevent memory bloat', () => {
  const existing55History = Array.from({ length: 55 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    oldForeignPrice: 20000 + i * 100,
    newForeignPrice: 20000 + (i + 1) * 100,
    changePercent: 5.0,
    changeType: 'increase'
  }));

  const product = {
    goodsNo: 'A000000223414',
    foreignPrice: 25000,
    price: 25000,
    priceHistory: existing55History
  };

  const synced = syncProductPriceWithOliveYoung(product);
  assert(synced.priceHistory.length <= 50, `priceHistory length (${synced.priceHistory.length}) must be capped at 50 max`);
});

test('[F22-B5] Null, undefined, malformed product objects handled gracefully', () => {
  assertEquals(syncProductPriceWithOliveYoung(null), null, 'Null product returns null');
  assertEquals(syncProductPriceWithOliveYoung(undefined), undefined, 'Undefined product returns undefined');

  const malformed = { id: 'MALFORMED', price: 'invalid_price' };
  const synced = syncProductPriceWithOliveYoung(malformed);
  assert(synced !== null, 'Malformed product returns sanitized object');
  assertEquals(synced.foreignPrice, 0, 'Invalid price defaults to 0');
});

test('[F22-B6] getRecentPriceAlerts with invalid inputs returns empty array', () => {
  assertDeepEquals(getRecentPriceAlerts(null), [], 'Null products returns empty array');
  assertDeepEquals(getRecentPriceAlerts(undefined), [], 'Undefined products returns empty array');
  assertDeepEquals(getRecentPriceAlerts('not an array'), [], 'Non-array returns empty array');
});
