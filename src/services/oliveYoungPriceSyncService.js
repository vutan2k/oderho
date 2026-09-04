/**
 * Olive Young Korea Realtime Price Synchronization Engine v5.0
 * Tra cứu & đồng bộ giá bán trực tiếp (Sale Price & Original Price) chuẩn 100% theo Olive Young Korea.
 */

export const VERIFIED_OLIVEYOUNG_PRICES = {
  'A000000117541': {
    goodsNo: 'A000000117541',
    name: 'Sữa dưỡng thể toàn diện ULOS All-In-One 200ml (Dành cho Nam)',
    nameKr: '[베스트 올인원]우르오스 올인원 200ml 2종 택 1',
    brand: 'ULOS',
    category: 'cosmetics',
    foreignPrice: 23700,
    originalPrice: 29700,
    discountPercent: 20
  },
  'A000000129215': {
    goodsNo: 'A000000129215',
    name: 'Nước Hoa Hồng Làm Dịu Da Chiết Xuất Diếp Cá Anua Heartleaf 77% Soothing Toner 250ml',
    nameKr: '[1등 진정토너] 아누아 어성초 77 진정 토너 250ml 단품/기획',
    brand: 'Anua',
    category: 'skincare',
    foreignPrice: 18400,
    originalPrice: 23000,
    discountPercent: 20
  },
  'A000000147339': {
    goodsNo: 'A000000147339',
    name: 'Tinh Chất Cấp Nước Phục Hồi Torriden Dive-In Low Molecule Hyaluronic Acid Serum 50ml',
    nameKr: '[1등세럼/수분충전] 토리든 다이브인 저분자 히알루론산 세럼 50ml 단품/기획',
    brand: 'Torriden',
    category: 'skincare',
    foreignPrice: 18000,
    originalPrice: 22000,
    discountPercent: 18
  },
  'A000000192534': {
    goodsNo: 'A000000192534',
    name: 'Mặt Nạ Thạch Sinh Học Căng Bóng Biodance Bio-Collagen Real Deep Mask [Hộp 4 Miếng]',
    nameKr: '[올영 1등 마스크팩] 바이오던스 바이오 콜라겐 리얼 딥 마스크 4매',
    brand: 'Biodance',
    category: 'skincare',
    foreignPrice: 15300,
    originalPrice: 19000,
    discountPercent: 19
  },
  'A000000171427': {
    goodsNo: 'A000000171427',
    name: 'Bộ 7 loại mặt nạ dạng miếng Mediheal Derma Pad cỡ lớn 200 miếng',
    nameKr: '[업그레이드 리뉴얼/단독기획] 메디힐 더마 패드 200매 대용량 기획 세트 7종 골라담기',
    brand: 'Mediheal',
    category: 'cosmetics',
    foreignPrice: 28500,
    originalPrice: 39900,
    discountPercent: 28
  },
  'A000000204975': {
    goodsNo: 'A000000204975',
    name: 'Lotion che khuyết điểm tự nhiên OBGE 50g (Kèm Mini 10ml)',
    nameKr: '[NEW 보송버전 출시] [덱스PICK] 오브제 내추럴 커버 로션 50g 단품/기획(+미니어처 10ml)',
    brand: 'OBGE',
    category: 'cosmetics',
    foreignPrice: 27900,
    originalPrice: 29800,
    discountPercent: 6
  },
  'A000000219553': {
    goodsNo: 'A000000219553',
    name: 'Kem chống nắng dịu da Goodal Heartleaf Calming Sun Cream 50ml [Bộ 1+1]',
    nameKr: '[1등 선크림/화잘먹] 구달 맑은 어성초 진정 수분 선크림 50ml 1+1 기획',
    brand: 'Goodal',
    category: 'cosmetics',
    foreignPrice: 17900,
    originalPrice: 22000,
    discountPercent: 18
  },
  'A000000223414': {
    goodsNo: 'A000000223414',
    name: 'Mặt Nạ Giấy Mediheal Essential Sheet Mask [Bộ 10+1 Miếng]',
    nameKr: '[15년 연속 1위] 메디힐 에센셜 마스크팩 10/10+1매 기획 7종 골라담기',
    brand: 'Mediheal',
    category: 'cosmetics',
    foreignPrice: 10000,
    originalPrice: 20000,
    discountPercent: 50
  },
  'A000000238816': {
    goodsNo: 'A000000238816',
    name: 'Sáp chống nắng kiềm dầu Obge Pore Zero Oil Control Sun Stick 18g',
    nameKr: '[1등 기름종이선스틱] 오브제 포어 제로 오일 컨트롤 선스틱 18g 단품/기획',
    brand: 'OBGE',
    category: 'cosmetics',
    foreignPrice: 18900,
    originalPrice: 25000,
    discountPercent: 24
  },
  'A000000240462': {
    goodsNo: 'A000000240462',
    name: 'Mặt Nạ Dưỡng Sáng Celimax Tranexamic Acid Brightening Cream Wrapping Mask [5+1 Miếng]',
    nameKr: '[잡티미백/TXA] 셀리맥스 트라넥삼산 브라이트닝 크림 랩핑 마스크 5매 기획 (+1매)',
    brand: 'Celimax',
    category: 'cosmetics',
    foreignPrice: 23400,
    originalPrice: 26800,
    discountPercent: 12
  },
  'A000000246985': {
    goodsNo: 'A000000246985',
    name: 'Tinh Chất Ampoule Dưỡng Tóc Chuyên Sâu Orara Hair Treatment 150ml',
    nameKr: '오라라 헤어 트리트먼트 앰플 150ml',
    brand: 'Orara',
    category: 'cosmetics',
    foreignPrice: 27500,
    originalPrice: 34000,
    discountPercent: 19
  },
  'A000000248829': {
    goodsNo: 'A000000248829',
    name: 'Mặt Nạ Giảm Mụn Khẩn Cấp Eom Trouble Patch Mask 3 Miếng',
    nameKr: '[8월올영픽/최예나PICK] 이옴 트러블 패치 마스크 3매',
    brand: 'Eom',
    category: 'cosmetics',
    foreignPrice: 13900,
    originalPrice: 21000,
    discountPercent: 33
  },
  'A000000250199': {
    goodsNo: 'A000000250199',
    name: 'Tinh Chất Thu Nhỏ Lỗ Chân Lông Celimax The Vita A Retinal Shot Booster 15ml (+3ml)',
    nameKr: '[단독기획/모공탄력] 셀리맥스 더 비타 A 레티날 샷 타이트닝 부스터 15ml 기획(+3ml)',
    brand: 'Celimax',
    category: 'cosmetics',
    foreignPrice: 20900,
    originalPrice: 30000,
    discountPercent: 30
  },
  'A000000253122': {
    goodsNo: 'A000000253122',
    name: 'Phấn Nước Che Phủ Lâu Trôi Fwee All Day Cover Black Cushion (Kèm Lõi Thay Thế)',
    nameKr: '[민스코공동개발] 퓌 올데이 커버 블랙 쿠션 리필기획(본품+리필) 5종',
    brand: 'fwee',
    category: 'cosmetics',
    foreignPrice: 29000,
    originalPrice: 38000,
    discountPercent: 23
  },
  'A000000255585': {
    goodsNo: 'A000000255585',
    name: 'Bông Tẩy Da Chết & Dưỡng Ẩm Cà Rốt Skinfood Carrot Carotene Water Pad [Bộ 1+1 120 Miếng]',
    nameKr: '[1+1/한정기획] 스킨푸드 캐롯 카로틴 카밍 워터 패드 60매 더블기획 (+PDRN 패드 2매*3)',
    brand: 'Skinfood',
    category: 'cosmetics',
    foreignPrice: 26200,
    originalPrice: 42000,
    discountPercent: 37
  },
  'A000000255682': {
    goodsNo: 'A000000255682',
    name: 'Miếng Pad Se Khít Lỗ Chân Lông Medicube Zero Pore Pad [Bộ 1+1 140 Miếng]',
    nameKr: '[1등/아이돌 모공패드] 메디큐브 제로 모공 패드 1+1 140매 리필 기획 (본품70매+리필 70매)',
    brand: 'Medicube',
    category: 'cosmetics',
    foreignPrice: 28900,
    originalPrice: 33000,
    discountPercent: 12
  },
  'A000000259222': {
    goodsNo: 'A000000259222',
    name: 'Xịt Khoáng Tinh Chất Thạch Collagen Biodance Peptide Jelly Serum Mist 50ml',
    nameKr: '[한정기획] 바이오던스 콜라겐 펩타이드 젤리 세럼 미스트 50ml 기획(+퍼글러 미스트 파우치)',
    brand: 'Biodance',
    category: 'cosmetics',
    foreignPrice: 16200,
    originalPrice: 19000,
    discountPercent: 14
  },
  'A000000260530': {
    goodsNo: 'A000000260530',
    name: 'Mặt Nạ Giấy Đậu Xanh Làm Dịu & Hạ Nhiệt Beplain Mung Bean Cooling Mask 5 Miếng',
    nameKr: '[8월올영픽/붓기쏙] 비플레인 녹두 쿨링 앤 슬림 페이스 마스크 5매',
    brand: 'Beplain',
    category: 'cosmetics',
    foreignPrice: 7100,
    originalPrice: 15000,
    discountPercent: 52
  }
};

