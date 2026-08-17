// content.js - Chạy trên trang Olive Young
// Lấy DOM thật + ảnh chính từ trang người dùng đang mở, tránh proxy/server bị chặn.

const pickProductImage = () => {
  const imgList = Array.from(document.images || []);
  const candidates = imgList
    .map((img) => {
      const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
      const rect = img.getBoundingClientRect();
      return {
        src,
        width: img.naturalWidth || rect.width || 0,
        height: img.naturalHeight || rect.height || 0,
        area: (img.naturalWidth || rect.width || 0) * (img.naturalHeight || rect.height || 0),
        top: rect.top,
        alt: img.alt || ''
      };
    })
    .filter((item) => item.src && item.width >= 250 && item.height >= 250)
    .filter((item) => !/logo|icon|banner|sprite|blank|loading/i.test(item.src + item.alt))
    .sort((a, b) => {
      const topBias = Math.abs(a.top) - Math.abs(b.top);
      return topBias !== 0 ? topBias : b.area - a.area;
    });

  return candidates[0]?.src || document.querySelector('meta[property="og:image"]')?.content || '';
};

const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || '';

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "SCRAPE_PRODUCT") {
    try {
      document.body.insertAdjacentHTML('beforeend', '<div id="tavy-loading" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#2563EB;color:#fff;padding:22px;z-index:999999;border-radius:10px;font-size:18px;font-weight:bold;box-shadow:0 4px 20px rgba(0,0,0,0.3);">Đang lấy ảnh và dữ liệu thật từ trang Olive Young...</div>');

      let fullText = document.body.innerText || '';
      if (fullText.length > 20000) fullText = fullText.substring(0, 20000);

      const rawData = {
        fullText,
        image: pickProductImage(),
        url: window.location.href,
        title: document.title,
        brandText: getText('.prd_brand, .brand, .brand_name, [class*=brand]'),
        priceText: getText('.price-2, .sale_price, .total, [class*=price]')
      };

      chrome.runtime.sendMessage({ action: "PROCESS_SCRAPED_DATA_AI", data: rawData }, (response) => {
        document.getElementById('tavy-loading')?.remove();
        if (response && response.error) {
          alert("Lỗi AI: " + response.error);
        } else if (response && response.success === false) {
          alert("Bạn chưa cài đặt API Key! Vui lòng bấm vào icon Extension > Cài đặt API Key.");
        } else if (response && response.success) {
          alert("✅ Đã quét sản phẩm thành công! Chuyển đến trang Admin để duyệt...");
        }
      });
    } catch (error) {
      document.getElementById('tavy-loading')?.remove();
      alert("Lỗi cào dữ liệu DOM: " + error.message);
    }
  }
});
