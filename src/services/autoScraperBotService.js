import { scrapeProductMetadata } from './productScraperService';

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

export const getBotStateFromStorage = () => {
  try {
    const isRunning = localStorage.getItem('tavy_bot_is_running') === 'true';
    const pendingJson = localStorage.getItem('tavy_pending_products');
    const pendingProducts = pendingJson ? JSON.parse(pendingJson) : [];
    const lastRun = localStorage.getItem('tavy_bot_last_run') || null;
    const intervalMins = parseInt(localStorage.getItem('tavy_bot_interval_mins')) || 30;
    return { isRunning, intervalMins, lastRun, pendingProducts };
  } catch (err) {
    console.warn("Lỗi đọc trạng thái AutoBot từ storage:", err);
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
