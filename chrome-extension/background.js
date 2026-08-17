// background.js - Service Worker v3.9 (Robust Brand & Korean Price Parsing)

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return '';
  return rawTitle.replace(/\[[^\]]+\]/g, '').trim();
};

const extractCleanBrand = (rawData, aiBrand) => {
  if (aiBrand && !/\[|\/|기획|단독|세일|특가|미백|TXA/i.test(aiBrand)) return aiBrand;
  const rawBrand = rawData.brandText || '';
  if (rawBrand && !/\[|\/|기획|단독|세일|특가|미백|TXA/i.test(rawBrand)) return rawBrand.trim();
  
  const titleWithoutBrackets = cleanTitle(rawData.title || '');
  const titleWords = titleWithoutBrackets.split(/\s+/);
  if (titleWords.length > 0 && titleWords[0].length >= 2) {
    return titleWords[0].trim();
  }
  return 'Korea Brand';
};

const parseDomPrice = (priceStr) => {
  if (!priceStr) return 0;
  const cleanDigits = priceStr.replace(/[^0-9]/g, '');
  if (cleanDigits) {
    const val = parseInt(cleanDigits, 10);
    if (val > 100) return val;
  }
  return 0;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
- name: Tên sản phẩm đã dịch sang tiếng Việt, giữ chính xác tên sản phẩm, bỏ chữ khuyến mãi.
- nameKr: Tên sản phẩm chính xác bằng tiếng Hàn gốc. BẮT BUỘC lấy từ TITLE (phần trước "| 올리브영"), KHÔNG để trống.
- price: Giá bán thực tế bằng Won (KRW) (ví dụ 21000, 26800, chỉ trả về chữ số nguyên dương, KHÔNG dùng dấu chấm hay chia nhỏ).
- brand: Tên thương hiệu thật sản phẩm (ví dụ: Celimax, Layerlab, Romand, Mediheal). Bỏ các tag như [잡티미백/TXA], [단독기획].
- category: Chọn 1 trong: skincare, makeup, health, pharmacy, haircare, bodycare.
- description: Mô tả công dụng sản phẩm bằng tiếng Việt.
- usage: Hướng dẫn sử dụng nếu có.
nameKr LUÔN PHẢI CÓ GIÁ TRỊ TIẾNG HÀN — không bao giờ để chuỗi rỗng.
CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG MARKDOWN.

URL: ${rawData.url}
TITLE: ${rawData.title || ''}
BRAND_TEXT: ${rawData.brandText || ''}
PRICE_TEXT: ${rawData.priceText || ''}
IMAGE_URL: ${rawData.image || ''}

VĂN BẢN TRANG WEB:
${rawData.fullText}`;

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
              console.warn(`Model ${model} thất bại hoặc timeout (4s), thử model tiếp...`, e);
              continue;
            }
          }
        }

        // BÓC TÁCH FALLBACK TỪ DOM THẬT KHI AI THẤT BẠI/TIMEOUT/THIẾU KEY
        const titleRaw = (rawData.title || '').split('|')[0].trim();
        const titleClean = cleanTitle(titleRaw);
        const brandFallback = extractCleanBrand(rawData, aiData.brand);

        const domPrice = parseDomPrice(rawData.priceText);
        let parsedAiPrice = parseInt(aiData.price, 10) || 0;
        
        // Nếu aiData.price bị chia nhỏ kiểu 21 hay 26 (do dấu chấm), lấy domPrice
        if (parsedAiPrice < 100 && domPrice > 100) {
          parsedAiPrice = domPrice;
        }

        const finalPrice = parsedAiPrice > 0 ? parsedAiPrice : (domPrice || 0);

        // Tập trung hình ảnh: Kết hợp Album sản phẩm + Ảnh đánh giá từ khách hàng
        const productImages = rawData.images || (rawData.image ? [rawData.image] : []);
        const photoReviews = rawData.photoReviews || [];

        const allCombinedImages = Array.from(new Set([
          ...productImages,
          ...photoReviews
        ])).filter(url => url && url.startsWith('http'));

        const productData = {
          name: aiData.name || titleClean || titleRaw || 'Sản phẩm Olive Young',
          nameKr: aiData.nameKr || titleRaw,
          foreignPrice: finalPrice,
          price: finalPrice,
          productImage: rawData.image || productImages[0] || allCombinedImages[0] || '',
          images: productImages.length > 0 ? productImages : (rawData.image ? [rawData.image] : []),
          photoReviews: photoReviews,
          brand: brandFallback,
          brandKr: aiData.brandKr || brandFallback,
          url: rawData.url,
          category: aiData.category || 'skincare',
          description: aiData.description || `Sản phẩm chính hãng nội địa Hàn Quốc. Tên gốc: ${titleRaw}`,
          usage: aiData.usage || 'Xem chi tiết trên bao bì sản phẩm.',
          rating: aiData.rating || 4.9,
          reviewsCount: photoReviews.length || aiData.reviewsCount || 150
        };

        const encodedData = btoa(encodeURIComponent(JSON.stringify(productData)));
        const adminUrl = `https://tavyorder.web.app/admin/dashboard?autoFill=${encodedData}`;

        chrome.tabs.create({ url: adminUrl, active: false }, (adminTab) => {
          setTimeout(() => {
            if (adminTab && adminTab.id) {
              try { chrome.tabs.remove(adminTab.id); } catch {}
            }
          }, 3500);
        });

        sendResponse({ success: true, name: productData.name });

      } catch (err) {
        console.error("Lỗi AI Service Worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }
});
