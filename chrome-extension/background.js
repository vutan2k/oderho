// background.js - Service Worker v6.0 AI Pro (Jina AI Reader + 100% Vietnamese Translation + Stop Button Control)

let isStopRequested = false;

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return '';
  return rawTitle.replace(/\[[^\]]+\]/g, '').trim();
};

const translateKoreanToVi = (krTitle) => {
  if (!krTitle) return 'Sản phẩm Olive Young Korea';
  let vi = krTitle;
  const dict = [
    [/바이오던스/g, 'Biodance'], [/포어 퍼펙팅/g, 'Thu Nhỏ Lỗ Chân Lông'], [/콜라겐/g, 'Collagen'], [/펩타이드/g, 'Peptide'],
    [/비플레인/g, 'Beplain'], [/녹두/g, 'Đậu Xanh'], [/약산성/g, 'pH Cân Bằng'], [/화이트/g, 'White'], [/스테이쿨/g, 'Stay Cool'],
    [/생리대/g, 'Băng Vệ Sinh'], [/중형/g, 'Size M'], [/대형/g, 'Size L'], [/구달/g, 'Goodal'], [/어성초/g, 'Rau Diếp Cá'],
    [/진정/g, 'Làm Dịu Da'], [/블레미쉬/g, 'Giảm Mụn Thâm'], [/선비비/g, 'Kem BB Chống Nắng'], [/뉴트럴베이지/g, 'Beige Tự Nhiên'],
    [/라이트베이지/g, 'Beige Sáng'], [/딜라이트/g, 'Delight'], [/프로젝트/g, 'Project'], [/단백질쉐이크/g, 'Sữa Lắc Protein'],
    [/택1/g, 'Tùy Chọn 1'], [/어노브/g, 'UNOVE'], [/딥 데미지/g, 'Phục Hồi Sâu Sơ Rối'], [/리페어/g, 'Phục Hồi'],
    [/헤어/g, 'Tóc'], [/트리트먼트/g, 'Ủ Tóc Treatment'], [/헤어팩/g, 'Mặt Nạ Tóc'], [/듀오/g, 'Bộ Đôi'],
    [/4년 연속 1위/g, 'Top 1 4 Năm Liền'], [/오브제/g, 'Objet'], [/퍼펙트/g, 'Perfect'], [/커버/g, 'Che Phủ'], [/쿠션/g, 'Phấn Nước Cushion'],
    [/셀리맥스/g, 'Celimax'], [/레이어랩/g, 'Layerlab'], [/메디힐/g, 'Mediheal'], [/라운드랩/g, 'Round Lab'],
    [/클리오/g, 'Clio'], [/롬앤/g, 'Romand'], [/조선미녀/g, 'Beauty of Joseon'], [/에스쁘아/g, 'Espoir'],
    [/아누아/g, 'Anua'], [/토리든/g, 'Torriden'], [/마녀공장/g, 'Manyo Factory'], [/달바/g, "d'Alba"],
    [/스킨1004/g, 'Skin1004'], [/넘버즈인/g, 'Numbuzin'], [/트라넥삼산/g, 'Tranexamic Acid'],
    [/판테놀/g, 'Panthenol B5'], [/브라이트닝/g, 'Làm Sáng Da'], [/인텐시브/g, 'Phục Hồi Sâu'],
    [/크림/g, 'Kem Dưỡng'], [/랩핑/g, 'Phục Hồi Hàng Rào'], [/마스크/g, 'Mặt Nạ'], [/기획/g, 'Bộ Đặc Biệt'],
    [/단독/g, 'Độc Quyền Olive Young'], [/세트/g, 'Bộ'], [/5매/g, '5 Miếng'], [/10매/g, '10 Miếng'],
    [/\(\+1매\)/g, '(Tặng 1 Miếng)'], [/\(1\+1\)/g, '(Mua 1 Tặng 1)'], [/잡티미백/g, 'Giảm Thâm Làm Sáng Da'],
    [/TXA/g, 'Tranexamic Acid'], [/선크림/g, 'Kem Chống Nắng'], [/세럼/g, 'Tinh Chất Serum'],
    [/앰플/g, 'Tinh Chất Ampoule'], [/토너/g, 'Nước Hoa Hồng Toner'], [/클렌징/g, 'Sữa Rửa Mặt Tẩy Trang'], [/패드/g, 'Bông Dưỡng Da Pad'],
    [/더블/g, 'Bộ Kép'], [/잡티/g, 'Giảm Thâm'], [/선/g, 'Chống Nắng']
  ];
  dict.forEach(([kr, v]) => { vi = vi.replace(kr, v); });
  // Loại bỏ các ký tự tiếng Hàn còn sót lại trong tên tiếng Việt
  vi = vi.replace(/\[[^\]]*\]/g, '').replace(/[가-힣]/g, '').replace(/\s+/g, ' ').trim();
  return vi || krTitle;
};

// =========================================================================
// THUẬT TOÁN XOAY VÒNG ROUND-ROBIN CHO GOOGLE GEMINI AI (v20.0 PRO)
// Sử dụng các mô hình chính thức ổn định, chống rate limit 429
// =========================================================================
const ALL_SUPPORTED_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

let globalModelRotationIndex = 0;

const getRotatedModelsList = () => {
  const rotated = [];
  const len = ALL_SUPPORTED_MODELS.length;
  for (let i = 0; i < len; i++) {
    const idx = (globalModelRotationIndex + i) % len;
    rotated.push(ALL_SUPPORTED_MODELS[idx]);
  }
  globalModelRotationIndex = (globalModelRotationIndex + 1) % len;
  return rotated;
};

