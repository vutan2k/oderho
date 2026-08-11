/**
 * Auto Scraper Bot Service for Olive Young Korea Best Sellers
 * Runs on a periodic loop (e.g., every 30 minutes), discovers trending Korean products,
 * extracts full metadata, and pushes them into the Pending Approval Staging Queue.
 */

import { scrapeProductMetadata } from './productScraperService';

// Target Olive Young Best Seller Goods Pool for periodic auto-discovery
const OLIVE_YOUNG_DISCOVERY_POOL = [
  { goodsNo: 'A000000261415', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000261415' },
  { goodsNo: 'A000000185934', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000185934' },
  { goodsNo: 'A000000159495', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495' },
  { goodsNo: 'A000000146950', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000146950' },
  { goodsNo: 'A000000201102', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000201102' },
  { goodsNo: 'A000000192301', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000192301' },
  { goodsNo: 'A000000128120', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000128120' },
  { goodsNo: 'A000000180234', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000180234' },
  { goodsNo: 'A000000171209', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000171209' }
];

let botIntervalTimer = null;

export const getBotStateFromStorage = () => {
  try {
    const isRunning = localStorage.getItem('tavy_bot_is_running') === 'true';
    const pendingJson = localStorage.getItem('tavy_pending_products');
    const pendingProducts = pendingJson ? JSON.parse(pendingJson) : [];
    const lastRun = localStorage.getItem('tavy_bot_last_run') || null;
    const intervalMins = parseInt(localStorage.getItem('tavy_bot_interval_mins')) || 30;

    return {
      isRunning,
      intervalMins,
      lastRun,
      pendingProducts
    };
  } catch (e) {
    return { isRunning: false, intervalMins: 30, lastRun: null, pendingProducts: [] };
  }
};

export const saveBotStateToStorage = (state) => {
  if (state.isRunning !== undefined) localStorage.setItem('tavy_bot_is_running', state.isRunning ? 'true' : 'false');
  if (state.pendingProducts) localStorage.setItem('tavy_pending_products', JSON.stringify(state.pendingProducts));
  if (state.lastRun) localStorage.setItem('tavy_bot_last_run', state.lastRun);
  if (state.intervalMins) localStorage.setItem('tavy_bot_interval_mins', state.intervalMins.toString());
};

/**
 * Execute a single auto-scrape run from the pool
 */
export const executeSingleBotRun = async (existingProducts = [], pendingProducts = []) => {
  // Find a product from pool that is not yet published or pending
  const publishedIds = new Set(existingProducts.map(p => p.goodsNo));
  const pendingIds = new Set(pendingProducts.map(p => p.goodsNo));

  let candidate = OLIVE_YOUNG_DISCOVERY_POOL.find(item => !publishedIds.has(item.goodsNo) && !pendingIds.has(item.goodsNo));

  if (!candidate) {
    // If all target items scraped, select random item for refresh
    const randIdx = Math.floor(Math.random() * OLIVE_YOUNG_DISCOVERY_POOL.length);
    candidate = OLIVE_YOUNG_DISCOVERY_POOL[randIdx];
  }

  const res = await scrapeProductMetadata(candidate.url);

  if (res.success && res.product) {
    const scrapedProd = {
      ...res.product,
      scrapedAt: new Date().toISOString(),
      status: 'pending_approval'
    };
    return { success: true, product: scrapedProd };
  }

  return { success: false, error: res.error || 'Cào dữ liệu thất bại' };
};
