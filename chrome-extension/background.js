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

        // Danh sách model fallback — bất kỳ lỗi nào cũng thử model kế tiếp (overloaded / high demand / 429 / 503)
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
          // Thành công nếu có candidates; bất kỳ lỗi nào cũng thử model kế
          if (res.ok && d.candidates && d.candidates.length > 0) { data = d; break; }
          continue;
        }
        let aiData = {};
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          try {
            let aiResultText = data.candidates[0].content.parts[0].text;
            aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
            aiData = JSON.parse(aiResultText);
          } catch (e) {
            console.warn("Parse AI JSON thất bại, chuyển sang fallback DOM:", e);
          }
        }

        // Nếu AI bận hoặc parse thất bại -> trích xuất fallback từ DOM thật
        const title = (rawData.title || '').split('|')[0].trim();
        const bracketBrand = title.match(/^\[([^\]]{2,20})\]/);
        const brandFallback = bracketBrand ? bracketBrand[1].trim() : (rawData.brandText || 'Korea Brand');
        
        // Trích xuất giá từ text (ví dụ "28,900원" -> 28900)
        let domPrice = 0;
        if (rawData.priceText) {
          const numMatch = rawData.priceText.replace(/,/g, '').match(/\d+/);
          if (numMatch) domPrice = parseInt(numMatch[0]);
        }

        const productData = {
          name: aiData.name || title || 'Sản phẩm Olive Young',
          // nameKr: ưu tiên AI, fallback từ TITLE (luôn là tên Hàn gốc, phần trước "| 올리브영")
          nameKr: aiData.nameKr || title,
          price: parseInt(aiData.price) || domPrice || 0,
          image: rawData.image || '',
          brand: aiData.brand || brandFallback,
          url: rawData.url,
          category: aiData.category || 'skincare',
          description: aiData.description || 'Sản phẩm chính hãng nội địa Hàn Quốc.',
          usage: aiData.usage || 'Xem chi tiết trên bao bì sản phẩm.'
        };

        const encodedData = btoa(encodeURIComponent(JSON.stringify(productData)));
        const adminUrl = `https://tavy-oderho.web.app/admin/dashboard?autoFill=${encodedData}`;

        // Mở Tab Admin chạy ngầm (active: false) để AppProvider nhận autoFill lưu vào chờ duyệt
        chrome.tabs.create({ url: adminUrl, active: false }, (adminTab) => {
          // Tự đóng tab admin ngầm sau 2.5s (khi AppProvider đã đọc và lưu xong)
          setTimeout(() => {
            if (adminTab && adminTab.id) {
              try { chrome.tabs.remove(adminTab.id); } catch {}
            }
          }, 2500);
        });

        // Phản hồi ngay cho tab Olive Young để hiện toast thành công góc phải
        sendResponse({ success: true, name: productData.name });
      } catch (err) {
        console.error("Lỗi AI Service Worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    });

    // Giữ kết nối mở để chờ async trả về kết quả
    return true; 
  }
});
