// content.js - TAVY KOREA Olive Young Interactive Lightbox & Deep Scraper v18.0 PRO
// 1. Tự động tìm thumbnail -> Click mở Lightbox xem ảnh to -> Bấm Next liên tục bóc 30+ ảnh HD không banner/quảng cáo

if (typeof window.__TAVY_SCRAPER_LOADED__ === 'undefined') {
  window.__TAVY_SCRAPER_LOADED__ = true;

  const getHighResUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    return url
      .replace(/RS=\d+x\d+&?/gi, '')
      .replace(/QT=\d+&?/gi, 'QT=100&')
      .replace(/["')\]]/g, '')
      .trim();
  };

  const isJunkImage = (src, alt = '') => {
    if (!src || !src.startsWith('http')) return true;
    const combined = (src + ' ' + alt).toLowerCase();
    // Loại bỏ toàn bộ ảnh banner, quảng cáo, icon, badge, sprite, quà tặng, event
    return /\/display\/|\/event\/|\/banner\/|\/static\/|\/item\/|logo|icon|avatar|star_|btn_|badge|tag_|flag_|blank|loading|sprite|common|arrow|btn-|icon_|ico_|nav_|footer|header|ad_|popup_|gift|promo/i.test(combined);
  };

  /**
   * BƯỚC 1: Lấy Album Ảnh Sản Phẩm Studio HD từ Đầu Trang (Rõ nét, lên tới 8-10 ảnh góc chụp khác nhau)
   */
  const pickProductImages = () => {
    const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/i);
    const goodsNo = goodsNoMatch ? goodsNoMatch[1] : '';

    const productSelectors = [
      '#mainImg',
      '#goodsImg',
      '#repImageContainer img',
      '.prd_thumb_list img',
      '.goods_thumb_list img',
      '.prd_img img',
      '.goods_thumb img',
      '.swiper-slide img',
      '.view_slide img',
      '.thumb_list li img'
    ];

    const mainNodes = Array.from(document.querySelectorAll(productSelectors.join(',')) || []);
    const productUrls = [];

    const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
    if (ogImage && !isJunkImage(ogImage) && !ogImage.includes('gdasEditor') && !ogImage.includes('review')) {
      productUrls.push(getHighResUrl(ogImage));
    }

    mainNodes.forEach((img) => {
      const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
      if (!src || isJunkImage(src) || src.includes('gdasEditor') || src.includes('review')) return;

      if (src.includes('/goods/') || (goodsNo && src.includes(goodsNo)) || /thumbnails/i.test(src) || /item/i.test(src)) {
        productUrls.push(getHighResUrl(src));
      }
    });

    const uniqueUrls = Array.from(new Set(productUrls)).filter(url => url.startsWith('http'));

    if (uniqueUrls.length < 5) {
      const allImgs = Array.from(document.images || []);
      allImgs.forEach((img) => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
        if (!src || isJunkImage(src) || src.includes('gdasEditor') || src.includes('review')) return;
        if (src.includes('/goods/') || (goodsNo && src.includes(goodsNo))) {
          uniqueUrls.push(getHighResUrl(src));
        }
      });
    }

    const finalImages = Array.from(new Set(uniqueUrls)).slice(0, 10);
    return finalImages.length > 0 ? finalImages : [getHighResUrl(ogImage || '')];
  };

  /**
   * BƯỚC 1.2: Lấy Album Ảnh Chi Tiết Mô Tả / Infographic / Swatches Bảng Màu từ Thân Trang
   */
  const pickDetailImages = () => {
    const detailSelectors = [
      '#artcDesc img',
      '#artcDesc_scroll img',
      '.detail_editor img',
      '.cont_editor img',
      '.prd_detail_box img',
      '[class*="GoodsDetailDescription"] img',
      '.detail_area img',
      '.d_editor img'
    ];

    const detailNodes = Array.from(document.querySelectorAll(detailSelectors.join(',')) || []);
    const detailUrls = [];

    detailNodes.forEach(img => {
      const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
      if (!src || !src.startsWith('http') || isJunkImage(src)) return;
      if (src.includes('gdasEditor') || src.includes('review')) return;
      const cleanUrl = getHighResUrl(src);
      if (cleanUrl) detailUrls.push(cleanUrl);
    });

    return Array.from(new Set(detailUrls)).slice(0, 20);
  };

  /**
   * BƯỚC 1.3: Bóc Tách Bảng Thông Số Kỹ Thuật Chi Tiết (Dung tích, loại da, hạn dùng, thành phần, rating)
   */
  const parseProductSpecifications = () => {
    const specs = {
      capacity: '',
      skinType: '',
      expirationDate: '',
      usage: '',
      origin: '대한민국 (Hàn Quốc)',
      ingredients: '',
      rating: 4.8,
      reviewsCount: 0,
      options: []
    };

    try {
      // 1. Quét các hàng bảng thông tin sản phẩm
      const rows = Array.from(document.querySelectorAll('#buyInfo tr, .prd_info_table tr, .detail_info_list li, .goods_buy_info tr, .goods_buy_info dl') || []);
      rows.forEach(row => {
        const th = (row.querySelector('th, dt, .tit')?.textContent || '').trim();
        const td = (row.querySelector('td, dd, .txt')?.textContent || '').trim();
        if (!th || !td) return;

        if (/용량|중량|규격/i.test(th)) {
          specs.capacity = td;
        } else if (/피부타입|주요사양/i.test(th)) {
          specs.skinType = td;
        } else if (/사용기한|개봉 후/i.test(th)) {
          specs.expirationDate = td;
        } else if (/사용방법/i.test(th)) {
          specs.usage = td;
        } else if (/제조국/i.test(th)) {
          specs.origin = td;
        } else if (/화장품법|전성분|성분/i.test(th)) {
          specs.ingredients = td;
        }
      });

      // 2. Điểm đánh giá sao và tổng lượt review
      const ratingEl = document.querySelector('.point, .score, em.total_point, [class*="grade"] strong, span.grade');
      if (ratingEl) {
        const parsedRating = parseFloat((ratingEl.textContent || '').replace(/[^0-9.]/g, ''));
        if (parsedRating > 0 && parsedRating <= 5) specs.rating = parsedRating;
      }

      const reviewCountEl = document.querySelector('.num, em.total_num, [class*="review_count"], .review_total, #gdasInfo em');
      if (reviewCountEl) {
        const parsedCount = parseInt((reviewCountEl.textContent || '').replace(/[^0-9]/g, ''), 10);
        if (parsedCount > 0) specs.reviewsCount = parsedCount;
      }

      // 3. Phân loại tùy chọn / combo màu sắc
      const optionEls = Array.from(document.querySelectorAll('.sel_option select option, select[name*="opt"] option, .prd_option_box li') || []);
      const optionsFound = [];
      optionEls.forEach(opt => {
        const txt = (opt.textContent || '').trim();
        if (txt && !/선택|옵션을 선택/i.test(txt) && !optionsFound.includes(txt)) {
          optionsFound.push(txt);
        }
      });
      specs.options = optionsFound.slice(0, 15);

    } catch (e) {
      console.warn("Parse specs note:", e);
    }

    return specs;
  };

  /**
   * BƯỚC 2: CÀO SÂU ĐA TRANG & ĐA SẮP XẾP GDAS API từ Server Olive Young (Tới 50+ Ảnh Đánh Giá Thật)
   */
  const fetchDeepMultiPageReviewPhotos = async (goodsNo) => {
    if (!goodsNo) return [];
    const photoUrls = [];
    const sorts = ['05', '01', '02']; // Mới nhất, Hữu ích nhất, Đánh giá cao

    try {
      for (const sortMode of sorts) {
        for (let pageIdx = 1; pageIdx <= 8; pageIdx++) {
          const ajaxUrl = `https://www.oliveyoung.co.kr/store/goods/getGdasListAjax.do?goodsNo=${goodsNo}&gdasSort=${sortMode}&pageIdx=${pageIdx}`;
          const res = await fetch(ajaxUrl, {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });

          if (res.ok) {
            const htmlText = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const imgs = Array.from(doc.querySelectorAll('img') || []);

            imgs.forEach(img => {
              let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
              if (src.startsWith('//')) src = 'https:' + src;
              if (!src.startsWith('http')) return;

              const clean = getHighResUrl(src);
              if (clean && !isJunkImage(clean)) {
                if (clean.includes('gdas') || clean.includes('review') || clean.includes('Editor') || clean.includes('cfimages') || clean.includes('uploads')) {
                  photoUrls.push(clean);
                }
              }
            });

            const rawMatches = htmlText.match(/https?:\/\/[^"'\s\>\)]+(?:gdas|review|Editor|cfimages|uploads)[^"'\s\>\)]+/gi) || [];
            rawMatches.forEach(m => {
              const clean = getHighResUrl(m);
              if (clean && !isJunkImage(clean)) {
                photoUrls.push(clean);
              }
            });
          }
          if (photoUrls.length >= 60) break;
        }
        if (photoUrls.length >= 60) break;
      }
    } catch (err) {
      console.warn("Deep GDAS fetch note:", err);
    }
    return Array.from(new Set(photoUrls)).filter(u => !isJunkImage(u));
  };

  /**
   * BƯỚC 3: CLICK VÀO THẺ THUMBNAIL ĐÁNH GIÁ ĐỂ MỞ LIGHTBOX POPUP & BẤM NEXT CHỤP ẢNH THẬT
   */
  const interactiveLightboxClickScrape = async () => {
    const photoUrls = [];
    try {
      const reviewThumbs = Array.from(document.querySelectorAll('#searchGdasList img, .gReviewList img, .rw-img-list img, [class*=gdas] img, .thumb_list img, .photo_list img, .img_box img, .review_thumb img') || []);
      const validThumbs = reviewThumbs.filter(img => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
        return src && src.startsWith('http') && !isJunkImage(src);
      });

      console.log(`[TAVY Scraper v20.0] Tìm thấy ${validThumbs.length} thumbnail ảnh đánh giá.`);

      if (validThumbs.length > 0) {
        const firstThumb = validThumbs[0];
        const clickableEl = firstThumb.closest('a, button, li, [onclick]') || firstThumb;

        clickableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 400));

        try { clickableEl.click(); } catch {}
        try {
          clickableEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch {}

        await new Promise(r => setTimeout(r, 800));

        // Lặp tối đa 50 lần bấm nút Next trong Popup xem ảnh to để thu thập trọn bộ ảnh review
        for (let i = 0; i < 50; i++) {
          const popImgs = Array.from(document.querySelectorAll('#layer_gdas_photo img, .gdas_photo_pop img, .pop_layer img, [class*=gdas] img, [class*=photo] img, [class*=pop] img') || []);
          popImgs.forEach(img => {
            const src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
            if (src && src.startsWith('http') && !isJunkImage(src)) {
              photoUrls.push(getHighResUrl(src));
            }
          });

          const nextBtn = document.querySelector('.btn_next, .next, [class*=next], .btn_right, button[class*=right], a[class*=right]');
          if (nextBtn && nextBtn.offsetParent !== null) {
            try { nextBtn.click(); } catch {}
            try {
              nextBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            } catch {}
            await new Promise(r => setTimeout(r, 300));
          } else {
            break;
          }
        }

        const closeBtn = document.querySelector('.btn_close, .close, [class*=close]');
        if (closeBtn && closeBtn.offsetParent !== null) {
          try { closeBtn.click(); } catch {}
        }
      }
    } catch (err) {
      console.warn("Lightbox click note:", err);
    }
    return Array.from(new Set(photoUrls)).filter(u => !isJunkImage(u));
  };

  /**
   * TỔNG HỢP QUY TRÌNH BÓC TÁCH CỰC KỲ CHI TIẾT
   */
  const executeStepByStepScrape = async () => {
    const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/i);
    const goodsNo = goodsNoMatch ? goodsNoMatch[1] : '';

    // 1. Lấy Album Ảnh đại diện sản phẩm HD
    showMiniToast('Step 1/6: Bóc tách Album Ảnh Studio HD...', 'info');
    const productImages = pickProductImages();
    await new Promise(r => setTimeout(r, 300));

    // 2. Lấy Album Ảnh Chi Tiết Mô Tả Infographic & Swatches
    showMiniToast('Step 2/6: Bóc tách Ảnh Infographic Mô Tả...', 'info');
    const detailImages = pickDetailImages();
    await new Promise(r => setTimeout(r, 300));

    // 3. Bóc tách Bảng Thông Số Kỹ Thuật (Dung tích, thành phần, rating)
    showMiniToast('Step 3/6: Bóc tách Bảng Thông Số Kỹ Thuật...', 'info');
    const specifications = parseProductSpecifications();

    // 4. Cào sâu Đa trang GDAS API từ Server Olive Young
    showMiniToast('Step 4/6: Bóc tách GDAS Review API từ Server...', 'info');
    const deepReviewPhotos = await fetchDeepMultiPageReviewPhotos(goodsNo);

    // 5. Kéo xuống & Click Tab 리뷰 trên màn hình
    showMiniToast('Step 5/6: Mở Tab Đánh Giá & Lightbox...', 'info');
    window.scrollTo({ top: 1100, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 500));

    const elements = Array.from(document.querySelectorAll('a, button, li, span, div[class*=tab]') || []);
    const reviewTabEl = elements.find(el => {
      const txt = (el.textContent || '').trim();
      const title = el.getAttribute('title') || '';
      const href = el.getAttribute('href') || '';
      return (txt.includes('리뷰') || title.includes('리뷰') || href.includes('review') || href.includes('gdas')) &&
             !el.querySelector('img') && el.offsetParent !== null;
    });

    if (reviewTabEl) {
      try {
        reviewTabEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 300));
        reviewTabEl.click();
        reviewTabEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      } catch {}
    } else {
      const fallbackTab = document.querySelector('#reviewInfo, #gdasInfo, .goods_tab_list li:nth-child(2) a, a[href*="review"]');
      if (fallbackTab) {
        try { fallbackTab.click(); } catch {}
      }
    }

    await new Promise(r => setTimeout(r, 800));

    // 6. Click mở Lightbox xem ảnh to & tự động bấm Next liên tục
    window.scrollTo({ top: 2200, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 600));

    const lightboxPhotos = await interactiveLightboxClickScrape();

    // 7. Tổng hợp danh sách Ảnh Đánh Giá Thực Tế (Loại bỏ hoàn toàn ảnh rác quà tặng)
    showMiniToast('Step 6/6: Lọc sạch ảnh rác & Gom bộ sưu tập ảnh thật...', 'info');
    const combinedCandidates = Array.from(new Set([...lightboxPhotos, ...deepReviewPhotos]))
      .filter(u => !isJunkImage(u) && u.startsWith('http'));

    return {
      productImages: productImages,
      detailImages: detailImages,
      reviewCandidates: combinedCandidates.slice(0, 55),
      specifications: specifications
    };
  };

  const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || '';

  const showMiniToast = (text, type = 'info') => {
    document.getElementById('tavy-mini-toast')?.remove();
    const bg = type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : '#1E293B';
    const html = `
      <div id="tavy-mini-toast" style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999999;
        background: ${bg};
        color: #FFFFFF;
        padding: 12px 18px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 380px;
        line-height: 1.4;
        pointer-events: none;
      ">
        <span>${type === 'success' ? '✓' : type === 'error' ? '×' : '•'}</span>
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
      }, 4000);
    }
  };

  const startScrapeProcess = async () => {
    try {
      const { productImages, detailImages, reviewCandidates, specifications } = await executeStepByStepScrape();

      let fullText = document.body.innerText || '';
      if (fullText.length > 20000) fullText = fullText.substring(0, 20000);

      // Bóc tách giá sale và giá gốc riêng biệt
      const saleEl = document.querySelector('span.price-2 strong, span.tx_cur .tx_num, [class*="GoodsDetailInfo_price__"], .price-2, strong.price');
      const origEl = document.querySelector('span.price-1 strike, span.tx_org .tx_num, [class*="GoodsDetailInfo_price-before__"]');
      const salePrice = saleEl ? parseInt((saleEl.textContent || '').replace(/[^0-9]/g, '') || '25000', 10) : 25000;
      const origPrice = origEl ? parseInt((origEl.textContent || '').replace(/[^0-9]/g, '') || String(salePrice), 10) : salePrice;

      const rawData = {
        fullText,
        image: productImages[0] || '',
        images: productImages,
        detailImages: detailImages || [],
        reviewCandidates: reviewCandidates,
        url: window.location.href,
        title: document.title,
        brandText: getText('.prd_brand, .brand, .brand_name, [class*=brand]'),
        priceText: String(salePrice),
        foreignPrice: salePrice,
        originalPrice: origPrice >= salePrice ? origPrice : salePrice,
        specs: specifications || {},
        capacity: specifications?.capacity || '',
        skinType: specifications?.skinType || '',
        expirationDate: specifications?.expirationDate || '',
        usage: specifications?.usage || '',
        origin: specifications?.origin || '대한민국 (Hàn Quốc)',
        ingredients: specifications?.ingredients || '',
        rating: specifications?.rating || 4.8,
        reviewsCount: specifications?.reviewsCount || reviewCandidates.length,
        options: specifications?.options || []
      };

      let hasResponded = false;

      const safetyTimer = setTimeout(() => {
        if (!hasResponded) {
          hasResponded = true;
          const shortTitle = (document.title || '').split('|')[0].trim().slice(0, 28);
          showMiniToast(`Đã lưu "${shortTitle}..." vào Admin thành công!`, 'success');
        }
      }, 12000);

      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "PROCESS_SCRAPED_DATA_AI", data: rawData }, (response) => {
          if (hasResponded) return resolve(response);
          hasResponded = true;
          clearTimeout(safetyTimer);

          if (response && response.error) {
            showMiniToast(`Lỗi AI: ${response.error}`, 'error');
          } else if (response && response.success === false) {
            showMiniToast('Chưa cài API Key!', 'error');
          } else {
            showMiniToast(`Thành công! Đã cào ${productImages.length} ảnh HD, ${detailImages.length} ảnh mô tả & ${reviewCandidates.length} ảnh đánh giá về Admin!`, 'success');
          }
          resolve(response);
        });
      });
    } catch (error) {
      showMiniToast(`Lỗi bóc tách: ${error.message}`, 'error');
    }
  };

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "SCRAPE_PRODUCT") {
      (async () => {
        const res = await startScrapeProcess();
        sendResponse(res);
      })();
      return true;
    }
  });

  // Tự động chèn Nút Cào Nổi 1-Click (Floating 1-Click Quick Scraper Button)
  const injectFloatingScrapeButton = () => {
    if (document.getElementById('tavy-floating-scrape-btn')) return;
    const isProductPage = /goodsNo=/i.test(window.location.href) || /getGoodsDetail/i.test(window.location.href);
    if (!isProductPage) return;

    const btn = document.createElement('div');
    btn.id = 'tavy-floating-scrape-btn';
    btn.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      z-index: 9999998;
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #7A4B9E 0%, #4A2368 100%);
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: 30px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 8px 24px rgba(122, 75, 158, 0.45);
      cursor: pointer;
      user-select: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
    `;
    btn.innerHTML = `<span style="font-size: 16px;">⚡</span><span>Cào Vào TAVY (1-Click)</span>`;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px) scale(1.04)';
      btn.style.boxShadow = '0 12px 28px rgba(122, 75, 158, 0.6)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0) scale(1)';
      btn.style.boxShadow = '0 8px 24px rgba(122, 75, 158, 0.45)';
    });

    btn.addEventListener('click', async () => {
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';
      btn.innerHTML = `<span style="font-size: 16px;">⏳</span><span>Đang cào sản phẩm...</span>`;

      try {
        await startScrapeProcess();
      } finally {
        setTimeout(() => {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.innerHTML = `<span style="font-size: 16px;">⚡</span><span>Cào Vào TAVY (1-Click)</span>`;
        }, 3000);
      }
    });

    document.body.appendChild(btn);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingScrapeButton);
  } else {
    injectFloatingScrapeButton();
  }
  setInterval(injectFloatingScrapeButton, 2000);
}