const extractCleanBrand = (rawData, aiBrand) => {
  if (aiBrand && typeof aiBrand === 'string' && aiBrand.trim().length > 0 && aiBrand !== 'Olive Young Korea') {
    return aiBrand.trim();
  }
  const brandText = rawData?.brandText || '';
  if (brandText) {
    const clean = brandText.replace(/[\n\r]/g, '').trim();
    if (clean) return clean;
  }
  const title = rawData?.title || '';
  const match = title.match(/\[(.*?)\]/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return 'Olive Young Korea';
};

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

// Hàm đồng bộ trực tiếp sản phẩm cào vào Cloud Firestore (pending_products) qua REST API (v20.0 PRO)
const saveProductToFirestoreRest = async (product) => {
  try {
    const goodsNo = product.goodsNo || `SP-${Date.now()}`;
    const endpoint = `https://firestore.googleapis.com/v1/projects/tavyorder/databases/(default)/documents/pending_products/${goodsNo}`;
    
    const formatArray = (arr) => {
      const clean = (arr || []).filter(u => u && typeof u === 'string' && u.trim().length > 0);
      if (clean.length === 0) {
        return { arrayValue: {} };
      }
      return {
        arrayValue: {
          values: clean.map(u => ({ stringValue: String(u) }))
        }
      };
    };

    const docFields = {
      goodsNo: { stringValue: String(product.goodsNo || '') },
      name: { stringValue: String(product.name || '') },
      nameKr: { stringValue: String(product.nameKr || '') },
      brand: { stringValue: String(product.brand || '') },
      brandKr: { stringValue: String(product.brandKr || '') },
      category: { stringValue: String(product.category || 'cosmetics') },
      subCategory: { stringValue: String(product.subCategory || 'skincare') },
      foreignPrice: { doubleValue: Number(product.foreignPrice || product.price || 25000) },
      price: { doubleValue: Number(product.price || 25000) },
      originalPrice: { doubleValue: Number(product.originalPrice || product.price || 25000) },
      discountPercent: { integerValue: String(product.discountPercent || 0) },
      capacity: { stringValue: String(product.capacity || '') },
      skinType: { stringValue: String(product.skinType || '') },
      ingredients: { stringValue: String(product.ingredients || '') },
      expirationDate: { stringValue: String(product.expirationDate || '') },
      productImage: { stringValue: String(product.productImage || '') },
      images: formatArray(product.images),
      detailImages: formatArray(product.detailImages),
      photoReviews: formatArray(product.photoReviews),
      rating: { doubleValue: Number(product.rating || 4.8) },
      reviewsCount: { integerValue: String(product.reviewsCount || (product.photoReviews && product.photoReviews.length) || 0) },
      description: { stringValue: String(product.description || '') },
      usage: { stringValue: String(product.usage || '') },
      origin: { stringValue: String(product.origin || 'Store Olive Young Korea') },
      options: formatArray(Array.isArray(product.options) ? product.options : [product.options || '1 Hộp']),
      productUrl: { stringValue: String(product.productUrl || '') },
      scrapedAt: { stringValue: product.scrapedAt || new Date().toISOString() }
    };

    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: docFields })
    });
    
    if (!res.ok) {
      const errTxt = await res.text();
      console.warn("[Background] Firestore REST sync status:", res.status, errTxt);
    } else {
      console.log("[Background] Đã đồng bộ Firestore REST thành công cho:", goodsNo);
    }
  } catch (err) {
    console.warn("[Background] Lỗi Firestore REST sync:", err);
  }
};

