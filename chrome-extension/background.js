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

// Hàm gửi dữ liệu sản phẩm lên Admin tab (ƯU TIÊN CÁCH 1: Gửi tin nhắn trực tiếp qua bộ nhớ - ZERO Limit & KHÔNG MỞ TAB)
const sendProductToAdminTab = (goodsNo, name, nameKr, price, mainImage, albumImages, photoReviews, brand, brandKr, category, description, usage, url) => {
  const fullProductData = {
    goodsNo: goodsNo || `SP-${Date.now()}`,
    name: name || 'Sản phẩm Olive Young',
    nameKr: nameKr || name || '',
    foreignPrice: price || 25000,
    price: price || 25000,
    productImage: mainImage || (albumImages && albumImages[0]) || '',
    images: (albumImages && albumImages.length > 0) ? albumImages : (mainImage ? [mainImage] : []),
    photoReviews: photoReviews || [],
    brand: brand || 'Olive Young Korea',
    brandKr: brandKr || brand || '올리브영',
    category: category || 'skincare',
    options: '1 Hộp',
    origin: 'Store Olive Young Korea',
    description: description || `Sản phẩm chính hãng nội địa Hàn Quốc. Tên gốc: ${nameKr}`,
    usage: usage || 'Xem chi tiết trên bao bì.',
    rating: 4.9,
    reviewsCount: (photoReviews && photoReviews.length) || 180,
    productUrl: url || '',
    scrapedAt: new Date().toISOString()
  };

  // 1. Kiểm tra xem có Tab Admin nào đang mở không -> Gửi tin nhắn trực tiếp qua bộ nhớ (0 giới hạn dung lượng!)
  chrome.tabs.query({ url: ["https://tavyorder.web.app/admin/*", "https://tavyorder.web.app/*", "http://localhost/*"] }, (tabs) => {
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
        img: fullProductData.productImage,
        imgs: fullProductData.images.slice(0, 3),
        b: String(fullProductData.brand).slice(0, 35),
        cat: fullProductData.category,
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
        message: '🔄 Đang tải dữ liệu 50 sản phẩm Ranking Olive Young...',
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
    const newItems = allFound.filter(item => !scrapedGoodsList.has(item.goodsNo));

    if (newItems.length === 0) {
      await chrome.storage.local.set({
        autoScrapeStatus: {
          isRunning: false,
          step: 'DONE',
          message: `✅ Đã cào hết 50 mã này trước đó! Bỏ qua ${allFound.length} mã trùng.`,
          processedCount: allFound.length,
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
            message: `🛑 Đã dừng cào ngầm thành công (Đã cào ${completed}/${newItems.length} sản phẩm).`
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

          const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
          for (const model of MODELS) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 4000);
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
        message: `🎉 Đã hoàn tất cào ngầm ${newItems.length} sản phẩm mới về Admin!`,
        processedCount: newItems.length,
        totalCount: newItems.length
      }
    });

  } catch (err) {
    await chrome.storage.local.set({
      autoScrapeStatus: {
        isRunning: false,
        step: 'ERROR',
        message: `❌ Lỗi cào ngầm: ${err.message}`
      }
    });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

          const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
          for (const model of MODELS) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 4000);
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
        const result = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey'], resolve));
        const apiKey = result?.geminiApiKey;

        let aiData = {};

        if (apiKey) {
          const prompt = `Trích xuất dữ liệu sản phẩm Olive Young từ DOM thật sau thành JSON hợp lệ.
Yêu cầu bắt buộc:
- name: Tên sản phẩm đã dịch sang tiếng Việt đầy đủ, bỏ chữ khuyến mãi.
- nameKr: Tên sản phẩm chính xác bằng tiếng Hàn gốc từ TITLE.
- price: Giá bán thực tế bằng Won (KRW) (chỉ chữ số nguyên dương ví dụ 26800, KHÔNG ghép nhiều giá).
- brand: Tên thương hiệu thật (ví dụ: Celimax, Layerlab, Romand, Mediheal).
- category: skincare|makeup|health|pharmacy|haircare|bodycare.
- description: Mô tả công dụng sản phẩm bằng tiếng Việt.

URL: ${rawData.url}
TITLE: ${rawData.title || ''}
BRAND_TEXT: ${rawData.brandText || ''}
PRICE_TEXT: ${rawData.priceText || ''}
IMAGE_URL: ${rawData.image || ''}
VĂN BẢN TRANG WEB: ${rawData.fullText}`;

          const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
          
          for (const model of MODELS) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 4000);

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

        let vietnameseName = aiData.name;
        if (!vietnameseName || /[가-힣]/.test(vietnameseName)) {
          vietnameseName = translateKoreanToVi(aiData.nameKr || titleClean || titleRaw);
        }

        const productImages = rawData.images || (rawData.image ? [rawData.image] : []);
        const photoReviews = rawData.photoReviews || [];

        const goodsNoMatch = (rawData.url || '').match(/goodsNo=([A-Za-z0-9_]+)/i);
        const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : 'A000000240462';

        const combined = Array.from(new Set([...productImages, ...photoReviews])).filter(u => u && u.startsWith('http'));
        let finalAlbum = productImages;
        let finalReviews = photoReviews;

        if (combined.length < 16) {
          const cdnGallery = [];
          for (let i = 1; i <= 20; i++) {
            const idxStr = i < 10 ? `0${i}` : `${i}`;
            cdnGallery.push(`https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/${goodsNo.slice(0, 4)}/${goodsNo}${idxStr}ko.jpg`);
            cdnGallery.push(`https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/gdasEditor/${goodsNo}_review_${i}.jpg`);
          }
          const merged = Array.from(new Set([...combined, ...cdnGallery])).slice(0, 24);
          finalAlbum = merged.slice(0, 6);
          finalReviews = merged.slice(6);
        }

        const mainImg = rawData.image || productImages[0] || '';

        sendProductToAdminTab(
          goodsNo,
          vietnameseName,
          aiData.nameKr || titleRaw,
          finalPrice,
          mainImg,
          productImages,
          photoReviews,
          brandFallback,
          aiData.brandKr || brandFallback,
          aiData.category || 'skincare',
          aiData.description || `Sản phẩm chính hãng nội địa Hàn Quốc. Tên gốc: ${titleRaw}`,
          aiData.usage || 'Xem chi tiết trên bao bì sản phẩm.',
          rawData.url
        );

        sendResponse({ success: true, name: vietnameseName });

      } catch (err) {
        console.error("Lỗi AI Service Worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }
});
