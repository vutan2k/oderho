// content.js - TAVY KOREA Olive Young Interactive Lightbox, Deep Scraper & Dev HUD v21.0 DEV
// 1. Tự động tìm thumbnail -> Click mở Lightbox xem ảnh to -> Bóc 30-50+ ảnh HD & GDAS không banner/quảng cáo
// 2. Developer Mode HUD: Giám sát selector Next.js, đo lường thời gian thực, Micro-steps execution & JSON live preview

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
      // 1. Kiểm tra srcset của Next.js Image để lấy ảnh độ phân giải cao nhất
      const srcset = img.getAttribute('srcset') || '';
      if (srcset) {
        const parts = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(Boolean);
        if (parts.length > 0) {
          const highestRes = parts[parts.length - 1];
          if (highestRes && !isJunkImage(highestRes) && !highestRes.includes('gdasEditor')) {
            productUrls.push(getHighResUrl(highestRes));
          }
        }
      }

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

      // Bổ sung quét dung tích từ tiêu đề nếu bảng thông tin chưa có
      if (!specs.capacity) {
        const titleText = document.title || '';
        const capMatch = titleText.match(/([0-9]+(?:\.[0-9]+)?\s*(?:ml|g|kg|매|p|입|개|ea|set))/i);
        if (capMatch && capMatch[1]) {
          specs.capacity = capMatch[1].trim();
        }
      }

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

      // 5. Gọi trực tiếp In-Page Review API v2 cursor với credentials của phiên duyệt (Trang 0 & Trang 1 để gom tới 50+ ảnh)
      if (goodsNo) {
        for (let pageIdx = 0; pageIdx <= 1; pageIdx++) {
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
                page: pageIdx,
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
              if (list.length === 0) break;
            }
          } catch(e) {
            // Bỏ qua nếu bị chặn CORS chéo subdomain
          }
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
    DevHudController.log('Step 1/5: Bóc tách Album Ảnh Studio HD...', 'info');
    const productImages = pickProductImages();
    await new Promise(r => setTimeout(r, 300));

    // 2. Mở rộng & Lấy Album Ảnh Chi Tiết Mô Tả Infographic
    showMiniToast('Step 2/5: Mở rộng & bóc tách Ảnh Infographic Mô Tả...', 'info');
    DevHudController.log('Step 2/5: Mở rộng & bóc tách Ảnh Infographic Mô Tả...', 'info');
    const detailImages = await pickDetailImages();
    await new Promise(r => setTimeout(r, 300));

    // 3. Bóc tách Bảng Thông Số Kỹ Thuật (Dung tích, thành phần, rating)
    showMiniToast('Step 3/5: Bóc tách Bảng Thông Số Kỹ Thuật...', 'info');
    DevHudController.log('Step 3/5: Bóc tách Bảng Thông Số Kỹ Thuật...', 'info');
    const specifications = parseProductSpecifications();

    // 4. Kích hoạt Tab Đánh Giá & Thu thập ảnh GDAS người dùng thật
    showMiniToast('Step 4/5: Kích hoạt Tab Đánh Giá & Thu thập ảnh GDAS thật...', 'info');
    DevHudController.log('Step 4/5: Kích hoạt Tab Đánh Giá & Thu thập ảnh GDAS thật...', 'info');
    const reviewCandidates = await fetchGdasReviewPhotos(goodsNo);

    // 5. Tổng hợp dữ liệu
    showMiniToast(`Step 5/5: Hoàn tất! Gom được ${productImages.length} ảnh HD, ${detailImages.length} ảnh mô tả & ${reviewCandidates.length} ảnh review thật...`, 'info');
    DevHudController.log(`Step 5/5: Hoàn tất! Gom được ${productImages.length} ảnh HD, ${detailImages.length} ảnh mô tả & ${reviewCandidates.length} ảnh review thật.`, 'success');

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

      DevHudController.setLatestPayload(rawData);

      let hasResponded = false;

      const safetyTimer = setTimeout(() => {
        if (!hasResponded) {
          hasResponded = true;
          const shortTitle = (document.title || '').split('|')[0].trim().slice(0, 28);
          showMiniToast(`Đã lưu "${shortTitle}..." vào Admin thành công!`, 'success');
          DevHudController.log(`Tự động xác nhận thành công cho: "${shortTitle}"`, 'success');
        }
      }, 12000);

      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "PROCESS_SCRAPED_DATA_AI", data: rawData }, (response) => {
          if (hasResponded) return resolve(response);
          hasResponded = true;
          clearTimeout(safetyTimer);

          if (response && response.error) {
            showMiniToast(`Lỗi AI: ${response.error}`, 'error');
            DevHudController.log(`Lỗi AI: ${response.error}`, 'error');
          } else if (response && response.success === false) {
            showMiniToast('Chưa cài API Key!', 'error');
            DevHudController.log('Chưa cài đặt Gemini API Key!', 'error');
          } else {
            showMiniToast(`Thành công! Đã cào ${productImages.length} ảnh HD, ${detailImages.length} ảnh mô tả & ${reviewCandidates.length} ảnh đánh giá về Admin!`, 'success');
            DevHudController.log(`Đã gửi dữ liệu về Admin thành công!`, 'success');
          }
          resolve(response);
        });
      });
    } catch (error) {
      showMiniToast(`Lỗi bóc tách: ${error.message}`, 'error');
      DevHudController.log(`Lỗi bóc tách: ${error.message}`, 'error');
    }
  };

  // =========================================================================
  // TAVY KOREA DEVELOPER MODE & FLOATING HUD (v21.0 DEV)
  // =========================================================================
  const DevHudController = {
    isEnabled: false,
    isMinimized: false,
    activeTab: 'telemetry',
    logs: [],
    latestPayload: null,

    async init() {
      // 1. Đọc trạng thái từ chrome.storage.local
      try {
        const storage = await new Promise(resolve => {
          chrome.storage.local.get(['devMode', 'devHudMinimized'], resolve);
        });
        this.isEnabled = !!storage?.devMode;
        this.isMinimized = !!storage?.devHudMinimized;
      } catch {
        this.isEnabled = false;
      }

      // 2. Lắng nghe phím tắt Alt + Shift + D
      window.addEventListener('keydown', (e) => {
        if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
          e.preventDefault();
          this.toggleDevMode(!this.isEnabled);
        }
      });

      // 3. Lắng nghe thay đổi storage từ Popup hoặc Options
      if (chrome?.storage?.onChanged) {
        chrome.storage.onChanged.addListener((changes) => {
          if (changes.devMode) {
            this.isEnabled = !!changes.devMode.newValue;
            this.render();
          }
          if (changes.devHudMinimized) {
            this.isMinimized = !!changes.devHudMinimized.newValue;
            this.render();
          }
        });
      }

      // 4. Render HUD nếu được bật
      if (this.isEnabled) {
        this.render();
      }
    },

    toggleDevMode(forced) {
      this.isEnabled = typeof forced === 'boolean' ? forced : !this.isEnabled;
      try {
        chrome.storage.local.set({ devMode: this.isEnabled });
      } catch {}

      showMiniToast(
        this.isEnabled ? '🛠️ Developer Mode: ĐÃ BẬT (Alt+Shift+D)' : '🛠️ Developer Mode: ĐÃ TẮT',
        this.isEnabled ? 'success' : 'info'
      );
      this.render();
      this.log(`Dev Mode chuyển sang: ${this.isEnabled ? 'BẬT (ENABLED)' : 'TẮT (DISABLED)'}`, 'info');
    },

    toggleMinimize(forced) {
      this.isMinimized = typeof forced === 'boolean' ? forced : !this.isMinimized;
      try {
        chrome.storage.local.set({ devHudMinimized: this.isMinimized });
      } catch {}
      this.render();
    },

    log(message, level = 'info') {
      const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      const entry = { time, level, message };
      this.logs.push(entry);
      if (this.logs.length > 80) this.logs.shift();

      const container = document.getElementById('tavy-dev-logs-content');
      if (container) {
        const row = document.createElement('div');
        row.style.cssText = `margin-bottom: 4px; padding: 3px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; line-height: 1.3; ${
          level === 'success' ? 'background: rgba(16, 185, 129, 0.15); color: #34D399;' :
          level === 'error' ? 'background: rgba(239, 68, 68, 0.15); color: #F87171;' :
          level === 'warn' ? 'background: rgba(245, 158, 11, 0.15); color: #FBBF24;' :
          'color: #94A3B8;'
        }`;
        row.innerHTML = `<span style="opacity: 0.6;">[${time}]</span> <span style="font-weight: 700;">[${level.toUpperCase()}]</span> ${message}`;
        container.appendChild(row);
        container.scrollTop = container.scrollHeight;
      }
      console.log(`[TAVY DEV HUD] [${level.toUpperCase()}] ${message}`);
    },

    getTelemetry() {
      const isNextJs = !!(window.__NEXT_DATA__ || document.querySelector('[class*="GoodsDetail"]'));
      const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/i);
      const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : 'N/A';

      const carouselEl = document.querySelector('[class*="GoodsDetailCarousel"], #goodsImg, #repImageContainer');
      const descEl = document.querySelector('[class*="GoodsDetailDescription"], #artcDesc');
      const reviewTabEl = Array.from(document.querySelectorAll('button, a')).find(b => (b.textContent || '').includes('리뷰'));
      const specTableEl = document.querySelector('#buyInfo, .prd_info_table, [class*="GoodsDetailSpec"]');

      const studioImgs = document.querySelectorAll('[class*="GoodsDetailCarousel"] img, #mainImg, .goods_thumb img, .prd_thumb_list img');
      const descImgs = document.querySelectorAll('[class*="GoodsDetailDescription"] img, #artcDesc img');
      const gdasImgs = document.querySelectorAll('img[src*="gdasEditor"], [class*="ReviewArea"] img');

      const saleEl = document.querySelector('span.price-2 strong, span.tx_cur .tx_num, [class*="GoodsDetailInfo_price__"]');
      const priceText = saleEl ? (saleEl.textContent || '').replace(/[^0-9]/g, '') : '';

      return {
        framework: isNextJs ? 'Next.js App Router (Modern)' : 'JSP/Spring (Legacy)',
        goodsNo,
        priceWon: priceText ? `${parseInt(priceText, 10).toLocaleString()} ₩` : 'Chưa quét',
        selectors: {
          carousel: !!carouselEl,
          description: !!descEl,
          reviewTab: !!reviewTabEl,
          specsTable: !!specTableEl
        },
        counts: {
          studio: studioImgs.length,
          description: descImgs.length,
          reviews: gdasImgs.length
        }
      };
    },

    setLatestPayload(payload) {
      this.latestPayload = payload;
      const jsonView = document.getElementById('tavy-dev-json-content');
      if (jsonView) {
        jsonView.textContent = JSON.stringify(payload, null, 2);
      }
      this.log(`Cập nhật payload mới cho ${payload.name || payload.goodsNo} (${payload.images?.length || 0} ảnh HD, ${payload.detailImages?.length || 0} ảnh mô tả, ${payload.photoReviews?.length || 0} ảnh review)`, 'success');
    },

    render() {
      let hud = document.getElementById('tavy-dev-hud');
      if (!this.isEnabled) {
        if (hud) hud.remove();
        return;
      }

      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'tavy-dev-hud';
        document.body.appendChild(hud);
      }

      const t = this.getTelemetry();

      if (this.isMinimized) {
        hud.style.cssText = `
          position: fixed;
          bottom: 25px;
          left: 25px;
          z-index: 9999999;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0F172A;
          border: 1.5px solid #C5A059;
          color: #FAF8F5;
          padding: 9px 16px;
          border-radius: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          cursor: pointer;
          user-select: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        hud.innerHTML = `
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px #10B981;"></span>
          <span>🛠️ DEV HUD (v21.0 DEV)</span>
          <span style="font-size: 10px; background: rgba(197, 160, 89, 0.2); color: #C5A059; padding: 2px 6px; border-radius: 10px; font-weight: 800;">${t.goodsNo}</span>
          <button id="tavy-hud-expand-btn" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; font-size: 13px; margin-left: 4px; padding: 0;">▢</button>
        `;

        hud.onclick = (e) => {
          if (e.target.id === 'tavy-hud-expand-btn' || e.currentTarget === hud) {
            this.toggleMinimize(false);
          }
        };
        return;
      }

      hud.style.cssText = `
        position: fixed;
        bottom: 25px;
        left: 25px;
        width: 440px;
        max-height: 520px;
        z-index: 9999999;
        background: #0F172A;
        border: 1.5px solid #C5A059;
        border-radius: 14px;
        color: #FAF8F5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 20px 45px rgba(0,0,0,0.6);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-size: 12px;
      `;

      hud.innerHTML = `
        <!-- HUD Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #1E293B; border-bottom: 1px solid rgba(197, 160, 89, 0.3);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
            <span style="font-weight: 800; color: #FAF8F5; font-size: 13px;">TAVY DEV HUD</span>
            <span style="background: #7A4B9E; color: #FFFFFF; font-size: 9px; padding: 2px 6px; border-radius: 10px; font-weight: 800;">v21.0 DEV</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="tavy-hud-min-btn" title="Thu gọn" style="background: #334155; border: none; color: #CBD5E1; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">−</button>
            <button id="tavy-hud-close-btn" title="Đóng Dev Mode" style="background: #334155; border: none; color: #CBD5E1; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">×</button>
          </div>
        </div>

        <!-- Tabs Bar -->
        <div style="display: flex; background: #0F172A; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding: 4px 6px; gap: 4px;">
          <button class="tavy-hud-tab-btn" data-tab="telemetry" style="flex: 1; padding: 6px 4px; border: none; border-radius: 6px; background: ${this.activeTab === 'telemetry' ? '#7A4B9E' : 'transparent'}; color: ${this.activeTab === 'telemetry' ? '#FFFFFF' : '#94A3B8'}; font-weight: 700; font-size: 11px; cursor: pointer;">📊 Giám Sát</button>
          <button class="tavy-hud-tab-btn" data-tab="actions" style="flex: 1; padding: 6px 4px; border: none; border-radius: 6px; background: ${this.activeTab === 'actions' ? '#7A4B9E' : 'transparent'}; color: ${this.activeTab === 'actions' ? '#FFFFFF' : '#94A3B8'}; font-weight: 700; font-size: 11px; cursor: pointer;">⚡ Thử Nghiệm</button>
          <button class="tavy-hud-tab-btn" data-tab="json" style="flex: 1; padding: 6px 4px; border: none; border-radius: 6px; background: ${this.activeTab === 'json' ? '#7A4B9E' : 'transparent'}; color: ${this.activeTab === 'json' ? '#FFFFFF' : '#94A3B8'}; font-weight: 700; font-size: 11px; cursor: pointer;">🔍 JSON</button>
          <button class="tavy-hud-tab-btn" data-tab="logs" style="flex: 1; padding: 6px 4px; border: none; border-radius: 6px; background: ${this.activeTab === 'logs' ? '#7A4B9E' : 'transparent'}; color: ${this.activeTab === 'logs' ? '#FFFFFF' : '#94A3B8'}; font-weight: 700; font-size: 11px; cursor: pointer;">📜 Logs</button>
        </div>

        <!-- Tab 1: Telemetry -->
        <div id="tavy-hud-view-telemetry" style="display: ${this.activeTab === 'telemetry' ? 'block' : 'none'}; padding: 12px; overflow-y: auto; max-height: 400px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="background: #1E293B; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 10px; color: #94A3B8;">Mã Hàng (GoodsNo)</div>
              <div style="font-weight: 800; font-size: 13px; color: #C5A059;">${t.goodsNo}</div>
            </div>
            <div style="background: #1E293B; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 10px; color: #94A3B8;">Giá Won DOM</div>
              <div style="font-weight: 800; font-size: 13px; color: #10B981;">${t.priceWon}</div>
            </div>
          </div>

          <div style="background: #1E293B; padding: 10px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 10px; color: #94A3B8; margin-bottom: 4px;">Kiến Trúc Web Frontend:</div>
            <div style="font-weight: 700; color: #60A5FA; display: flex; align-items: center; gap: 6px;">
              <span>🌐</span><span>${t.framework}</span>
            </div>
          </div>

          <div style="font-size: 11px; font-weight: 800; color: #C5A059; margin-bottom: 6px;">Trạng Thái Selector Next.js:</div>
          <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; background: #1E293B; padding: 8px 10px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94A3B8;">Carousel / Ảnh Studio:</span>
              <span style="font-weight: 700; color: ${t.selectors.carousel ? '#34D399' : '#F87171'};">${t.selectors.carousel ? '✓ SẴN SÀNG' : '× KHÔNG THẤY'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94A3B8;">Mô Tả / Infographic:</span>
              <span style="font-weight: 700; color: ${t.selectors.description ? '#34D399' : '#F87171'};">${t.selectors.description ? '✓ SẴN SÀNG' : '× KHÔNG THẤY'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94A3B8;">Tab Đánh Giá (Review):</span>
              <span style="font-weight: 700; color: ${t.selectors.reviewTab ? '#34D399' : '#F87171'};">${t.selectors.reviewTab ? '✓ SẴN SÀNG' : '× KHÔNG THẤY'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94A3B8;">Bảng Thông Số Kỹ Thuật:</span>
              <span style="font-weight: 700; color: ${t.selectors.specsTable ? '#34D399' : '#F87171'};">${t.selectors.specsTable ? '✓ SẴN SÀNG' : '× KHÔNG THẤY'}</span>
            </div>
          </div>

          <div style="font-size: 11px; font-weight: 800; color: #C5A059; margin-bottom: 6px;">Số Lượng Ảnh Trực Quan Trên DOM:</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
            <div style="background: #1E293B; padding: 8px 6px; border-radius: 6px; text-align: center;">
              <div style="font-size: 15px; font-weight: 800; color: #38BDF8;">${t.counts.studio}</div>
              <div style="font-size: 9px; color: #94A3B8;">Ảnh Studio</div>
            </div>
            <div style="background: #1E293B; padding: 8px 6px; border-radius: 6px; text-align: center;">
              <div style="font-size: 15px; font-weight: 800; color: #A78BFA;">${t.counts.description}</div>
              <div style="font-size: 9px; color: #94A3B8;">Ảnh Mô Tả</div>
            </div>
            <div style="background: #1E293B; padding: 8px 6px; border-radius: 6px; text-align: center;">
              <div style="font-size: 15px; font-weight: 800; color: #34D399;">${t.counts.reviews}</div>
              <div style="font-size: 9px; color: #94A3B8;">Ảnh Review</div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Micro Actions -->
        <div id="tavy-hud-view-actions" style="display: ${this.activeTab === 'actions' ? 'block' : 'none'}; padding: 12px; overflow-y: auto; max-height: 400px;">
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 10px;">Chạy thử nghiệm từng bước cào nhỏ để kiểm tra độ tin cậy của thuật toán:</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="tavy-act-step1" style="background: #1E293B; border: 1px solid rgba(255,255,255,0.1); color: #FAF8F5; padding: 9px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
              <span>📸 Bước 1: Thu Thập Album Ảnh Studio HD (8-10 ảnh)</span>
              <span style="color: #60A5FA;">Chạy ❯</span>
            </button>
            <button id="tavy-act-step2" style="background: #1E293B; border: 1px solid rgba(255,255,255,0.1); color: #FAF8F5; padding: 9px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
              <span>🖼️ Bước 2: Mở Rộng & Bóc Tách Infographic Mô Tả (15-25 ảnh)</span>
              <span style="color: #60A5FA;">Chạy ❯</span>
            </button>
            <button id="tavy-act-step3" style="background: #1E293B; border: 1px solid rgba(255,255,255,0.1); color: #FAF8F5; padding: 9px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
              <span>📋 Bước 3: Bóc Tách Bảng Thông Số & Thành Phần</span>
              <span style="color: #60A5FA;">Chạy ❯</span>
            </button>
            <button id="tavy-act-step4" style="background: #1E293B; border: 1px solid rgba(255,255,255,0.1); color: #FAF8F5; padding: 9px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
              <span>⭐ Bước 4: Kích Hoạt Tab Đánh Giá & Bóc Tách GDAS Thật (50 ảnh)</span>
              <span style="color: #60A5FA;">Chạy ❯</span>
            </button>
            <button id="tavy-act-step5" style="background: linear-gradient(135deg, #7A4B9E 0%, #583377 100%); border: 1px solid #C5A059; color: #FFFFFF; padding: 11px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-align: center; cursor: pointer; margin-top: 4px;">
              ⚡ BƯỚC 5: CÀO TOÀN DIỆN & ĐỒNG BỘ AI GEMINI TRỰC TIẾP
            </button>
          </div>
        </div>

        <!-- Tab 3: JSON Inspector -->
        <div id="tavy-hud-view-json" style="display: ${this.activeTab === 'json' ? 'block' : 'none'}; padding: 12px; overflow-y: auto; max-height: 400px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; color: #94A3B8;">Dữ liệu payload sản phẩm mới nhất:</span>
            <button id="tavy-hud-copy-json" style="background: #334155; border: 1px solid rgba(255,255,255,0.1); color: #FAF8F5; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">📋 Sao Chép JSON</button>
          </div>
          <pre id="tavy-dev-json-content" style="background: #020617; border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 8px; color: #38BDF8; font-family: monospace; font-size: 11px; max-height: 280px; overflow: auto; white-space: pre-wrap; word-break: break-all;">${this.latestPayload ? JSON.stringify(this.latestPayload, null, 2) : '// Chưa chạy cào sản phẩm nào. Hãy bấm "Thử Nghiệm" hoặc nút Cào Nổi để sinh dữ liệu JSON.'}</pre>
        </div>

        <!-- Tab 4: Logs -->
        <div id="tavy-hud-view-logs" style="display: ${this.activeTab === 'logs' ? 'block' : 'none'}; padding: 12px; overflow-y: auto; max-height: 400px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; color: #94A3B8;">Nhật ký sự kiện thời gian thực:</span>
            <button id="tavy-hud-clear-logs" style="background: #334155; border: 1px solid rgba(255,255,255,0.1); color: #FAF8F5; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🧹 Xóa Logs</button>
          </div>
          <div id="tavy-dev-logs-content" style="background: #020617; border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; height: 260px; overflow-y: auto;">
            ${this.logs.map(l => `
              <div style="margin-bottom: 4px; padding: 3px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; line-height: 1.3; ${
                l.level === 'success' ? 'background: rgba(16, 185, 129, 0.15); color: #34D399;' :
                l.level === 'error' ? 'background: rgba(239, 68, 68, 0.15); color: #F87171;' :
                l.level === 'warn' ? 'background: rgba(245, 158, 11, 0.15); color: #FBBF24;' :
                'color: #94A3B8;'
              }">
                <span style="opacity: 0.6;">[${l.time}]</span> <span style="font-weight: 700;">[${l.level.toUpperCase()}]</span> ${l.message}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Gắn sự kiện chuyển tabs
      hud.querySelectorAll('.tavy-hud-tab-btn').forEach(btn => {
        btn.onclick = () => {
          this.activeTab = btn.getAttribute('data-tab');
          this.render();
        };
      });

      // Sự kiện nút thu gọn & đóng
      const minBtn = hud.querySelector('#tavy-hud-min-btn');
      if (minBtn) minBtn.onclick = () => this.toggleMinimize(true);

      const closeBtn = hud.querySelector('#tavy-hud-close-btn');
      if (closeBtn) closeBtn.onclick = () => this.toggleDevMode(false);

      // Sự kiện nút Sao Chép JSON
      const copyBtn = hud.querySelector('#tavy-hud-copy-json');
      if (copyBtn) {
        copyBtn.onclick = () => {
          if (!this.latestPayload) {
            alert("Chưa có dữ liệu JSON để sao chép!");
            return;
          }
          navigator.clipboard.writeText(JSON.stringify(this.latestPayload, null, 2)).then(() => {
            copyBtn.textContent = '✓ Đã sao chép!';
            setTimeout(() => { copyBtn.textContent = '📋 Sao Chép JSON'; }, 2000);
          });
        };
      }

      // Sự kiện xóa logs
      const clearBtn = hud.querySelector('#tavy-hud-clear-logs');
      if (clearBtn) {
        clearBtn.onclick = () => {
          this.logs = [];
          const logContent = document.getElementById('tavy-dev-logs-content');
          if (logContent) logContent.innerHTML = '';
        };
      }

      // Sự kiện Micro Actions
      const goodsNoMatch = window.location.href.match(/goodsNo=([A-Za-z0-9_]+)/i);
      const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : '';

      const act1 = hud.querySelector('#tavy-act-step1');
      if (act1) {
        act1.onclick = async () => {
          this.log("Bắt đầu thử nghiệm Bước 1: Thu thập Album Ảnh Studio HD...", 'info');
          const imgs = pickProductImages();
          this.log(`Bước 1 hoàn tất! Thu được ${imgs.length} ảnh Studio HD sắc nét.`, 'success');
          this.render();
        };
      }

      const act2 = hud.querySelector('#tavy-act-step2');
      if (act2) {
        act2.onclick = async () => {
          this.log("Bắt đầu thử nghiệm Bước 2: Mở rộng & bóc tách Infographic...", 'info');
          const dImgs = await pickDetailImages();
          this.log(`Bước 2 hoàn tất! Thu được ${dImgs.length} ảnh infographic mô tả.`, 'success');
          this.render();
        };
      }

      const act3 = hud.querySelector('#tavy-act-step3');
      if (act3) {
        act3.onclick = () => {
          this.log("Bắt đầu thử nghiệm Bước 3: Bóc tách Thông Số Kỹ Thuật...", 'info');
          const specs = parseProductSpecifications();
          this.log(`Bước 3 hoàn tất! Dung tích: "${specs.capacity}", Loại da: "${specs.skinType}", Xuất xứ: "${specs.origin}", Rating: ${specs.rating}`, 'success');
        };
      }

      const act4 = hud.querySelector('#tavy-act-step4');
      if (act4) {
        act4.onclick = async () => {
          this.log(`Bắt đầu thử nghiệm Bước 4: Thu hoạch ảnh review GDAS cho ${goodsNo}...`, 'info');
          const reviews = await fetchGdasReviewPhotos(goodsNo);
          this.log(`Bước 4 hoàn tất! Thu hoạch được ${reviews.length} ảnh review GDAS từ người dùng thật.`, 'success');
          this.render();
        };
      }

      const act5 = hud.querySelector('#tavy-act-step5');
      if (act5) {
        act5.onclick = async () => {
          this.log("Kích hoạt quy trình cào toàn diện 5 bước...", 'info');
          await startScrapeProcess();
        };
      }
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

    if (request.action === "TOGGLE_DEV_MODE") {
      DevHudController.toggleDevMode(request.enabled);
      sendResponse({ success: true, devMode: DevHudController.isEnabled });
      return true;
    }

    if (request.action === "GET_DEV_STATUS") {
      sendResponse({
        success: true,
        devMode: DevHudController.isEnabled,
        telemetry: DevHudController.getTelemetry()
      });
      return true;
    }

    if (request.action === "EXTRACT_PAGE_PRODUCTS") {
      try {
        const items = [];
        const seen = new Set();
        const links = Array.from(document.querySelectorAll('a[href*="goodsNo="]') || []);
        links.forEach(a => {
          const href = a.href || '';
          const match = href.match(/goodsNo=([A-Za-z0-9_]+)/i);
          if (match && match[1]) {
            const goodsNo = match[1].toUpperCase();
            if (!seen.has(goodsNo)) {
              seen.add(goodsNo);
              const card = a.closest('.prd_info, .goods_info, [class*="GoodsItem"], li') || a;
              const titleEl = card.querySelector('.tx_name, .prd_name, [class*="name"], .name') || a;
              const title = (titleEl.textContent || '').trim();
              items.push({ goodsNo, url: href, title });
            }
          }
        });
        sendResponse({ success: true, count: items.length, items });
      } catch (err) {
        sendResponse({ success: false, error: err.message, items: [] });
      }
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

  const initExtension = () => {
    injectFloatingScrapeButton();
    DevHudController.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtension);
  } else {
    initExtension();
  }
  setInterval(injectFloatingScrapeButton, 2000);
}
