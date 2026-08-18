// content.js - Chạy trên trang Olive Young (Version 3.8 - Maximum Review Photos Scraper)

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

  if (mainImgSrc && !/banner|display|event|gift|coupon|attached|Logo|Icon|gdasEditor|thumb_default/i.test(mainImgSrc)) {
    candidateUrls.push(mainImgSrc);
  }

  imgList.forEach((img) => {
    const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
    const rect = img.getBoundingClientRect();
    const width = img.naturalWidth || rect.width || 0;
    const height = img.naturalHeight || rect.height || 0;
    const alt = img.alt || '';

    if (!src || width < 150 || height < 150) return;

    if (/banner|display|event|gift|coupon|attached|Logo|Icon|gdasEditor|sprite|blank|loading/i.test(src + alt)) {
      return;
    }

    const isThumbnail = /thumbnails/i.test(src);
    const isMatchGoodsNo = goodsNo && src.includes(goodsNo);

    if (isThumbnail || isMatchGoodsNo || (width >= 250 && height >= 250)) {
      candidateUrls.push(src);
    }
  });

  const uniqueUrls = Array.from(new Set(candidateUrls)).map(url => {
    return url.replace(/["')\]]/g, '').trim();
  }).filter(url => url.startsWith('http'));

  return uniqueUrls.length > 0 ? uniqueUrls.slice(0, 15) : [ogImage || mainImgSrc || ''];
};

const pickProductImage = () => {
  const images = pickProductImages();
  return images[0] || document.querySelector('meta[property="og:image"]')?.content || '';
};

// Thu thập TỐI ĐA TẤT CẢ Ảnh Đánh Giá Thực Tế từ Khách Hàng (Tối đa 100+ ảnh)
const extractPhotoReviewsFromDOM = () => {
  const selectors = [
    '.gReviewList img', '.review_list img', '#gdasList img', '[class*=review] img', 
    '[class*=gdas] img', '.thumbs img', '.thumb_list img', '.photo_list img',
    '[class*=photo] img', '.img_box img', '.rw-img-list img', '.review_cont img'
  ];
  
  const reviewImgNodes = Array.from(document.querySelectorAll(selectors.join(',')) || []);
  const photoUrls = [];

  reviewImgNodes.forEach((img) => {
    const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
    if (!src || !src.startsWith('http')) return;
    
    // Loại bỏ icon, avatar, logo, star, banner
    if (!/icon|logo|avatar|star|thumb_default|blank|loading|banner|event|gift/i.test(src)) {
      // Chuẩn hóa URL HD
      const hdSrc = src.replace(/RS=\d+x\d+&?/gi, '').replace(/QT=\d+&?/gi, 'QT=100&').replace(/["')\]]/g, '').trim();
      photoUrls.push(hdSrc);
    }
  });

  return Array.from(new Set(photoUrls)).slice(0, 80);
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

// Trích xuất danh sách 50 mã sản phẩm Ranking Best Sellers từ Olive Young
const extractRankingGoodsFromDOM = () => {
  const links = Array.from(document.querySelectorAll('a[href*="goodsNo="]') || []);
  const goodsMap = new Map();

  links.forEach(a => {
    const href = a.href || a.getAttribute('href') || '';
    const match = href.match(/goodsNo=([A-Za-z0-9_]+)/i);
    if (match) {
      const goodsNo = match[1].toUpperCase();
      if (!goodsMap.has(goodsNo)) {
        goodsMap.set(goodsNo, `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`);
      }
    }
  });

  return Array.from(goodsMap.entries()).map(([goodsNo, url]) => ({ goodsNo, url })).slice(0, 50);
};

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "SCRAPE_RANKING_50") {
    try {
      showMiniToast('🔥 Đang cào danh sách 50 mã Ranking Olive Young...', 'info');
      const items = extractRankingGoodsFromDOM();
      showMiniToast(`Đã tìm thấy ${items.length} mã sản phẩm trên trang!`, 'success');
      sendResponse({ success: true, items });
    } catch (e) {
      showMiniToast(`Lỗi quét Ranking: ${e.message}`, 'error');
      sendResponse({ success: false, error: e.message, items: [] });
    }
    return true;
  }

  if (request.action === "SCRAPE_PRODUCT") {
    try {
      showMiniToast('Đang cào tối đa Album Ảnh Sản Phẩm & Ảnh Đánh Giá...', 'info');

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
          showMiniToast(`Đã bóc tách ${photoReviews.length + productImages.length}+ Ảnh thành công!`, 'success');
        }
      });
    } catch (error) {
      showMiniToast(`Lỗi quét DOM: ${error.message}`, 'error');
    }
  }
});
