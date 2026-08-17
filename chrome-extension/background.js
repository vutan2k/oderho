// background.js - Service Worker v3.2 (Timeout Guard & Resilient Processing)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PROCESS_SCRAPED_DATA_AI") {
    const rawData = request.data;

    // Async IIFE để xử lý an toàn 100%
    (async () => {
      try {
        // Lấy API Key từ Storage qua Promise
        const result = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey'], resolve));
        const apiKey = result?.geminiApiKey;

        let aiData = {};

        if (apiKey) {
          const prompt = `Trích xuất dữ liệu sản phẩm Olive Young từ DOM thật sau thành JSON hợp lệ.
Yêu cầu bắt buộc:
- name: Tên sản phẩm đã dịch sang tiếng Việt, bỏ chữ khuyến mãi.
- nameKr: Tên sản phẩm chính xác bằng tiếng Hàn gốc. BẮT BUỘC lấy từ TITLE (phần trước "| 올리브영"), KHÔNG để trống.
- price: Giá bán bằng Won, chỉ lấy số.
- brand: Tên thương hiệu bằng tiếng Anh hoặc Việt (ví dụ: Mediheal, COSRX, Round Lab).
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
              // AbortController chống treo fetch quá 4 giây
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
                break; // Thành công -> thoát vòng lặp
              }
            } catch (e) {
              console.warn(`Model ${model} thất bại hoặc timeout (4s), thử model tiếp...`, e);
              continue;
            }
          }
        }

        // BÓC TÁCH FALLBACK TỪ DOM THẬT KHI AI THẤT BẠI/TIMEOUT/THIẾU KEY
        const title = (rawData.title || '').split('|')[0].trim();
        const bracketBrand = title.match(/^\[([^\]]{2,20})\]/);
        const brandFallback = bracketBrand ? bracketBrand[1].trim() : (rawData.brandText || 'Korea Brand');
        
        let domPrice = 0;
        if (rawData.priceText) {
          const numMatch = rawData.priceText.replace(/,/g, '').match(/\d+/);
          if (numMatch) domPrice = parseInt(numMatch[0]);
        }

        // Tập trung hình ảnh: Kết hợp Album sản phẩm + Ảnh đánh giá từ khách hàng
        const allCombinedImages = Array.from(new Set([
          ...(rawData.images || [rawData.image || '']),
          ...(rawData.photoReviews || [])
        ])).filter(url => url && url.startsWith('http'));

        const productData = {
          name: aiData.name || title || 'Sản phẩm Olive Young',
          nameKr: aiData.nameKr || title,
          price: parseInt(aiData.price) || domPrice || 0,
          image: rawData.image || allCombinedImages[0] || '',
          images: allCombinedImages.length > 0 ? allCombinedImages : [rawData.image || ''],
          brand: aiData.brand || brandFallback,
          url: rawData.url,
          category: aiData.category || 'skincare',
          description: aiData.description || 'Sản phẩm chính hãng nội địa Hàn Quốc.',
          usage: aiData.usage || 'Xem chi tiết trên bao bì sản phẩm.',
          rating: aiData.rating || 4.9,
          reviewsCount: aiData.reviewsCount || 150
        };

        const encodedData = btoa(encodeURIComponent(JSON.stringify(productData)));
        const adminUrl = `https://tavy-oderho.web.app/admin/dashboard?autoFill=${encodedData}`;

        // Mở Tab Admin chạy ngầm để lưu vào hàng chờ
        chrome.tabs.create({ url: adminUrl, active: false }, (adminTab) => {
          setTimeout(() => {
            if (adminTab && adminTab.id) {
              try { chrome.tabs.remove(adminTab.id); } catch {}
            }
          }, 3500);
        });

        // Phản hồi lập tức về content.js
        sendResponse({ success: true, name: productData.name });

      } catch (err) {
        console.error("Lỗi AI Service Worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true; // Giữ kết nối async
  }
});
