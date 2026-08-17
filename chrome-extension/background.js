// background.js - Service Worker (Chạy ngầm, không bị ảnh hưởng bởi CSP)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PROCESS_SCRAPED_DATA_AI") {
    const rawData = request.data;

    // Lấy API Key từ Storage
    chrome.storage.local.get(['geminiApiKey'], async (result) => {
      const apiKey = result.geminiApiKey;
      if (!apiKey) {
        sendResponse({ success: false, error: "Missing API Key" });
        return;
      }

      try {
        const prompt = `Trích xuất dữ liệu sản phẩm Olive Young từ DOM thật sau thành JSON hợp lệ.
Yêu cầu bắt buộc:
- name: Tên sản phẩm đã dịch sang tiếng Việt, bỏ chữ khuyến mãi.
- nameKr: Tên sản phẩm chính xác bằng tiếng Hàn gốc. BẮT BUỘC lấy từ TITLE (phần trước "| 올리브영"), KHÔNG để trống.
- price: Giá bán bằng Won, chỉ lấy số.
- brand: Tên thương hiệu tiếng Anh hoặc Việt.
- brandKr: Tên thương hiệu tiếng Hàn gốc. BẮT BUỘC, nếu title có "[브랜드명 ...]" thì lấy phần trong ngoặc, KHÔNG để trống.
- category: Chọn 1 trong: skincare, makeup, health, pharmacy, haircare, bodycare.
- description: Mô tả công dụng sản phẩm bằng tiếng Việt.
- usage: Hướng dẫn sử dụng nếu có.
nameKr và brandKr LUÔN PHẢI CÓ GIÁ TRỊ TIẾNG HÀN — không bao giờ để chuỗi rỗng.
CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG MARKDOWN.

URL: ${rawData.url}
TITLE: ${rawData.title || ''}
BRAND_TEXT: ${rawData.brandText || ''}
PRICE_TEXT: ${rawData.priceText || ''}
IMAGE_URL: ${rawData.image || ''}

VĂN BẢN TRANG WEB:
${rawData.fullText}`;

        // Danh sách model fallback — phòng khi model bị quá tải (high demand / 429 / 503)
        const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
        let data = null;
        for (const model of MODELS) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          const d = await res.json();
          // Thành công nếu có candidates; lỗi high-demand/429/503 thì thử model khác
          if (res.ok && d.candidates && d.candidates.length > 0) { data = d; break; }
          const errMsg = d.error?.message || '';
          if (errMsg.includes('high demand') || errMsg.includes('429') || errMsg.includes('503') || res.status === 429 || res.status === 503) {
            continue;
          }
          data = d;
          break;
        }
        if (!data || !data.candidates || !data.candidates[0]) throw new Error('Tất cả model Gemini đều quá tải, thử lại sau ít phút.');
        
        let aiResultText = data.candidates[0].content.parts[0].text;
        // Clean markdown backticks just in case
        aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const aiData = JSON.parse(aiResultText);

        // Trích brand Hàn từ title dạng "[메디힐 에센셜 ...]"
        const title = (rawData.title || '').split('|')[0].trim();
        const bracketBrand = title.match(/^\[([^\]]{2,20})\]/);
        const brandKrFallback = bracketBrand ? bracketBrand[1].trim() : title;

        const productData = {
          name: aiData.name || 'Tên sản phẩm',
          // nameKr: ưu tiên AI, fallback từ TITLE (luôn là tên Hàn gốc, phần trước "| 올리브영")
          nameKr: aiData.nameKr || title,
          price: parseInt(aiData.price) || 0,
          image: rawData.image || '',
          brand: aiData.brand || 'Korea Brand',
          // brandKr: ưu tiên AI, fallback BRAND_TEXT, fallback từ [brand] đầu title
          brandKr: aiData.brandKr || rawData.brandText || brandKrFallback,
          url: rawData.url,
          category: aiData.category || 'skincare',
          description: aiData.description || 'Sản phẩm chính hãng Hàn Quốc.',
          usage: aiData.usage || 'Xem chi tiết trên bao bì.'
        };

        const encodedData = btoa(encodeURIComponent(JSON.stringify(productData)));
        const adminUrl = `https://tavy-oderho.web.app/admin/dashboard?autoFill=${encodedData}`;

        // Mở Tab Admin (ẩn) — đóng tab Olive Young sau khi gửi
        chrome.tabs.create({ url: adminUrl, active: false }, (adminTab) => {
          // Đóng tab Olive Young nguồn
          if (sender && sender.tab && sender.tab.id) {
            try { chrome.tabs.remove(sender.tab.id); } catch {}
          }
          // Focus tab admin sau 1.5s
          setTimeout(() => {
            if (adminTab && adminTab.id) chrome.tabs.update(adminTab.id, { active: true });
          }, 1500);
        });

        sendResponse({ success: true });
      } catch (err) {
        console.error("Lỗi AI Service Worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    });

    // Giữ kết nối mở để chờ async trả về kết quả
    return true; 
  }
});