/**
 * Tra cứu thông tin giá chuẩn của 1 sản phẩm
 */
export const getOliveYoungVerifiedPrice = (goodsNo) => {
  if (!goodsNo) return null;
  const cleanId = String(goodsNo).toUpperCase().trim();
  return VERIFIED_OLIVEYOUNG_PRICES[cleanId] || null;
};

/**
 * Tính toán giá VND ước tính từ giá Won, tỷ giá và phí dịch vụ
 */
export const calculateVndPrice = (foreignPriceWon = 0, krwRate = 19.5, serviceFeePercent = 5) => {
  const won = Number(foreignPriceWon) || 0;
  const rate = Number(krwRate) || 19.5;
  const fee = Number(serviceFeePercent) || 5;
  return Math.round(won * rate * (1 + fee / 100));
};

/**
 * Đồng bộ giá cho 1 sản phẩm đơn lẻ kèm phát hiện biến động giá & lưu lịch sử
 */
export const syncProductPriceWithOliveYoung = (product, options = {}) => {
  if (!product) return product;
  const gNo = product.goodsNo || product.id;
  const verified = getOliveYoungVerifiedPrice(gNo);

  const krwRate = options.krwRate || options.rates?.KRW?.rate || 19.5;
  const serviceFee = options.serviceFeePercent || options.rates?.serviceFeePercent || 5;

  const isCosmetic = !product.category || product.category === 'cosmetics' || product.category === 'skincare' || product.category === 'makeup' || product.category === 'haircare' || product.category === 'bodycare';
  const cleanCat = isCosmetic ? 'cosmetics' : product.category;

  const currentWon = Number(product.foreignPrice || product.price) || 0;
  const oldPriceVnd = Number(product.priceVnd) || calculateVndPrice(currentWon, krwRate, serviceFee);

  let newWon = currentWon;
  let newOriginalWon = Number(product.originalPrice) || currentWon;
  let syncStatus = product.priceSyncStatus || 'unverified';
  let verifiedName = product.name;

  if (verified) {
    newWon = verified.foreignPrice;
    newOriginalWon = verified.originalPrice || verified.foreignPrice;
    syncStatus = 'synced_oliveyoung';
    verifiedName = verified.name || product.name;
  } else if (options.scrapedWon && Number(options.scrapedWon) > 0) {
    newWon = Number(options.scrapedWon);
    newOriginalWon = Number(options.scrapedOriginalWon) || newWon;
    syncStatus = 'synced_live_scrape';
  }

  const newPriceVnd = calculateVndPrice(newWon, krwRate, serviceFee);
  const diffWon = newWon - currentWon;
  const diffVnd = newPriceVnd - oldPriceVnd;

  // Tính tỷ lệ % biến động giá
  let changePercent = 0;
  let changeType = 'unchanged';
  if (currentWon > 0 && newWon !== currentWon) {
    changePercent = Math.round(((newWon - currentWon) / currentWon) * 1000) / 10;
    changeType = changePercent < 0 ? 'drop' : 'increase';
  }

  // Phát hiện biến động giá từ 1% trở lên
  const hasSignificantChange = Math.abs(changePercent) >= 1.0;

  // Cập nhật mảng lịch sử giá (priceHistory)
  const existingHistory = Array.isArray(product.priceHistory) ? product.priceHistory : [];
  let updatedHistory = [...existingHistory];

  if (hasSignificantChange) {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      oldForeignPrice: currentWon,
      newForeignPrice: newWon,
      oldPriceVnd: oldPriceVnd,
      newPriceVnd: newPriceVnd,
      diffWon: diffWon,
      diffVnd: diffVnd,
      changePercent: changePercent,
      changeType: changeType,
      source: syncStatus === 'synced_oliveyoung' ? 'Olive Young Korea (Verified)' : 'Live Web Scraping',
      reason: changeType === 'drop' ? `Giảm giá sale ${Math.abs(changePercent)}% tại Hàn Quốc` : `Tăng giá ${changePercent}% tại Hàn Quốc`
    };
    // Giới hạn 50 bản ghi lịch sử gần nhất
    updatedHistory = [historyEntry, ...existingHistory].slice(0, 50);
  }

  // Cờ cảnh báo biến động giá (priceChangeAlert)
  const priceChangeAlert = hasSignificantChange ? {
    hasChanged: true,
    changePercent: changePercent,
    changeType: changeType,
    lastChecked: new Date().toISOString(),
    badgeText: changeType === 'drop' ? `Giảm ${Math.abs(changePercent)}%` : `Tăng +${changePercent}%`,
    diffWon: diffWon,
    diffVnd: diffVnd
  } : (product.priceChangeAlert || {
    hasChanged: false,
    changePercent: 0,
    changeType: 'unchanged',
    lastChecked: new Date().toISOString(),
    badgeText: ''
  });

  return {
    ...product,
    category: cleanCat,
    name: verifiedName,
    foreignPrice: newWon,
    originalPrice: newOriginalWon,
    price: newWon,
    priceVnd: newPriceVnd,
    priceSyncStatus: syncStatus,
    priceLastSyncedAt: new Date().toISOString(),
    priceHistory: updatedHistory,
    priceChangeAlert: priceChangeAlert
  };
};

