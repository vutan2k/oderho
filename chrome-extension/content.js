// content.js - Chạy trên trang Olive Young
// Nhiệm vụ: Gom toàn bộ chữ và hình ảnh trên trang đưa cho AI đọc

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCRAPE_PRODUCT") {
    try {
      // Báo hiệu đang xử lý
      document.body.insertAdjacentHTML('beforeend', '<div id="tavy-loading" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#6D28D9;color:#fff;padding:25px;z-index:999999;border-radius:12px;font-size:20px;font-weight:bold;box-shadow:0 4px 20px rgba(0,0,0,0.3);">🤖 AI đang quét đọc dữ liệu... (Chờ khoảng 5-10 giây)</div>');

      // 1. Lấy toàn bộ Text hiển thị trên màn hình
      // Giới hạn 15000 ký tự để không bị quá tải token Gemini
      let fullText = document.body.innerText;
      if (fullText.length > 15000) fullText = fullText.substring(0, 15000);

      // 2. Lấy URL ảnh chính
      let image = document.querySelector('#mainImg')?.src 
                  || document.querySelector('meta[property="og:image"]')?.content 
                  || '';

      // 3. Lấy URL hiện tại
      const url = window.location.href;

      const rawData = {
        fullText,
        image,
        url
      };

      // GỬI RAW DATA CHO BACKGROUND XỬ LÝ (Gọi Gemini API)
      chrome.runtime.sendMessage({ action: "PROCESS_SCRAPED_DATA_AI", data: rawData }, (response) => {
        document.getElementById('tavy-loading')?.remove();
        if (response && response.error) {
          alert("Lỗi AI: " + response.error);
        } else if (response && response.success === false) {
          alert("Bạn chưa cài đặt API Key! Vui lòng bấm vào icon Extension > Cài đặt API Key.");
        }
      });

    } catch (error) {
      alert("Lỗi cào dữ liệu DOM: " + error.message);
    }
  }
});
