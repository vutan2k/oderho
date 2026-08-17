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
- nameKr: Tên sản phẩm chính xác bằng tiếng Hàn gốc.
- price: Giá bán bằng Won, chỉ lấy số.
- brand: Tên thương hiệu tiếng Anh hoặc Việt.
- brandKr: Tên thương hiệu tiếng Hàn gốc.
- category: Chọn 1 trong: skincare, makeup, health, pharmacy, haircare, bodycare.
- description: Mô tả công dụng sản phẩm bằng tiếng Việt.
- usage: Hướng dẫn sử dụng nếu có.
Không bịa thông tin nếu DOM không có. Nếu thiếu trường, để chuỗi rỗng hoặc 0.
CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG MARKDOWN.

URL: ${rawData.url}
TITLE: ${rawData.title || ''}
BRAND_TEXT: ${rawData.brandText || ''}
PRICE_TEXT: ${rawData.priceText || ''}
IMAGE_URL: ${rawData.image || ''}

VĂN BẢN TRANG WEB:
${rawData.fullText}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        
        let aiResultText = data.candidates[0].content.parts[0].text;
        // Clean markdown backticks just in case
        aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const aiData = JSON.parse(aiResultText);

        const productData = {
          name: aiData.name || 'Tên sản phẩm',
          nameKr: aiData.nameKr || '',
          price: parseInt(aiData.price) || 0,
          image: rawData.image || '',
          brand: aiData.brand || 'Korea Brand',
          brandKr: aiData.brandKr || '',
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