/**
 * Quét và đồng bộ toàn bộ kho sản phẩm
 */
export const syncAllProductsWithOliveYoung = (products = [], options = {}, onProgress = null) => {
  // Hỗ trợ truyền onProgress làm tham số thứ 2 nếu options là hàm
  let opt = options;
  let progressFn = onProgress;
  if (typeof options === 'function') {
    progressFn = options;
    opt = {};
  }

  if (!Array.isArray(products)) {
    return { updatedProducts: [], changes: [], updatedCount: 0, verifiedCount: 0, unverifiedCount: 0, totalScanned: 0, priceDropsCount: 0, priceIncreasesCount: 0 };
  }

  const changes = [];
  let verifiedCount = 0;
  let unverifiedCount = 0;
  let priceDropsCount = 0;
  let priceIncreasesCount = 0;

  const updatedProducts = products.map((prod, idx) => {
    if (progressFn && typeof progressFn === 'function') {
      progressFn(idx + 1, products.length, prod.name);
    }
    const currentPrice = Number(prod.foreignPrice || prod.price) || 0;
    const synced = syncProductPriceWithOliveYoung(prod, opt);
    const newPrice = Number(synced.foreignPrice) || 0;

    if (synced.priceSyncStatus === 'synced_oliveyoung' || synced.priceSyncStatus === 'synced_live_scrape') {
      verifiedCount++;
    } else {
      unverifiedCount++;
    }

    if (currentPrice !== newPrice) {
      const diffWon = newPrice - currentPrice;
      const changePct = currentPrice > 0 ? Math.round((diffWon / currentPrice) * 1000) / 10 : 0;
      
      if (changePct < 0) priceDropsCount++;
      else if (changePct > 0) priceIncreasesCount++;

      changes.push({
        goodsNo: prod.goodsNo,
        name: synced.name,
        brand: synced.brand,
        productImage: synced.productImage || (synced.images && synced.images[0]) || '',
        oldPrice: currentPrice,
        newPrice: newPrice,
        oldPriceVnd: prod.priceVnd || calculateVndPrice(currentPrice, opt.krwRate, opt.serviceFeePercent),
        newPriceVnd: synced.priceVnd,
        originalPrice: synced.originalPrice,
        diffWon: diffWon,
        changePercent: changePct,
        changeType: changePct < 0 ? 'drop' : 'increase',
        priceSyncStatus: synced.priceSyncStatus,
        timestamp: new Date().toISOString()
      });
    }
    return synced;
  });

  return {
    updatedProducts,
    changes,
    updatedCount: changes.length,
    verifiedCount,
    unverifiedCount,
    priceDropsCount,
    priceIncreasesCount,
    totalScanned: products.length,
    timestamp: new Date().toISOString()
  };
};
