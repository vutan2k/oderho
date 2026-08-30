import { scrapeProductMetadata } from './productScraperService';
import { syncProductPriceWithOliveYoung, syncAllProductsWithOliveYoung } from './oliveYoungPriceSyncService';

// Target Olive Young Best Seller Goods Pool (Verified Real URLs)
const OLIVE_YOUNG_DISCOVERY_POOL = [
  // === SKINCARE TOP SELLERS ===
  { goodsNo: 'A000000261415', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000261415' },
  { goodsNo: 'A000000185934', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000185934' },
  { goodsNo: 'A000000159495', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495' },
  { goodsNo: 'A000000146950', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000146950' },
  { goodsNo: 'A000000201102', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000201102' },
  { goodsNo: 'A000000192301', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000192301' },
  { goodsNo: 'A000000128120', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000128120' },
  { goodsNo: 'A000000180234', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000180234' },
  { goodsNo: 'A000000171209', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000171209' },
  { goodsNo: 'A000000199881', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000199881' },
  { goodsNo: 'A000000215560', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000215560' },
  // === ADDITIONAL SKINCARE ===
  { goodsNo: 'A000000241810', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000241810' },
  { goodsNo: 'A000000251003', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000251003' },
  { goodsNo: 'A000000265512', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000265512' },
  { goodsNo: 'A000000272104', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000272104' },
  { goodsNo: 'A000000280991', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000280991' },
  // === MAKEUP ===
  { goodsNo: 'A000000133022', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000133022' },
  { goodsNo: 'A000000155003', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000155003' },
  { goodsNo: 'A000000162881', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000162881' },
  { goodsNo: 'A000000170022', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000170022' },
  { goodsNo: 'A000000190154', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000190154' },
  // === HEALTH & SUPPLEMENT ===
  { goodsNo: 'A000000221201', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000221201' },
  { goodsNo: 'A000000235448', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000235448' },
  { goodsNo: 'A000000247903', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000247903' },
  { goodsNo: 'A000000258114', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000258114' },
  // === PHARMACY / DRUGSTORE ===
  { goodsNo: 'A000000143301', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000143301' },
  { goodsNo: 'A000000156789', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000156789' },
];

// In-memory fallback store for Node.js / CLI environments where window.localStorage is not present
const memoryStore = new Map();
const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      return memoryStore.has(key) ? memoryStore.get(key) : null;
    } catch {
      return memoryStore.has(key) ? memoryStore.get(key) : null;
    }
  },
  setItem: (key, val) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, String(val));
      memoryStore.set(key, String(val));
    } catch {
      memoryStore.set(key, String(val));
    }
  },
  removeItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      memoryStore.delete(key);
    } catch {
      memoryStore.delete(key);
    }
  }
};

export const getBotStateFromStorage = () => {
  try {
    const isRunning = safeStorage.getItem('tavy_bot_is_running') === 'true';
    const pendingJson = safeStorage.getItem('tavy_pending_products');
    const pendingProducts = pendingJson ? JSON.parse(pendingJson) : [];
    const lastRun = safeStorage.getItem('tavy_bot_last_run') || null;
    const intervalMins = parseInt(safeStorage.getItem('tavy_bot_interval_mins'), 10) || 30;
    return { isRunning, intervalMins, lastRun, pendingProducts };
  } catch (e) {
    return { isRunning: false, intervalMins: 30, lastRun: null, pendingProducts: [] };
  }
};

export const saveBotStateToStorage = (state) => {
  if (state.isRunning !== undefined) safeStorage.setItem('tavy_bot_is_running', state.isRunning ? 'true' : 'false');
  if (state.pendingProducts) safeStorage.setItem('tavy_pending_products', JSON.stringify(state.pendingProducts));
  if (state.lastRun) safeStorage.setItem('tavy_bot_last_run', state.lastRun);
  if (state.intervalMins) safeStorage.setItem('tavy_bot_interval_mins', state.intervalMins.toString());
};

// =========================================================================
// AI PRICE SYNC BOT & AUTO-SCHEDULER (PERIODIC PRICE ANCHORING & VOLATILITY WATCHER)
// =========================================================================
export const getPriceSyncConfig = () => {
  try {
    const enabled = safeStorage.getItem('tavy_price_sync_enabled') === 'true';
    const intervalMins = parseInt(safeStorage.getItem('tavy_price_sync_interval'), 10) || 60;
    const intervalHours = intervalMins >= 60 ? Math.round(intervalMins / 60) : 1;
    const lastSyncTime = safeStorage.getItem('tavy_price_sync_last_time') || null;
    const logsJson = safeStorage.getItem('tavy_price_sync_logs');
    const logs = logsJson ? JSON.parse(logsJson) : [];
    const statsJson = safeStorage.getItem('tavy_price_sync_stats');
    const stats = statsJson ? JSON.parse(statsJson) : { totalScanned: 0, totalDrops: 0, totalIncreases: 0, lastRunCount: 0 };
    return { enabled, intervalMins, intervalHours, lastSyncTime, logs, stats };
  } catch (e) {
    return { enabled: false, intervalMins: 60, intervalHours: 1, lastSyncTime: null, logs: [], stats: { totalScanned: 0, totalDrops: 0, totalIncreases: 0, lastRunCount: 0 } };
  }
};

export const savePriceSyncConfig = (config) => {
  if (config.enabled !== undefined) safeStorage.setItem('tavy_price_sync_enabled', config.enabled ? 'true' : 'false');
  if (config.intervalMins !== undefined) safeStorage.setItem('tavy_price_sync_interval', config.intervalMins.toString());
  else if (config.intervalHours !== undefined) safeStorage.setItem('tavy_price_sync_interval', (config.intervalHours * 60).toString());
  if (config.lastSyncTime !== undefined) safeStorage.setItem('tavy_price_sync_last_time', config.lastSyncTime);
  if (config.logs) safeStorage.setItem('tavy_price_sync_logs', JSON.stringify(config.logs.slice(-150))); // Keep last 150 logs
  if (config.stats) safeStorage.setItem('tavy_price_sync_stats', JSON.stringify(config.stats));
};

export const clearPriceSyncLogs = () => {
  try {
    safeStorage.removeItem('tavy_price_sync_logs');
    safeStorage.setItem('tavy_price_sync_logs', '[]');
    return true;
  } catch {
    return false;
  }
};

/**
 * Lọc danh sách các sản phẩm đang có cảnh báo biến động giá hoặc giảm giá sâu
 */
export const getRecentPriceAlerts = (products = []) => {
  if (!Array.isArray(products)) return [];
  return products.filter(p => {
    if (p.priceChangeAlert && p.priceChangeAlert.hasChanged) return true;
    if (Array.isArray(p.priceHistory) && p.priceHistory.length > 0) {
      const latest = p.priceHistory[0];
      return latest && Math.abs(latest.changePercent) >= 1.0;
    }
    return false;
  });
};

/**
 * Execute Auto Price Sync across inventory products anchored to Olive Young
 * @param {Array} products Current products list
 * @param {Function} updateProductFn Callback function to update product in DB
 * @param {Object} options Configuration & callbacks (rates, onProgress, onLog)
 */
export const executeAutoPriceSync = async (products = [], updateProductFn = null, options = {}) => {
  if (!products || products.length === 0) {
    if (options.onLog && typeof options.onLog === 'function') {
      options.onLog('⚠️ Kho hàng trống, không có sản phẩm nào để đồng bộ giá.', 'warning');
    }
    return { success: false, message: 'Kho hàng trống, không có sản phẩm nào để neo giá!' };
  }

  const onLog = (msg, type = 'info') => {
    if (options.onLog && typeof options.onLog === 'function') {
      options.onLog(msg, type);
    }
  };

  onLog(`🚀 Bắt đầu quét & đồng bộ biến động giá cho ${products.length} sản phẩm trong kho hàng...`, 'info');

  const syncResult = syncAllProductsWithOliveYoung(products, {
    krwRate: options.rates?.KRW?.rate || options.krwRate || 19.5,
    serviceFeePercent: options.rates?.serviceFeePercent || options.serviceFeePercent || 5
  }, (current, total, name) => {
    if (options.onProgress && typeof options.onProgress === 'function') {
      options.onProgress(current, total, name);
    }
  });

  // Cập nhật từng sản phẩm nếu có callback
  if (updateProductFn && typeof updateProductFn === 'function') {
    for (const prod of syncResult.updatedProducts) {
      updateProductFn(prod.goodsNo, prod);
    }
  }

  const syncTime = syncResult.timestamp;
  const existingConfig = getPriceSyncConfig();

  // Log chi tiết từng biến động giá
  syncResult.changes.forEach(change => {
    const isDrop = change.changeType === 'drop';
    const tag = isDrop ? '🔻 GIẢM GIÁ' : '🔺 TĂNG GIÁ';
    const logType = isDrop ? 'success' : 'alert';
    onLog(`${tag} [${change.brand}] ${change.name}: ${change.oldPrice.toLocaleString('vi-VN')}₩ ➔ ${change.newPrice.toLocaleString('vi-VN')}₩ (${change.changePercent > 0 ? '+' : ''}${change.changePercent}%)`, logType);
  });

  if (syncResult.changes.length === 0) {
    onLog(`✅ Toàn bộ ${syncResult.totalScanned} sản phẩm đều khớp giá 100% với Olive Young Hàn Quốc.`, 'success');
  } else {
    onLog(`✨ Đã đồng bộ hoàn tất! Phát hiện ${syncResult.priceDropsCount} sản phẩm giảm giá, ${syncResult.priceIncreasesCount} sản phẩm tăng giá.`, 'success');
  }

  // Kết hợp logs & stats mới
  const formattedChanges = syncResult.changes.map(c => ({
    ...c,
    id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  }));

  const newLogs = [...formattedChanges, ...(existingConfig.logs || [])].slice(0, 150);
  const newStats = {
    totalScanned: (existingConfig.stats?.totalScanned || 0) + syncResult.totalScanned,
    totalDrops: (existingConfig.stats?.totalDrops || 0) + (syncResult.priceDropsCount || 0),
    totalIncreases: (existingConfig.stats?.totalIncreases || 0) + (syncResult.priceIncreasesCount || 0),
    lastRunCount: syncResult.updatedCount,
    lastRunTime: syncTime
  };

  savePriceSyncConfig({
    enabled: existingConfig.enabled,
    intervalMins: existingConfig.intervalMins,
    lastSyncTime: syncTime,
    logs: newLogs,
    stats: newStats
  });

  return {
    success: true,
    scannedCount: syncResult.totalScanned,
    updatedCount: syncResult.updatedCount,
    priceDropsCount: syncResult.priceDropsCount || 0,
    priceIncreasesCount: syncResult.priceIncreasesCount || 0,
    priceChanges: syncResult.changes,
    timestamp: syncTime,
    message: syncResult.updatedCount > 0
      ? `Đã quét ${syncResult.totalScanned} sản phẩm, phát hiện & tự động cập nhật giá chuẩn cho ${syncResult.updatedCount} sản phẩm (${syncResult.priceDropsCount} giảm giá, ${syncResult.priceIncreasesCount} tăng giá)!`
      : `Đã quét ${syncResult.totalScanned} sản phẩm: Tất cả sản phẩm đều đang chuẩn xác 100% theo giá Olive Young!`
  };
};

/**
 * Execute a single auto-scrape run — chỉ dùng URL thực, KHÔNG tạo fake data
 */
export const executeSingleBotRun = async (existingProducts = [], pendingProducts = []) => {
  const publishedIds = new Set(existingProducts.map(p => p.goodsNo));
  const pendingIds = new Set(pendingProducts.map(p => p.goodsNo));

  const candidate = OLIVE_YOUNG_DISCOVERY_POOL.find(
    item => !publishedIds.has(item.goodsNo) && !pendingIds.has(item.goodsNo)
  );

  // Khi hết toàn bộ URL pool → thông báo Admin bổ sung link thay vì tạo fake data
  if (!candidate) {
    return {
      success: false,
      reason: 'pool_exhausted',
      message: 'Bot đã cào hết tất cả URL trong danh sách. Admin vui lòng bổ sung link sản phẩm mới vào Tab Bot.'
    };
  }

  // Scrape URL thực từ Olive Young
  const res = await scrapeProductMetadata(candidate.url);

  if (res.success && res.product) {
    return {
      success: true,
      product: {
        ...res.product,
        scrapedAt: new Date().toISOString(),
        status: 'pending_approval'
      }
    };
  }

  // Network fail → thông báo lỗi, KHÔNG tạo fake data
  return {
    success: false,
    reason: 'network_error',
    message: `Không thể cào URL: ${candidate.url}. Có thể Olive Young đang chặn request.`
  };
};
