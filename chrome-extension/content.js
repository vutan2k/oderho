// content.js - Chạy trên trang Olive Young (Version 3.4 - Precise Product Image Picker)

const pickProductImages = () => {
  const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/);
  const goodsNo = goodsNoMatch ? goodsNoMatch[1] : '';

  // 1. Ưu tiên số 1: Meta Tag og:image (Olive Young luôn gán ảnh chuẩn sản phẩm ở đây)
  const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';

  // 2. Ưu tiên số 2: Các selector DOM ảnh sản phẩm chính của Olive Young
  const mainImgEl = document.querySelector('#mainImg, #goodsImg, .prd_thumb img, .goods_thumb img, [id*=mainImg], .prd_img img');
  const mainImgSrc = mainImgEl?.currentSrc || mainImgEl?.src || mainImgEl?.getAttribute('data-src') || '';

  // 3. Quét danh sách ảnh trong trang
  const imgList = Array.from(document.images || []);
  const candidateUrls = [];

  // Nếu có ogImage và không phải banner -> đưa vào đầu danh sách
  if (ogImage && !/banner|display|event|gift|coupon|attached|Logo|Icon|gdasEditor/i.test(ogImage)) {
    candidateUrls.push(ogImage);
  }

  if (mainImgSrc && !/banner|display|event|gift|coupon|attached|Logo|Icon|gdasEditor/i.test(mainImgSrc)) {
    candidateUrls.push(mainImgSrc);
  }

  imgList.forEach((img) => {
    const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
    const rect = img.getBoundingClientRect();
    const width = img.naturalWidth || rect.width || 0;
    const height = img.naturalHeight || rect.height || 0;
    const alt = img.alt || '';

    if (!src || width < 180 || height < 180) return;

    // Loại bỏ tuyệt đối ảnh banner quảng cáo, logo, icon, quà tặng sự kiện
    if (/banner|display|event|gift|coupon|attached|Logo|Icon|gdasEditor|sprite|blank|loading/i.test(src + alt)) {
      return;
    }

    // Ưu tiên cao hơn nếu URL chứa 'thumbnails' hoặc chứa mã sản phẩm (goodsNo)
    const isThumbnail = /thumbnails/i.test(src);
    const isMatchGoodsNo = goodsNo && src.includes(goodsNo);

    if (isThumbnail || isMatchGoodsNo || (width >= 300 && height >= 300)) {
      candidateUrls.push(src);
    }
  });

  // Lọc trùng và làm sạch URL
  const uniqueUrls = Array.from(new Set(candidateUrls)).map(url => {
    // Chuẩn hóa URL bỏ ngoặc kép hoặc ký tự thừa nếu có
    return url.replace(/["')\]]/g, '').trim();
  }).filter(url => url.startsWith('http'));

  return uniqueUrls.length > 0 ? uniqueUrls.slice(0, 5) : [ogImage || mainImgSrc || ''];
};

const pickProductImage = () => {
  const images = pickProductImages();
  return images[0] || document.querySelector('meta[property="og:image"]')?.content || '';
};

const extractReviewsFromDOM = () => {
  const reviewNodes = Array.from(document.querySelectorAll('.gReviewList > li, .review_list > li, [class*=review_item]') || []);
  const reviews = [];

  reviewNodes.slice(0, 6).forEach((node, i) => {
    const user = node.querySelector('.user_id, .id, [class*=user]')?.textContent?.trim() || `Khách hàng Hàn Quốc ${i + 1}`;
    const scoreText = node.querySelector('.point, .score, [class*=rating]')?.textContent?.trim() || '5';
    const content = node.querySelector('.txt_inner, .review_cont, [class*=text]')?.textContent?.trim() || '';
    const date = node.querySelector('.date, [class*=date]')?.textContent?.trim() || 'Vừa đánh giá';
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
      showMiniToast('AI đang quét dữ liệu & ảnh thật sản phẩm...', 'info');

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

      let hasResponded = false;

      const safetyTimer = setTimeout(() => {
        if (!hasResponded) {
          hasResponded = true;
          const shortTitle = (document.title || '').split('|')[0].trim().slice(0, 28);
          showMiniToast(`Đã thêm "${shortTitle}..." vào chờ duyệt!`, 'success');
        }
      }, 8000);

      chrome.runtime.sendMessage({ action: "PROCESS_SCRAPED_DATA_AI", data: rawData }, (response) => {
        if (hasResponded) return;
        hasResponded = true;
        clearTimeout(safetyTimer);

        if (response && response.error) {
          showMiniToast(`Lỗi AI: ${response.error}`, 'error');
        } else if (response && response.success === false) {
          showMiniToast('Chưa cài API Key! Bấm icon TAVY > Cài đặt API Key', 'error');
        } else {
          const name = response?.name ? `"${response.name.slice(0, 28)}..."` : 'Sản phẩm';
          showMiniToast(`Đã thêm ${name} + Ảnh thật vào chờ duyệt!`, 'success');
        }
      });
    } catch (error) {
      showMiniToast(`Lỗi quét DOM: ${error.message}`, 'error');
    }
  }
});
