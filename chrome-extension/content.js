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

// Toast góc nhỏ trên bên phải (không che màn hình, không chặn thao tác)
const showMiniToast = (text, type = 'info') => {
  document.getElementById('tavy-mini-toast')?.remove();
  const bg = type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : '#1E293B';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '🤖';
  const html = `
    <div id="tavy-mini-toast" style="
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999999;
      background: ${bg};
      color: #FFFFFF;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 340px;
      line-height: 1.4;
      animation: tavySlideIn 0.25s ease-out;
      pointer-events: none;
    ">
      <span>${icon}</span>
      <span>${text}</span>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  if (type !== 'info') {
    setTimeout(() => {
      const el = document.getElementById('tavy-mini-toast');
      if (el) {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s';
        setTimeout(() => el.remove(), 300);
      }
    }, 3500);
  }
};

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "SCRAPE_PRODUCT") {
    try {
      showMiniToast('AI đang quét dữ liệu trang...', 'info');

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
        if (response && response.error) {
          showMiniToast(`Lỗi AI: ${response.error}`, 'error');
        } else if (response && response.success === false) {
          showMiniToast('Chưa cài API Key! Bấm icon TAVY > Cài đặt API Key', 'error');
        } else if (response && response.success) {
          const name = response.name ? `"${response.name.slice(0, 30)}..."` : 'Sản phẩm';
          showMiniToast(`Đã thêm ${name} vào chờ duyệt!`, 'success');
        }
      });
    } catch (error) {
      showMiniToast(`Lỗi quét DOM: ${error.message}`, 'error');
    }
  }
});
