// content.js - Chạy trên trang Olive Young (Version 3.6 - Visual Product & Photo Reviews Focus)

// Thu thập Album Ảnh Sản Phẩm chính
const pickProductImages = () => {
  const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/);
  const goodsNo = goodsNoMatch ? goodsNoMatch[1] : '';

  const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
  const mainImgEl = document.querySelector('#mainImg, #goodsImg, .prd_thumb img, .goods_thumb img, [id*=mainImg], .prd_img img');
  const mainImgSrc = mainImgEl?.currentSrc || mainImgEl?.src || mainImgEl?.getAttribute('data-src') || '';

  const imgList = Array.from(document.images || []);
  const candidateUrls = [];

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

    if (/banner|display|event|gift|coupon|attached|Logo|Icon|gdasEditor|sprite|blank|loading/i.test(src + alt)) {
      return;
    }

    const isThumbnail = /thumbnails/i.test(src);
    const isMatchGoodsNo = goodsNo && src.includes(goodsNo);

    if (isThumbnail || isMatchGoodsNo || (width >= 280 && height >= 280)) {
      candidateUrls.push(src);
    }
  });

  const uniqueUrls = Array.from(new Set(candidateUrls)).map(url => {
    return url.replace(/["')\]]/g, '').trim();
  }).filter(url => url.startsWith('http'));

  return uniqueUrls.length > 0 ? uniqueUrls.slice(0, 10) : [ogImage || mainImgSrc || ''];
};

const pickProductImage = () => {
  const images = pickProductImages();
  return images[0] || document.querySelector('meta[property="og:image"]')?.content || '';
};

// Thu thập toàn bộ Thư Viện Ảnh Chụp Thật từ Khách Hàng trên Olive Young
const extractPhotoReviewsFromDOM = () => {
  const reviewImgNodes = Array.from(document.querySelectorAll('.gReviewList img, .review_list img, #gdasList img, [class*=review] img, .thumbs img') || []);
  const photoUrls = [];

  reviewImgNodes.forEach((img) => {
    const src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
    if (!src || !src.startsWith('http')) return;
    
    // Loại bỏ icon, avatar, logo, star
    if (!/icon|logo|avatar|star|thumb_default|blank|loading/i.test(src)) {
      photoUrls.push(src.replace(/["')\]]/g, '').trim());
    }
  });

  return Array.from(new Set(photoUrls)).slice(0, 30);
};

const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || '';

const showMiniToast = (text, type = 'info') => {
  document.getElementById('tavy-mini-toast')?.remove();
  const bg = type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : '#1E293B';
  const icon = type === 'success' ? '📸' : type === 'error' ? '❌' : '🤖';
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
      showMiniToast('Đang cào Album Ảnh Sản Phẩm & Ảnh Thực Tế...', 'info');

      let fullText = document.body.innerText || '';
      if (fullText.length > 20000) fullText = fullText.substring(0, 20000);

      const productImages = pickProductImages();
      const photoReviews = extractPhotoReviewsFromDOM();

      const rawData = {
        fullText,
        image: productImages[0] || '',
        images: productImages.length > 0 ? productImages : [pickProductImage()],
        photoReviews: photoReviews,
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
          showMiniToast(`Đã thêm ${name} + Album Ảnh vào chờ duyệt!`, 'success');
        }
      });
    } catch (error) {
      showMiniToast(`Lỗi quét DOM: ${error.message}`, 'error');
    }
  }
});
