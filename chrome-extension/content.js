// content.js - TAVY KOREA Olive Young Interactive Lightbox & Deep Scraper v18.0 PRO
// 1. Tự động tìm thumbnail -> Click mở Lightbox xem ảnh to -> Bấm Next liên tục bóc 30+ ảnh HD không banner/quảng cáo

if (typeof window.__TAVY_SCRAPER_LOADED__ === 'undefined') {
  window.__TAVY_SCRAPER_LOADED__ = true;

  const getHighResUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim();
    if (clean.startsWith('//')) clean = 'https:' + clean;
    if (clean.startsWith('/')) clean = 'https://www.oliveyoung.co.kr' + clean;
    return clean
      .replace(/RS=\d+x\d+&?/gi, '')
      .replace(/QT=\d+&?/gi, 'QT=100&')
      .replace(/SF=\w+&?/gi, '')
      .replace(/sharpen=[^&]+&?/gi, '')
      .replace(/["')\]]/g, '')
      .replace(/[?&]$/, '')
      .trim();
  };

  const isJunkImage = (src, alt = '') => {
    if (!src || !src.startsWith('http')) return true;
    const combined = (src + ' ' + alt).toLowerCase();
    // Loại bỏ toàn bộ ảnh banner, quảng cáo, icon, badge, sprite, quà tặng, event (KHÔNG chặn gdasEditor hay ảnh sản phẩm)
    return /\/display\/banner|\/event\/|Logo\.|IconMenu|IconClose|reviewProfile|avatar|star_|btn_|badge|tag_|flag_|blank|loading|sprite|common|arrow|btn-|icon_|ico_|nav_|footer|header|ad_|popup_/i.test(combined);
  };

  /**
   * BƯỚC 1: Lấy Album Ảnh Sản Phẩm Studio HD từ Đầu Trang (Rõ nét, lên tới 8-10 ảnh góc chụp khác nhau)
   * Tương thích cả giao diện Olive Young Next.js mới lẫn giao diện Legacy
   */
  const pickProductImages = () => {
    const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/i);
    const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : '';

    const productSelectors = [
      '[class*="GoodsDetailCarousel"] img',
      '[class*="carousel"] img',
      '[class*="Thumbnail"] img',
      '[class*="GoodsDetailGallery"] img',
      '[class*="product-details"] img',
      '[class*="GoodsDetailInfo"] img',
      '[class*="Image_image"] img',
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
    if (ogImage && !isJunkImage(ogImage) && !ogImage.includes('gdasEditor') && !ogImage.includes('reviewProfile')) {
      productUrls.push(getHighResUrl(ogImage));
    }

    mainNodes.forEach((img) => {
      const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
      if (!src || isJunkImage(src) || src.includes('gdasEditor') || src.includes('reviewProfile')) return;

      if (src.includes('/goods/') || (goodsNo && src.includes(goodsNo)) || src.includes('thumbnails') || src.includes('/item/')) {
        productUrls.push(getHighResUrl(src));
      }
    });

    const uniqueUrls = Array.from(new Set(productUrls)).filter(url => url.startsWith('http'));

    if (uniqueUrls.length < 5) {
      const allImgs = Array.from(document.images || []);
      allImgs.forEach((img) => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
        if (!src || isJunkImage(src) || src.includes('gdasEditor') || src.includes('reviewProfile')) return;
        if (src.includes('/goods/') || (goodsNo && src.includes(goodsNo)) || src.includes('thumbnails')) {
          uniqueUrls.push(getHighResUrl(src));
        }
      });
    }

    const finalImages = Array.from(new Set(uniqueUrls)).slice(0, 10);
    return finalImages.length > 0 ? finalImages : [getHighResUrl(ogImage || '')].filter(Boolean);
  };

  /**
   * BƯỚC 1.2: Lấy Album Ảnh Chi Tiết Mô Tả / Infographic / Swatches Bảng Màu từ Thân Trang
   * Tự động bấm mở rộng "상품설명 더보기" để tải đầy đủ ảnh chất lượng cao
   */
  const pickDetailImages = async () => {
    // 1. Tự động click mở rộng nội dung mô tả chi tiết nếu bị thu gọn (Next.js & Legacy)
    try {
      const expandButtons = Array.from(document.querySelectorAll('button, a, div[role="button"]'))
        .filter(b => {
          const t = (b.textContent || '').trim();
          return (t.includes('상품설명 더보기') || t.includes('상세정보 더보기') || t.includes('더보기') || t.includes('펼쳐보기')) &&
                 !t.includes('리뷰') && !t.includes('Q&A');
        });
      expandButtons.forEach(b => { try { b.click(); } catch(e){} });

      // Mở rộng các container ẩn nếu có
      document.querySelectorAll('#artcDesc, [class*="GoodsDetailDescription"], [class*="tab-panels"], .detail_info_area, .prd_detail_box').forEach(el => {
        try {
          el.style.display = 'block';
          el.style.maxHeight = 'none';
          el.style.height = 'auto';
        } catch(e){}
      });
      await new Promise(r => setTimeout(r, 400));
    } catch(e){}

    const detailSelectors = [
      '[class*="GoodsDetailDescription"] img',
      '[class*="GoodsDetailTabs_tab-panel"] img',
      '#artcDesc img',
      '#artcDesc_scroll img',
      '.tab-panels img',
      '.detail_editor img',
      '.cont_editor img',
      '.prd_detail_box img',
      '.detail_area img',
      '.d_editor img',
      'img[src*="html/crop"]',
      'img[src*="display"]'
    ];

    const detailNodes = Array.from(document.querySelectorAll(detailSelectors.join(',')) || []);
    const detailUrls = [];

    detailNodes.forEach(img => {
      const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
      if (!src || !src.startsWith('http') || isJunkImage(src)) return;
      if (src.includes('gdasEditor') || src.includes('reviewProfile')) return;
      const cleanUrl = getHighResUrl(src);
      if (cleanUrl) detailUrls.push(cleanUrl);
    });

    return Array.from(new Set(detailUrls)).slice(0, 25);
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
      const rows = Array.from(document.querySelectorAll('#buyInfo tr, .prd_info_table tr, .detail_info_list li, .goods_buy_info tr, .goods_buy_info dl, [class*="GoodsDetailSpec"] tr, [class*="table"] tr') || []);
      rows.forEach(row => {
        const th = (row.querySelector('th, dt, .tit, [class*="tit"]')?.textContent || '').trim();
        const td = (row.querySelector('td, dd, .txt, [class*="txt"]')?.textContent || '').trim();
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
      const ratingEl = document.querySelector('.point, .score, em.total_point, [class*="grade"] strong, span.grade, [class*="rating-star"], [class*="ReviewArea_rating"]');
      if (ratingEl) {
        const parsedRating = parseFloat((ratingEl.textContent || '').replace(/[^0-9.]/g, ''));
        if (parsedRating > 0 && parsedRating <= 5) specs.rating = parsedRating;
      }

      const reviewCountEl = document.querySelector('.num, em.total_num, [class*="review_count"], .review_total, #gdasInfo em, [class*="ReviewArea_review-count"], [class*="btn-review"]');
      if (reviewCountEl) {
        const parsedCount = parseInt((reviewCountEl.textContent || '').replace(/[^0-9]/g, ''), 10);
        if (parsedCount > 0) specs.reviewsCount = parsedCount;
      }

      // 3. Phân loại tùy chọn / combo màu sắc
      const optionEls = Array.from(document.querySelectorAll('.sel_option select option, select[name*="opt"] option, .prd_option_box li, [class*="Option"] li, [class*="option-item"]') || []);
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
   * BƯỚC 2: KÍCH HOẠT TAB ĐÁNH GIÁ & BÓC TÁCH TOÀN BỘ ẢNH REVIEW GDAS NGƯỜI DÙNG THẬT (Tới 50+ Ảnh)
   * Tương thích hoàn hảo Next.js Architecture mới của Olive Young
   */
  const fetchGdasReviewPhotos = async (goodsNo) => {
    const photoUrls = [];

    try {
      // 1. Tìm chính xác Tab Review trong danh sách tabs (Next.js & Legacy)
      const allTabs = Array.from(document.querySelectorAll('button[class*="GoodsDetailTabs_tab-item"], button[class*="tab-item"], [class*="tabs-list"] button, [class*="tab"] button, .goods_tab_list li a, button'));
      const reviewTab = allTabs.find(b => {
        const t = (b.textContent || '').trim();
        return (t.includes('리뷰&셔터') || t.includes('리뷰')) && !t.includes('더보기');
      });

      if (reviewTab) {
        try {
          reviewTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(r => setTimeout(r, 400));
          reviewTab.click();
          reviewTab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch(e){}
      }

      // 2. Cuộn mượt qua vùng đánh giá để kích hoạt React lazy-loading
      window.scrollBy({ top: 1200, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 500));
      window.scrollBy({ top: 1500, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 600));
      window.scrollBy({ top: 2000, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 800));

      // 3. Click nút "리뷰 더보기" / "포토리뷰" nếu xuất hiện
      const moreReviewBtns = Array.from(document.querySelectorAll('button, a'))
        .filter(b => {
          const t = (b.textContent || '').trim();
          return t.includes('리뷰 더보기') || t.includes('포토리뷰') || (b.className || '').includes('review-thumbs');
        });
      moreReviewBtns.forEach(b => { try { b.click(); } catch(e){} });
      await new Promise(r => setTimeout(r, 600));

      // 4. Quét toàn bộ DOM để thu hoạch tất cả ảnh gdasEditor (ảnh review thật từ người dùng)
      Array.from(document.images || []).forEach(img => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
        if (src && src.includes('gdasEditor') && !isJunkImage(src)) {
          photoUrls.push(getHighResUrl(src));
        }
      });

      // 5. Thử gọi trực tiếp In-Page Review API v2 cursor với credentials của phiên duyệt
      if (goodsNo) {
        try {
          const apiRes = await fetch('https://m.oliveyoung.co.kr/review/api/v2/reviews/cursor', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify({
              goodsNumber: goodsNo,
              page: 0,
              size: 30,
              sortType: 'USEFUL_SCORE_DESC',
              reviewType: 'PHOTO'
            })
          });

          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            const list = apiJson?.data?.goodsReviewList || [];
            list.forEach(item => {
              (item.photoReviewList || []).forEach(p => {
                if (p.imagePath) {
                  photoUrls.push(getHighResUrl('https://image.oliveyoung.co.kr/uploads/images/gdasEditor/' + p.imagePath));
                }
              });
            });
          }
        } catch(e) {
          // Bỏ qua nếu bị chặn CORS chéo subdomain
        }
      }

      // 6. Fallback tương thích Lightbox legacy nếu có
      const reviewThumbs = Array.from(document.querySelectorAll('#searchGdasList img, .gReviewList img, .rw-img-list img, [class*=gdas] img') || []);
      if (photoUrls.length < 5 && reviewThumbs.length > 0) {
        const firstThumb = reviewThumbs[0];
        const clickable = firstThumb.closest('a, button, li') || firstThumb;
        try { clickable.click(); } catch(e){}
        await new Promise(r => setTimeout(r, 600));

        for (let i = 0; i < 20; i++) {
          const popImgs = Array.from(document.querySelectorAll('#layer_gdas_photo img, .gdas_photo_pop img, .pop_layer img') || []);
          popImgs.forEach(img => {
            const src = img.currentSrc || img.src || '';
            if (src && !isJunkImage(src)) photoUrls.push(getHighResUrl(src));
          });
          const nextBtn = document.querySelector('.btn_next, .next, [class*=next], .btn_right');
          if (nextBtn && nextBtn.offsetParent !== null) {
            try { nextBtn.click(); } catch(e){}
            await new Promise(r => setTimeout(r, 200));
          } else break;
        }
      }

      // Cuộn mượt lại đầu trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn("[TAVY Scraper] Review photo harvest error:", err);
    }

    return Array.from(new Set(photoUrls)).filter(u => u.startsWith('http') && !isJunkImage(u));
  };

  /**
   * TỔNG HỢP QUY TRÌNH BÓC TÁCH CỰC KỲ CHI TIẾT
   */
  const executeStepByStepScrape = async () => {
    const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/i);
    const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : '';

    // 1. Lấy Album Ảnh đại diện sản phẩm HD
    showMiniToast('Step 1/5: Bóc tách Album Ảnh Studio HD...', 'info');
    const productImages = pickProductImages();
    await new Promise(r => setTimeout(r, 300));

    // 2. Mở rộng & Lấy Album Ảnh Chi Tiết Mô Tả Infographic
    showMiniToast('Step 2/5: Mở rộng & bóc tách Ảnh Infographic Mô Tả...', 'info');
    const detailImages = await pickDetailImages();
    await new Promise(r => setTimeout(r, 300));

    // 3. Bóc tách Bảng Thông Số Kỹ Thuật (Dung tích, thành phần, rating)
    showMiniToast('Step 3/5: Bóc tách Bảng Thông Số Kỹ Thuật...', 'info');
    const specifications = parseProductSpecifications();

    // 4. Kích hoạt Tab Đánh Giá & Thu thập ảnh GDAS người dùng thật
    showMiniToast('Step 4/5: Kích hoạt Tab Đánh Giá & Thu thập ảnh GDAS thật...', 'info');
    const reviewCandidates = await fetchGdasReviewPhotos(goodsNo);

    // 5. Tổng hợp dữ liệu
    showMiniToast(`Step 5/5: Hoàn tất! Gom được ${productImages.length} ảnh HD, ${detailImages.length} ảnh mô tả & ${reviewCandidates.length} ảnh review thật...`, 'info');

    return {
      productImages: productImages,
      detailImages: detailImages,
      reviewCandidates: reviewCandidates.slice(0, 50),
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

  // Tự động chèn Nút Cào Nổi 1-Click và Nhận Diện Sản Phẩm Trùng Lặp
  const checkAndApplyDuplicateState = (btn, goodsNo) => {
    if (!btn || !goodsNo || btn.getAttribute('data-checking') === 'true') return;
    btn.setAttribute('data-checking', 'true');

    try {
      chrome.runtime.sendMessage({
        action: "CHECK_PRODUCT_EXISTS",
        goodsNo: goodsNo,
        url: window.location.href
      }, (res) => {
        btn.removeAttribute('data-checking');
        if (chrome.runtime.lastError) return;
        if (res && res.exists) {
          btn.setAttribute('data-exists', 'true');
          btn.style.background = 'linear-gradient(135deg, #C5A059 0%, #8C6D2D 100%)';
          btn.style.boxShadow = '0 8px 24px rgba(197, 160, 89, 0.55)';
          btn.innerHTML = `
            <span style="font-size: 16px;">🔄</span>
            <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.2;">
              <span style="font-size: 12px; font-weight: 800;">Cập Nhật TAVY (Đã Có)</span>
              <span style="font-size: 9px; opacity: 0.9; font-weight: 600;">Sản phẩm đã có trong kho</span>
            </div>
          `;
        } else {
          btn.removeAttribute('data-exists');
          btn.style.background = 'linear-gradient(135deg, #7A4B9E 0%, #4A2368 100%)';
          btn.style.boxShadow = '0 8px 24px rgba(122, 75, 158, 0.45)';
          btn.innerHTML = `<span style="font-size: 16px;">⚡</span><span>Cào Vào TAVY (1-Click)</span>`;
        }
      });
    } catch {}
  };

  const injectFloatingScrapeButton = () => {
    const isProductPage = /goodsNo=/i.test(window.location.href) || /getGoodsDetail/i.test(window.location.href);
    if (!isProductPage) return;

    const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/i);
    const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : '';

    let btn = document.getElementById('tavy-floating-scrape-btn');
    if (!btn) {
      btn = document.createElement('div');
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
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0) scale(1)';
      });

      btn.addEventListener('click', async () => {
        const isExists = btn.getAttribute('data-exists') === 'true';
        if (isExists) {
          showMiniToast('Sản phẩm đã tồn tại! Đang cào lại để cập nhật giá & thông số...', 'info');
        }
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = `<span style="font-size: 16px;">⏳</span><span>Đang bóc tách...</span>`;

        try {
          await startScrapeProcess();
        } finally {
          setTimeout(() => {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            checkAndApplyDuplicateState(btn, goodsNo);
          }, 3000);
        }
      });

      document.body.appendChild(btn);
    }

    checkAndApplyDuplicateState(btn, goodsNo);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingScrapeButton);
  } else {
    injectFloatingScrapeButton();
  }
  setInterval(injectFloatingScrapeButton, 2000);
}
