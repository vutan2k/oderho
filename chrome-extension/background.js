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
        const prompt = `Trích xuất dữ liệu sản phẩm từ văn bản sau thành chuẩn JSON chứa các khoá: 
- name: Tên sản phẩm đã dịch sang tiếng Việt, bỏ các chữ [Khuyến mãi].
- price: Giá bán bằng Won (chỉ lấy số, ví dụ 15000).
- brand: Tên Thương hiệu (tiếng Anh hoặc Hàn).
- description: Mô tả công dụng sản phẩm (dịch tiếng Việt).
- usage: Hướng dẫn sử dụng nếu có (dịch tiếng Việt).
Nếu không tìm thấy, hãy đoán hoặc để chuỗi rỗng.
CHỈ TRẢ VỀ CHUỖI JSON HỢP LỆ, KHÔNG KÈM BẤT KỲ VĂN BẢN HAY MARKDOWN NÀO KHÁC (không có \`\`\`json).

VĂN BẢN TRANG WEB:
${rawData.fullText}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
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
          price: parseInt(aiData.price) || 0,
          image: rawData.image,
          brand: aiData.brand || 'Korea Brand',
          url: rawData.url,
          category: 'skincare', // Mặc định
          description: aiData.description || 'Sản phẩm chính hãng Hàn Quốc.',
          usage: aiData.usage || 'Xem chi tiết trên bao bì.'
        };

        const encodedData = btoa(encodeURIComponent(JSON.stringify(productData)));
        const adminUrl = `https://tavy-oderho.web.app/admin/dashboard?autoFill=${encodedData}`;

        // Mở Tab Admin
        chrome.tabs.create({ url: adminUrl });

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
