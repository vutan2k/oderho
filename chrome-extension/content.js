// content.js - Chạy trên trang Olive Young (Version 3.1 - Album Ảnh Thật & Review)

const pickProductImages = () => {
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
    .filter((item) => item.src && item.width >= 200 && item.height >= 200)
    .filter((item) => !/logo|icon|banner|sprite|blank|loading/i.test(item.src + item.alt))
    .sort((a, b) => b.area - a.area);

  // Lấy tối đa 5 ảnh thật chất lượng tốt nhất
  const uniqueUrls = Array.from(new Set(candidates.map(c => c.src))).slice(0, 5);
  return uniqueUrls;
};

const pickProductImage = () => {
  const images = pickProductImages();
  return images[0] || document.querySelector('meta[property="og:image"]')?.content || '';
};

// Thu thập bình luận thực tế từ DOM Olive Young
const extractReviewsFromDOM = () => {
  const reviewNodes = Array.from(document.querySelectorAll('.gReviewList > li, .review_list > li, [class*=review_item]') || []);
  const reviews = [];

  reviewNodes.slice(0, 6).forEach((node, i) => {
    const user = node.querySelector('.user_id, .id, [class*=user]')?.textContent?.trim() || `Khách hàng Hàn Quốc ${i + 1}`;
    const scoreText = node.querySelector('.point, .score, [class*=rating]')?.textContent?.trim() || '5';
    const content = node.querySelector('.txt_inner, .review_cont, [class*=text]')?.textContent?.trim() || '';
    const date = node.querySelector('.date, [class*=date]')?.textContent?.trim() || 'Vừa đánh giá';
    
    // Ảnh chụp đính kèm trong review (nếu có)
    const reviewImg = node.querySelector('img')?.src || '';

    if (content && content.length > 5) {
      reviews.push({
        id: `rev-${Date.now()}-${i}`,
        user,
        rating: parseInt(scoreText) || 5,
        content,
        date,
        image: reviewImg && !reviewImg.includes('icon') ? reviewImg : ''
      });
    }
  });

  return reviews;
};

const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || '';

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
      showMiniToast('AI đang quét dữ liệu & bình luận thật...', 'info');

      let fullText = document.body.innerText || '';
      if (fullText.length > 20000) fullText = fullText.substring(0, 20000);

      const images = pickProductImages();
      const rawData = {
        fullText,
        image: images[0] || '',
        images: images,
        reviews: extractReviewsFromDOM(),
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
          const name = response.name ? `"${response.name.slice(0, 28)}..."` : 'Sản phẩm';
          showMiniToast(`Đã thêm ${name} + Bình luận vào chờ duyệt!`, 'success');
        }
      });
    } catch (error) {
      showMiniToast(`Lỗi quét DOM: ${error.message}`, 'error');
    }
  }
});