// Hàm gửi dữ liệu sản phẩm lên Admin tab
const sendProductToAdminTab = (goodsNoOrObj, name, nameKr, price, mainImage, albumImages, photoReviews, brand, brandKr, category, description, usage, url, extra = {}) => {
  let fullProductData;
  if (typeof goodsNoOrObj === 'object' && goodsNoOrObj !== null) {
    fullProductData = {
      goodsNo: goodsNoOrObj.goodsNo || `SP-${Date.now()}`,
      name: goodsNoOrObj.name || 'Sản phẩm Olive Young',
      nameKr: goodsNoOrObj.nameKr || goodsNoOrObj.name || '',
      foreignPrice: goodsNoOrObj.foreignPrice || goodsNoOrObj.price || 25000,
      price: goodsNoOrObj.price || goodsNoOrObj.foreignPrice || 25000,
      originalPrice: goodsNoOrObj.originalPrice || goodsNoOrObj.price || 25000,
      discountPercent: goodsNoOrObj.discountPercent || 0,
      productImage: goodsNoOrObj.productImage || (goodsNoOrObj.images && goodsNoOrObj.images[0]) || '',
      images: (goodsNoOrObj.images && goodsNoOrObj.images.length > 0) ? goodsNoOrObj.images : (goodsNoOrObj.productImage ? [goodsNoOrObj.productImage] : []),
      detailImages: goodsNoOrObj.detailImages || [],
      photoReviews: goodsNoOrObj.photoReviews || [],
      brand: goodsNoOrObj.brand || 'Olive Young Korea',
      brandKr: goodsNoOrObj.brandKr || goodsNoOrObj.brand || '올리브영',
      category: goodsNoOrObj.category || 'cosmetics',
      subCategory: goodsNoOrObj.subCategory || 'skincare',
      capacity: goodsNoOrObj.capacity || '',
      skinType: goodsNoOrObj.skinType || '',
      ingredients: goodsNoOrObj.ingredients || '',
      expirationDate: goodsNoOrObj.expirationDate || '',
      options: goodsNoOrObj.options || ['1 Hộp'],
      origin: goodsNoOrObj.origin || 'Store Olive Young Korea',
      description: goodsNoOrObj.description || `Sản phẩm chính hãng nội địa Hàn Quốc. Tên gốc: ${goodsNoOrObj.nameKr || ''}`,
      usage: goodsNoOrObj.usage || 'Xem chi tiết trên bao bì.',
      rating: goodsNoOrObj.rating || 4.8,
      reviewsCount: goodsNoOrObj.reviewsCount || (goodsNoOrObj.photoReviews && goodsNoOrObj.photoReviews.length) || 180,
      productUrl: goodsNoOrObj.productUrl || '',
      scrapedAt: goodsNoOrObj.scrapedAt || new Date().toISOString()
    };
  } else {
    fullProductData = {
      goodsNo: goodsNoOrObj || `SP-${Date.now()}`,
      name: name || 'Sản phẩm Olive Young',
      nameKr: nameKr || name || '',
      foreignPrice: price || 25000,
      price: price || 25000,
      originalPrice: extra.originalPrice || price || 25000,
      discountPercent: extra.discountPercent || 0,
      productImage: mainImage || (albumImages && albumImages[0]) || '',
      images: (albumImages && albumImages.length > 0) ? albumImages : (mainImage ? [mainImage] : []),
      detailImages: extra.detailImages || [],
      photoReviews: photoReviews || [],
      brand: brand || 'Olive Young Korea',
      brandKr: brandKr || brand || '올리브영',
      category: category || 'cosmetics',
      subCategory: extra.subCategory || 'skincare',
      capacity: extra.capacity || '',
      skinType: extra.skinType || '',
      ingredients: extra.ingredients || '',
      expirationDate: extra.expirationDate || '',
      options: extra.options || ['1 Hộp'],
      origin: extra.origin || 'Store Olive Young Korea',
      description: description || `Sản phẩm chính hãng nội địa Hàn Quốc. Tên gốc: ${nameKr}`,
      usage: usage || 'Xem chi tiết trên bao bì.',
      rating: extra.rating || 4.8,
      reviewsCount: extra.reviewsCount || (photoReviews && photoReviews.length) || 180,
      productUrl: url || '',
      scrapedAt: new Date().toISOString()
    };
  }

  // Đồng bộ trực tiếp vào Cloud Firestore pending_products collection qua REST API
  saveProductToFirestoreRest(fullProductData).catch(err => console.warn('Firestore REST sync:', err));

  // 1. Kiểm tra xem có Tab Admin nào đang mở không (Hỗ trợ song song cả Vercel và Firebase theo RULE 5)
  const targetUrls = [
    "https://tavyorder.web.app/admin/*",
    "https://tavyorder.web.app/*",
    "https://oderho.vercel.app/admin/*",
    "https://oderho.vercel.app/*",
    "http://localhost/*",
    "http://localhost:*/*",
    "http://127.0.0.1:*/*"
  ];

  chrome.tabs.query({ url: targetUrls }, (tabs) => {
    let sentSuccess = false;

    if (tabs && tabs.length > 0) {
      tabs.forEach(t => {
        if (t.id) {
          try {
            chrome.tabs.sendMessage(t.id, {
              type: 'TAVY_NEW_SCRAPED_PRODUCT',
              payload: fullProductData
            }, () => {
              if (chrome.runtime.lastError) {}
            });
            sentSuccess = true;
          } catch {}
        }
      });
    }

    // 2. Nếu không có tab Admin nào mở, mới bật 1 tab ngầm ngắn gọn làm fallback
    if (!sentSuccess) {
      const compactPayload = {
        g: fullProductData.goodsNo,
        n: String(fullProductData.name).slice(0, 100),
        nk: String(fullProductData.nameKr).slice(0, 100),
        fp: fullProductData.price,
        p: fullProductData.price,
        op: fullProductData.originalPrice || fullProductData.price,
        img: fullProductData.productImage,
        imgs: fullProductData.images.slice(0, 5),
        b: String(fullProductData.brand).slice(0, 35),
        cat: fullProductData.category,
        sub: fullProductData.subCategory,
        cap: fullProductData.capacity,
        d: String(fullProductData.description).slice(0, 120),
        u: String(fullProductData.usage).slice(0, 80),
        url: fullProductData.productUrl
      };

      const jsonStr = JSON.stringify(compactPayload);
      const encodedData = btoa(encodeURIComponent(jsonStr));
      const adminUrl = `https://tavyorder.web.app/admin/dashboard?autoFill=${encodedData}`;

      chrome.tabs.create({ url: adminUrl, active: false }, (adminTab) => {
        setTimeout(() => {
          if (adminTab && adminTab.id) {
            try { chrome.tabs.remove(adminTab.id); } catch {}
          }
        }, 3500);
      });
    }

    // Tự động lưu vào Scraped Registry để phục vụ nhận diện sản phẩm trùng lặp
    const gNo = fullProductData.goodsNo;
    if (gNo) {
      chrome.storage.local.get(['scrapedGoodsList', 'scrapedGoodsRegistry'], (storage) => {
        const list = new Set(storage?.scrapedGoodsList || []);
        const reg = storage?.scrapedGoodsRegistry || {};
        list.add(gNo);
        reg[gNo] = {
          goodsNo: gNo,
          name: fullProductData.name,
          nameKr: fullProductData.nameKr,
          price: fullProductData.price,
          productUrl: fullProductData.productUrl,
          productImage: fullProductData.productImage,
          scrapedAt: reg[gNo]?.scrapedAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        chrome.storage.local.set({
          scrapedGoodsList: Array.from(list),
          scrapedGoodsRegistry: reg
        });
      });
    }
  });
};

// Tải dữ liệu thật qua Jina Reader (Vượt 100% WAF Olive Young)
const fetchOliveYoungPageData = async (goodsNo, itemUrl) => {
  const targetUrl = itemUrl || `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`;
  try {
    const jinaUrl = `https://r.jina.ai/${targetUrl}`;
    const res = await fetch(jinaUrl);
    if (res.ok) {
      const text = await res.text();
      
      // Kiểm tra nếu bị trang xác thực WAF bot
      if (/잠시만\s*기다려|Access\s*Denied|Security\s*Check|robot/i.test(text)) {
        console.warn("Bị WAF Bot Challenge trên Jina cho mã:", goodsNo);
        return null;
      }

      const titleMatch = text.match(/###\s*([^\n]+)/) || text.match(/Title:\s*([^\n]+)/i);
      let rawTitle = titleMatch ? titleMatch[1].replace(/\|\s*올리브영/g, '').trim() : '';

      if (!rawTitle || /잠시만\s*기다려|Access\s*Denied|Security\s*Check/i.test(rawTitle)) {
        return null;
      }

      const priceMatches = text.match(/([0-9]{1,3}(?:,[0-9]{3})+)\s*원/g) || [];
      const parsedPrices = priceMatches.map(p => parseInt(p.replace(/[^0-9]/g, ''), 10)).filter(n => n >= 1000 && n <= 200000);
      const cleanDomPrice = parsedPrices.length > 0 ? Math.min(...parsedPrices) : 25000;

      // LẤY CHÍNH XÁC CÁC LINK ẢNH THỰC TẾ HOẠT ĐỘNG
      const imgMatches = Array.from(new Set(text.match(/https?:\/\/[^\s\)\?\#]+\.(?:jpg|png|jpeg)/gi) || []))
        .filter(u => /image\.oliveyoung\.co\.kr/i.test(u) && !/logo|icon|avatar|star|banner|event|static/i.test(u));

      return {
        goodsNo,
        title: rawTitle,
        image: imgMatches[0] || '',
        images: imgMatches.slice(0, 10),
        photoReviews: imgMatches.slice(10, 24),
        priceText: priceMatches.join(' '),
        domPrice: cleanDomPrice,
        brandText: '',
        fullText: text.slice(0, 10000),
        url: targetUrl
      };
    }
  } catch (e) {
    console.warn("Lỗi Jina Reader:", e);
  }

  return null;
};

const runBackgroundRankingScrape = async () => {
  isStopRequested = false;
  try {
    await chrome.storage.local.set({
      autoScrapeStatus: {
        isRunning: true,
        step: 'FETCHING_RANKING_PAGE',
        message: 'Đang tải dữ liệu 50 sản phẩm Ranking Olive Young...',
        processedCount: 0,
        totalCount: 0
      }
    });

    const rankingJinaUrl = 'https://r.jina.ai/https://www.oliveyoung.co.kr/store/main/getBestList.do';
    let html = '';
    try {
      const r = await fetch(rankingJinaUrl);
      if (r.ok) html = await r.text();
    } catch {}

    if (!html || /잠시만\s*기다려|Access\s*Denied/i.test(html)) {
      const res = await fetch('https://www.oliveyoung.co.kr/store/main/getBestList.do');
      if (res.ok) html = await res.text();
    }

    const matches = Array.from(html.matchAll(/goodsNo=([A-Za-z0-9_]+)/gi));
    const goodsMap = new Map();
    matches.forEach(m => {
      if (m && m[1]) {
        const goodsNo = m[1].toUpperCase();
        if (!goodsMap.has(goodsNo)) {
          goodsMap.set(goodsNo, `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`);
        }
      }
    });
    const allFound = Array.from(goodsMap.entries()).map(([goodsNo, url]) => ({ goodsNo, url })).slice(0, 50);

    const storage = await new Promise(resolve => chrome.storage.local.get(['scrapedGoodsList', 'geminiApiKey'], resolve));
    const scrapedGoodsList = new Set(storage?.scrapedGoodsList || []);
    
    // Subagent lọc mã trùng: Phân loại danh sách mã mới và mã trùng trước khi cào sâu
    const newItems = [];
    let skippedCount = 0;

    for (const item of allFound) {
      if (scrapedGoodsList.has(item.goodsNo)) {
        skippedCount++;
        console.log(`⏩ [Subagent Bỏ Qua Mã Trùng] Mã ${item.goodsNo} đã tồn tại -> Bỏ qua không cào các bước tiếp theo!`);
      } else {
        newItems.push(item);
      }
    }

    if (newItems.length === 0) {
      await chrome.storage.local.set({
        autoScrapeStatus: {
          isRunning: false,
          step: 'DONE',
          message: `Đã bỏ qua ${skippedCount} mã đã trùng trong hệ thống! Không phát sinh cào thừa.`,
          processedCount: skippedCount,
          totalCount: allFound.length
        }
      });
      return;
    }

    let completed = 0;
    for (const item of newItems) {
      // KIỂM TRA CÔNG TẮC DỪNG GIỮA CHỪNG
      if (isStopRequested) {
        await chrome.storage.local.set({
          autoScrapeStatus: {
            isRunning: false,
            step: 'STOPPED',
            message: `Đã dừng cào ngầm thành công (Đã cào ${completed}/${newItems.length} sản phẩm).`
          }
        });
        return;
      }

      completed++;
      await chrome.storage.local.set({
        autoScrapeStatus: {
          isRunning: true,
          step: 'SCRAPING_ITEM',
          message: `[${completed}/${newItems.length}] AI đang bóc tách 100% ${item.goodsNo}...`,
          processedCount: completed,
          totalCount: newItems.length,
          currentItem: item.goodsNo
        }
      });

      try {
        const pageData = await fetchOliveYoungPageData(item.goodsNo, item.url);
        
        // BỎ QUA SẢN PHẨM BỊ LỖI TRANG XÁC THỰC WAF ROBOT
        if (!pageData || !pageData.title || /잠시만\s*기다려|Access\s*Denied|Trang\s*Xác\s*Thực/i.test(pageData.title)) {
          console.warn("Bỏ qua sản phẩm bị WAF challenge:", item.goodsNo);
          continue;
        }

        const apiKey = storage?.geminiApiKey;
        let aiData = {};

        if (apiKey && pageData) {
          const prompt = `Bạn là chuyên gia trí tuệ nhân tạo (AI) bóc tách mỹ phẩm Hàn Quốc Olive Young.
Dưới đây là nội dung trang sản phẩm Olive Young thực tế:

URL: ${pageData.url}
TÊN GỐC: ${pageData.title}
GIÁ MUA: ${pageData.priceText}
NỘI DUNG NGUYÊN BẢN:
${pageData.fullText}

BẮT BUỘC TRẢ VỀ JSON THUẦN HỢP LỆ:
- name: Tên sản phẩm đã dịch sang TIẾNG VIỆT 100% mượt mà chuẩn đẹp (Ví dụ: "Bộ Set Đổi Mới Nâng Cấp 7 Loại Miếng Đệm Dưỡng Da Mediheal Derma Pad Cỡ Lớn 200 Miếng Độc Quyền"). TUYỆT ĐỐI KHÔNG để lại bất kỳ chữ tiếng Hàn HANGUL nào! KHÔNG đặt tên dạng "Trang Xác Thực Truy Cập"!
- nameKr: Tên sản phẩm tiếng Hàn gốc từ TITLE.
- price: Giá Won (KRW) bán thực tế (chữ số nguyên dương ví dụ 28900, 29300, 21900, 34900, KHÔNG lấy giá mặc định 25000 nếu có giá thực).
- brand: Thương hiệu (Mediheal, Biodance, Celimax, Beplain, Goodal, UNOVE, Objet, Anua, Torriden...). Dịch sang tên tiếng Anh/Việt chuẩn.
- category: skincare|makeup|health|pharmacy|haircare|bodycare.
- description: Mô tả công dụng sản phẩm bằng tiếng Việt chuẩn.
- usage: Hướng dẫn sử dụng bằng tiếng Việt.`;

          const MODELS = getRotatedModelsList();
          for (const model of MODELS) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 10000);
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
              const r = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                signal: controller.signal
              });
              clearTimeout(timer);
              const d = await r.json();
              if (r.ok && d.candidates && d.candidates[0]?.content?.parts?.[0]?.text) {
                let text = d.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                aiData = JSON.parse(text);
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }

        const titleRaw = pageData.title;
        const krName = aiData.nameKr || titleRaw;
        let viName = aiData.name || translateKoreanToVi(krName);
        if (/[가-힣]/.test(viName)) {
          viName = translateKoreanToVi(viName);
        }

        if (/Trang\s*Xác\s*Thực|잠시만\s*기다려/i.test(viName)) {
          console.warn("Bỏ qua tên trang xác thực:", viName);
          continue;
        }

        const domPrice = pageData.domPrice || parseDomPrice(pageData.priceText);
        let parsedAiPrice = parseInt(String(aiData.price).replace(/[^0-9]/g, ''), 10) || 0;
        if (parsedAiPrice > 200000 || parsedAiPrice < 1000) {
          parsedAiPrice = 0;
        }

        const cleanPrice = parsedAiPrice > 0 ? parsedAiPrice : (domPrice || 26800);

        const albumImages = (pageData.images && pageData.images.length > 0) ? pageData.images : (pageData.image ? [pageData.image] : []);
        const photoReviews = pageData.photoReviews || [];
        const mainImage = albumImages[0] || pageData.image || '';

        sendProductToAdminTab(
          item.goodsNo,
          viName,
          krName,
          cleanPrice,
          mainImage,
          albumImages,
          photoReviews,
          aiData.brand || pageData.brandText || 'Olive Young Korea',
          aiData.brandKr || pageData.brandText || '올리브영',
          aiData.category || 'skincare',
          aiData.description || `Sản phẩm mỹ phẩm Hàn Quốc cao cấp. Tên gốc: ${krName}`,
          aiData.usage || 'Thoa nhẹ nhàng lên vùng da cần chăm sóc.',
          item.url
        );

        scrapedGoodsList.add(item.goodsNo);
        await chrome.storage.local.set({ scrapedGoodsList: Array.from(scrapedGoodsList) });

      } catch (e) {
        console.warn(`Lỗi cào mã ${item.goodsNo}:`, e);
      }

      await new Promise(r => setTimeout(r, 3500));
    }

    await chrome.storage.local.set({
      autoScrapeStatus: {
        isRunning: false,
        step: 'DONE',
        message: `Đã hoàn tất cào ngầm ${newItems.length} sản phẩm mới về Admin!`,
        processedCount: newItems.length,
        totalCount: newItems.length
      }
    });

  } catch (err) {
    await chrome.storage.local.set({
      autoScrapeStatus: {
        isRunning: false,
        step: 'ERROR',
        message: `Lỗi cào ngầm: ${err.message}`
      }
    });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. Kiểm tra tự động nhận diện sản phẩm trùng lặp
  if (request.action === "CHECK_PRODUCT_EXISTS") {
    const goodsNo = (request.goodsNo || '').toUpperCase();
    const url = request.url || '';

    (async () => {
      try {
        const storage = await new Promise(resolve =>
          chrome.storage.local.get(['scrapedGoodsRegistry', 'scrapedGoodsList'], resolve)
        );
        const registry = storage?.scrapedGoodsRegistry || {};
        const list = new Set(storage?.scrapedGoodsList || []);

        let foundItem = null;
        let duplicateType = null;

        // Ưu tiên 1: So khớp mã sản phẩm goodsNo
        if (goodsNo && registry[goodsNo]) {
          foundItem = registry[goodsNo];
          duplicateType = 'goodsNo';
        } else if (goodsNo && list.has(goodsNo)) {
          foundItem = { goodsNo };
          duplicateType = 'goodsNo';
        }

        // Ưu tiên 2: So khớp đường dẫn sản phẩm url
        if (!foundItem && url) {
          const matched = Object.values(registry).find(item => item.productUrl && (item.productUrl === url || (goodsNo && item.productUrl.includes(goodsNo))));
          if (matched) {
            foundItem = matched;
            duplicateType = 'url';
          }
        }

        sendResponse({
          success: true,
          exists: !!foundItem,
          duplicateType,
          item: foundItem
        });
      } catch (err) {
        sendResponse({ success: false, exists: false, error: err.message });
      }
    })();
    return true;
  }

  // 2. Đồng bộ danh mục mã sản phẩm đã có từ Web Admin vào Extension Cache
  if (request.action === "SYNC_CATALOG_GOODS_NOS") {
    const goodsNos = request.goodsNos || [];
    if (Array.isArray(goodsNos) && goodsNos.length > 0) {
      chrome.storage.local.get(['scrapedGoodsList', 'scrapedGoodsRegistry'], (storage) => {
        const currentList = new Set(storage?.scrapedGoodsList || []);
        const currentRegistry = storage?.scrapedGoodsRegistry || {};
        goodsNos.forEach(g => {
          if (g) {
            const upper = String(g).toUpperCase();
            currentList.add(upper);
            if (!currentRegistry[upper]) {
              currentRegistry[upper] = { goodsNo: upper, syncedFromAdmin: true, scrapedAt: new Date().toISOString() };
            }
          }
        });
        chrome.storage.local.set({
          scrapedGoodsList: Array.from(currentList),
          scrapedGoodsRegistry: currentRegistry
        }, () => {
          sendResponse({ success: true, count: currentList.size });
        });
      });
      return true;
    }
    sendResponse({ success: false, message: 'Danh sách goodsNos trống' });
    return true;
  }

  if (request.action === "RESET_SCRAPED_CACHE") {
    chrome.storage.local.set({ scrapedGoodsList: [], scrapedGoodsRegistry: {} }, () => {
      sendResponse({ success: true, message: 'Đã làm sạch bộ nhớ đệm mã trùng! Giờ đây bạn có thể cào lại từ đầu.' });
    });
    return true;
  }
  if (request.action === "STOP_BACKGROUND_AUTO_RANKING_SCRAPE") {
    isStopRequested = true;
    sendResponse({ success: true, message: 'Đã dừng cào ngầm!' });
    return true;
  }
  if (request.action === "START_BACKGROUND_AUTO_RANKING_SCRAPE") {
    runBackgroundRankingScrape();
    sendResponse({ success: true, message: 'Đã khởi động tiến trình cào ngầm!' });
    return true;
  }
  if (request.action === "START_SINGLE_AUTO_SCRAPE") {
    const item = request.item;

    (async () => {
      try {
        const goodsNo = item.goodsNo || 'A000000261415';
        const itemUrl = item.url || `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`;

        // 1. Tải dữ liệu HTML trang sản phẩm thật từ Olive Young
        const pageData = await fetchOliveYoungPageData(goodsNo, itemUrl);

        // 2. Lấy Gemini API Key
        const result = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey'], resolve));
        const apiKey = result?.geminiApiKey;

        let aiData = {};

        if (apiKey && pageData) {
          const prompt = `Bạn là chuyên gia trí tuệ nhân tạo (AI) bóc tách mỹ phẩm Hàn Quốc Olive Young.
Dưới đây là thông tin trang sản phẩm Olive Young thật:

URL: ${pageData.url}
TÊN GỐC: ${pageData.title}
GIÁ MUA: ${pageData.priceText}
THƯƠNG HIỆU: ${pageData.brandText}
NỘI DUNG TRANG WEB:
${pageData.fullText}

Trích xuất JSON chính xác tuyệt đối:
- name: Tên sản phẩm đã được AI dịch sang tiếng Việt mượt mà, đầy đủ, bỏ chữ khuyến mãi.
- nameKr: Tên sản phẩm tiếng Hàn gốc chính xác từ TITLE.
- price: Giá Won (KRW) bán thực tế (chỉ chữ số nguyên dương ví dụ 26800, 34900).
- brand: Thương hiệu chính xác (Celimax, Objet, Anua, Torriden, Mediheal, Romand, Skin1004...).
- category: skincare|makeup|health|pharmacy|haircare|bodycare.
- description: Công dụng sản phẩm chi tiết bằng tiếng Việt.
- usage: Hướng dẫn sử dụng bằng tiếng Việt.

Chỉ trả về JSON thuần hợp lệ, KHÔNG markdown.`;

          const MODELS = getRotatedModelsList();
          for (const model of MODELS) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 10000);
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
              const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                signal: controller.signal
              });
              clearTimeout(timer);
              const d = await res.json();
              if (res.ok && d.candidates && d.candidates[0]?.content?.parts?.[0]?.text) {
                let text = d.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                aiData = JSON.parse(text);
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }

        const titleRaw = pageData?.title || `Sản phẩm Olive Young ${goodsNo}`;
        const krName = aiData.nameKr || titleRaw;
        const viName = aiData.name || translateKoreanToVi(krName);

        const domPrice = parseDomPrice(pageData?.priceText);
        let parsedAiPrice = parseInt(String(aiData.price).replace(/[^0-9]/g, ''), 10) || 0;
        if (parsedAiPrice > 200000 || parsedAiPrice < 1000) {
          parsedAiPrice = 0;
        }

        const cleanPrice = parsedAiPrice > 0 ? parsedAiPrice : (domPrice || 26800);

        const mainImage = pageData?.image || (pageData?.images && pageData.images[0]) || `https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/${goodsNo.slice(0, 4)}/${goodsNo}01ko.jpg`;
        const albumImages = (pageData?.images && pageData.images.length > 0) ? pageData.images : (pageData?.image ? [pageData.image] : []);
        const photoReviews = pageData?.photoReviews || [];
        const mainImg = albumImages[0] || pageData?.image || '';

        sendProductToAdminTab(
          goodsNo,
          viName,
          krName,
          cleanPrice,
          mainImg,
          albumImages,
          photoReviews,
          aiData.brand || pageData?.brandText || 'Olive Young Korea',
          aiData.brandKr || pageData?.brandText || '올리브영',
          aiData.category || 'skincare',
          aiData.description || `Sản phẩm mỹ phẩm Hàn Quốc cao cấp. Tên gốc: ${krName}`,
          aiData.usage || 'Thoa nhẹ nhàng lên vùng da cần chăm sóc.',
          itemUrl
        );

        sendResponse({ success: true, name: viName });
      } catch (err) {
        console.error("Lỗi AI Auto Scrape:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }

  if (request.action === "PROCESS_SCRAPED_DATA_AI") {
    const rawData = request.data;

    (async () => {
      try {
        const result = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey', 'selectedModel'], resolve));
        const apiKey = result?.geminiApiKey;
        const userModel = result?.selectedModel;

        let aiData = {};

        if (apiKey) {
          const prompt = `Bạn là chuyên gia trí tuệ nhân tạo (AI) bóc tách mỹ phẩm Hàn Quốc Olive Young hàng đầu.
Dưới đây là thông tin chi tiết của sản phẩm Olive Young:

URL: ${rawData.url}
TITLE: ${rawData.title || ''}
THƯƠNG HIỆU THÔ: ${rawData.brandText || ''}
GIÁ BÁN THỰC TẾ: ${rawData.priceText || ''}
GIÁ GỐC: ${rawData.originalPrice || ''}
DUNG TÍCH/THÔNG SỐ: ${rawData.capacity || rawData.specs?.capacity || ''}
LOẠI DA: ${rawData.skinType || rawData.specs?.skinType || ''}
HƯỚNG DẪN SỬ DỤNG: ${rawData.usage || rawData.specs?.usage || ''}
XUẤT XỨ: ${rawData.origin || rawData.specs?.origin || '대한민국'}
THÀNH PHẦN: ${rawData.ingredients || rawData.specs?.ingredients || ''}
TÙY CHỌN/PHÂN LOẠI: ${JSON.stringify(rawData.options || [])}
CANDIDATE_REVIEWS: ${JSON.stringify(rawData.reviewCandidates || [])}
VĂN BẢN TRANG WEB:
${rawData.fullText}

Yêu cầu BẮT BUỘC trả về JSON thuần (không markdown, không giải thích):
- name: Tên sản phẩm dịch sang TIẾNG VIỆT 100% mượt mà, chuyên nghiệp, chuẩn sàn thương mại điện tử cao cấp (ví dụ: "Tinh Chất Phục Hồi Da Torriden Dive-In Low Molecule Hyaluronic Acid Serum 50ml", "Hộp Bông Dưỡng Da Làm Dịu Mediheal Teatree Trouble Pad 100 Miếng"). BỎ hoàn toàn các từ giật tít khuyến mãi tiếng Hàn dạng [단독기획], (1+1), [올영단독], (기획), (골라담기), [본품증정]. TUYỆT ĐỐI KHÔNG để lại bất kỳ chữ tiếng Hàn Hangul nào!
- nameKr: Tên sản phẩm chính xác bằng tiếng Hàn gốc từ TITLE.
- price: Giá Won (KRW) bán thực tế (số nguyên dương, ví dụ: 21900, 28900, ưu tiên giá giảm sale).
- originalPrice: Giá Won gốc trước giảm (số nguyên dương, >= price).
- brand: Tên thương hiệu tiếng Anh chuẩn (Torriden, Mediheal, Medicube, Celimax, Round Lab, Beplain, Anua, Skin1004, Biodance, Goodal, UNOVE, OBGE, fwee...).
- brandKr: Tên thương hiệu tiếng Hàn.
- category: cosmetics|skincare|makeup|haircare|bodycare|health.
- subCategory: Phân loại chi tiết (serum|toner|cream|mask|suncream|cleanser|cushion|lipstick|shampoo|body...).
- capacity: Dung tích/trọng lượng (ví dụ: "50ml", "100 miếng / 150ml", "80ml+80ml").
- skinType: Loại da phù hợp bằng tiếng Việt (ví dụ: "Mọi loại da, da dầu thiếu nước, da nhạy cảm").
- ingredients: Tóm tắt 3-5 hoạt chất chính nổi bật bằng tiếng Việt (ví dụ: "Hyaluronic Acid 5D, D-Panthenol, Malachite Extract").
- description: Mô tả công dụng và điểm nổi bật chi tiết, chuyên nghiệp bằng tiếng Việt.
- usage: Hướng dẫn sử dụng bằng tiếng Việt ngắn gọn, dễ hiểu.
- options: Danh sách các phân loại nếu có (ví dụ các tone màu phấn 21N, 23N hoặc các loại mùi).
- filteredReviews: Mảng URL ảnh đánh giá thực tế chọn lọc từ CANDIDATE_REVIEWS (lọc bỏ ảnh banner, icon, quà tặng).`;

          let MODELS = getRotatedModelsList();
          if (userModel && userModel !== 'auto') {
            MODELS = [userModel, ...ALL_SUPPORTED_MODELS.filter(m => m !== userModel)];
          }

          for (const model of MODELS) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 10000);

              const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
              const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                signal: controller.signal
              });
              clearTimeout(timer);

              const d = await res.json();
              if (res.ok && d.candidates && d.candidates[0]?.content?.parts?.[0]?.text) {
                let aiResultText = d.candidates[0].content.parts[0].text;
                aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
                aiData = JSON.parse(aiResultText);
                break;
              }
            } catch (e) {
              console.warn(`Model ${model} timeout/thất bại...`, e);
              continue;
            }
          }
        }

        const titleRaw = (rawData.title || '').split('|')[0].trim();
        const titleClean = cleanTitle(titleRaw);
        const brandFallback = extractCleanBrand(rawData, aiData.brand);

        const domPrice = parseDomPrice(rawData.priceText);
        let parsedAiPrice = parseInt(String(aiData.price).replace(/[^0-9]/g, ''), 10) || 0;
        if (parsedAiPrice > 1000000 || parsedAiPrice < 1000) {
          parsedAiPrice = 0;
        }

        const finalPrice = parsedAiPrice > 0 ? parsedAiPrice : (domPrice || 25000);
        const rawOrigPrice = parseInt(String(aiData.originalPrice || rawData.originalPrice).replace(/[^0-9]/g, ''), 10) || finalPrice;
        const finalOriginalPrice = rawOrigPrice >= finalPrice ? rawOrigPrice : finalPrice;
        const discountPct = finalOriginalPrice > finalPrice ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100) : 0;

        let vietnameseName = aiData.name;
        if (!vietnameseName || /[가-힣]/.test(vietnameseName)) {
          vietnameseName = translateKoreanToVi(aiData.nameKr || titleClean || titleRaw);
        }

        const goodsNoMatch = (rawData.url || '').match(/goodsNo=([A-Za-z0-9_]+)/i);
        const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : `A${Date.now()}`;

        // Lấy Album Ảnh đại diện sản phẩm HD (tối đa 10 ảnh)
        const finalAlbum = (rawData.images && rawData.images.length > 0)
          ? rawData.images.slice(0, 10)
          : (rawData.image ? [rawData.image] : []);

        // Lấy Album Ảnh chi tiết mô tả infographic & swatches (tối đa 20 ảnh)
        const detailAlbum = (rawData.detailImages && rawData.detailImages.length > 0)
          ? rawData.detailImages.slice(0, 20)
          : [];

        const isJunkUrl = (u) => !u || typeof u !== 'string' || !u.startsWith('http') ||
          /\/display\/|\/event\/|\/banner\/|\/static\/|\/item\/|logo|icon|avatar|star_|btn_|badge|tag_|flag_|blank|loading|sprite/i.test(u);

        // Lọc ảnh review: Ưu tiên ảnh thật người dùng, không lấy ảnh rác/quảng cáo, lấy tối đa 50 tấm
        let candidateList = (rawData.reviewCandidates || []).filter(u => !isJunkUrl(u));
        let aiList = (aiData.filteredReviews && Array.isArray(aiData.filteredReviews))
          ? aiData.filteredReviews.filter(u => !isJunkUrl(u))
          : [];

        let finalReviews = Array.from(new Set([...aiList, ...candidateList])).filter(u => !isJunkUrl(u));
        finalReviews = finalReviews.slice(0, 50);

        const mainImg = finalAlbum[0] || rawData.image || '';

        const fullPayload = {
          goodsNo,
          name: vietnameseName,
          nameKr: aiData.nameKr || titleRaw,
          price: finalPrice,
          foreignPrice: finalPrice,
          originalPrice: finalOriginalPrice,
          discountPercent: discountPct,
          productImage: mainImg,
          images: finalAlbum,
          detailImages: detailAlbum,
          photoReviews: finalReviews,
          brand: brandFallback,
          brandKr: aiData.brandKr || brandFallback,
          category: aiData.category || 'cosmetics',
          subCategory: aiData.subCategory || 'skincare',
          capacity: aiData.capacity || rawData.capacity || '',
          skinType: aiData.skinType || rawData.skinType || '',
          ingredients: aiData.ingredients || rawData.ingredients || '',
          expirationDate: rawData.expirationDate || '',
          description: aiData.description || `Sản phẩm chính hãng nội địa Hàn Quốc. Tên gốc: ${titleRaw}`,
          usage: aiData.usage || rawData.usage || 'Xem chi tiết trên bao bì sản phẩm.',
          origin: rawData.origin || 'Store Olive Young Korea',
          options: (aiData.options && Array.isArray(aiData.options) && aiData.options.length > 0) ? aiData.options : (rawData.options || ['1 Hộp']),
          rating: Number(rawData.rating) || 4.8,
          reviewsCount: Number(rawData.reviewsCount) || finalReviews.length || 180,
          productUrl: rawData.url,
          scrapedAt: new Date().toISOString()
        };

        sendProductToAdminTab(fullPayload);

        sendResponse({
          success: true,
          name: vietnameseName,
          imagesCount: finalAlbum.length,
          detailCount: detailAlbum.length,
          reviewCount: finalReviews.length
        });

      } catch (err) {
        console.error("Lỗi AI Service Worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }
});
