/**
 * TAVY KOREA — Olive Young Core Scraper Engine v19.0 (Single Source of Truth)
 * Module lõi chuẩn hóa toàn bộ thuật toán bóc tách giá, làm sạch ảnh HD, lọc ảnh rác quà tặng,
 * chuẩn hóa thương hiệu và phân loại danh mục cho toàn bộ hệ thống.
 */

// 1. BỘ TỪ ĐIỂN THƯƠNG HIỆU HÀN QUỐC VERIFIED
export const KOREAN_BRAND_MAP = {
  '메디힐': 'Mediheal',
  '메디큐브': 'Medicube',
  '구달': 'Goodal',
  '오브제': 'OBGE',
  '셀리맥스': 'Celimax',
  '퓌': 'fwee',
  '비플레인': 'Beplain',
  '바이오던스': 'Biodance',
  '스킨푸드': 'Skinfood',
  '우르오스': 'ULOS',
  '오라라': 'Orara',
  '이옴': 'Eom',
  '레이어랩': 'Layerlab',
  '아누아': 'Anua',
  '롬앤': 'Romand',
  '토리든': 'Torriden',
  '넘버즈인': 'numbuzin',
  '조선미녀': 'Beauty of Joseon',
  '라네즈': 'Laneige',
  '이니스프리': 'Innisfree',
  '헤라': 'Hera',
  '설화수': 'Sulwhasoo',
  '에뛰드': 'Etude',
  '클리오': 'Clio',
  '페리페라': 'Peripera',
  '코스알엑스': 'COSRX',
  '닥터지': 'Dr.G',
  '달바': "d'Alba",
  '라운드랩': 'Round Lab',
  '에스트라': 'Aestura',
  '피지오겔': 'Physiogel',
  '아이소이': 'isoi',
  '마녀공장': 'Manyo Factory',
  '브이티': 'VT Cosmetics',
  'VT': 'VT Cosmetics',
  '일리윤': 'Illiyoon',
  '바닐라코': 'Banila Co',
  '닥터자르트': 'Dr.Jart+',
  '아비브': 'Abib',
  '에스쁘아': 'espoir',
  '투쿨포스쿨': 'too cool for school',
  '웨이크메이크': 'WAKEMAKE',
  '힌스': 'hince',
  '데이지크': 'dasique',
  '뮤드': 'mude',
  '어뮤즈': 'AMUSE',
  '헤브블루': 'HAVE BLUE',
  '정샘물': 'JUNG SAEM MOOL',
  '더샘': 'the SAEM',
  '미샤': 'MISSHA'
};

/**
 * 2. LÀM SẠCH LINK ẢNH HD NGUYÊN BẢN (Loại bỏ các tham số nén thu nhỏ RS=64x0)
 */
export const cleanHighResImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  if (clean.startsWith('//')) clean = 'https:' + clean;
  return clean
    .replace(/\?RS=\d+x\d+.*$/i, '')
    .replace(/&RS=\d+x\d+/gi, '')
    .replace(/RS=\d+x\d+&?/gi, '')
    .replace(/QT=\d+&?/gi, 'QT=100&')
    .replace(/["')\]]/g, '')
    .trim();
};

/**
 * 3. BỘ LỌC CHẶN 100% ẢNH RÁC QUÀ TẶNG / BANNER / QUẢNG CÁO
 * Tuyệt đối chặn các ảnh quà tặng kèm từ thư mục /item/ (khăn tắm, tai nghe, bình nước, túi xách)
 */
export const isOliveYoungJunkImage = (src, alt = '') => {
  if (!src || typeof src !== 'string' || !src.startsWith('http')) return true;
  const combined = (src + ' ' + alt).toLowerCase();

  // Pattern các loại ảnh rác cần loại bỏ
  const junkPatterns = [
    /\/display\//i,
    /\/event\//i,
    /\/banner\//i,
    /\/static\//i,
    /\/item\//i, // Quà tặng khuyến mãi
    /\/gift\//i,
    /\/promo\//i,
    /reviewProfile/i,
    /logo/i,
    /icon/i,
    /avatar/i,
    /star_/i,
    /btn_/i,
    /badge/i,
    /tag_/i,
    /flag_/i,
    /blank/i,
    /loading/i,
    /sprite/i,
    /common/i,
    /arrow/i,
    /btn-/i,
    /ico_/i,
    /nav_/i,
    /footer/i,
    /header/i,
    /popup_/i,
    /sample/i,
    /free_gift/i
  ];

  return junkPatterns.some(pattern => pattern.test(combined));
};

/**
 * 4. LÀM SẠCH TIÊU ĐỀ TIẾNG HÀN (Loại bỏ các thẻ ngoặc khuyến mãi rác)
 */
export const cleanKoreanTitle = (rawTitle) => {
  if (!rawTitle || typeof rawTitle !== 'string') return '';
  return rawTitle
    .replace(/\[[^\]]*\]/g, '') // Bỏ [1+1], [단독기획], [15년 연속 1위]
    .replace(/\([^\)]*기획[^\)]*\)/g, '')
    .replace(/\([^\)]*골라담기[^\)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * 5. NHẬN DIỆN THƯƠNG HIỆU CHUẨN TỪ TIÊU ĐỀ HOẶC THƯƠNG HIỆU THÔ
 */
export const extractBrandFromTitleOrDom = (title = '', rawBrand = '') => {
  const combined = `${rawBrand} ${title}`.trim();
  
  for (const [krName, enName] of Object.entries(KOREAN_BRAND_MAP)) {
    if (combined.includes(krName) || combined.toLowerCase().includes(enName.toLowerCase())) {
      return { brand: enName, brandKr: krName };
    }
  }

  if (rawBrand && rawBrand !== 'Olive Young' && rawBrand !== '올리브영') {
    return { brand: rawBrand.trim(), brandKr: rawBrand.trim() };
  }

  return { brand: 'Korea Beauty', brandKr: 'K-Beauty' };
};

/**
 * 6. BỘ BÓC TÁCH GIÁ CHUẨN XÁC OLIVE YOUNG (SALE PRICE, ORIGINAL PRICE, % DISCOUNT)
 * Tránh triệt để lỗi nối chuỗi con số (Ví dụ: 29800627900)
 */
export const parseOliveYoungPrices = (domOrText, defaultPrice = 25000) => {
  let foreignPrice = defaultPrice;
  let originalPrice = defaultPrice;
  let discountPercent = 0;

  if (typeof domOrText === 'string') {
    // 1. Phân tích giá từ text hoặc markdown
    // Pattern Sale Price: 23,700원 hoặc ~~29,700원~~ 20% 23,700원
    const saleMatch = domOrText.match(/(?:할인가|판매가|현재가|Sale Price)?\s*[:\s]*([0-9]{1,3}(?:,[0-9]{3})+)\s*원/i)
      || domOrText.match(/([0-9]{1,3}(?:,[0-9]{3})+)\s*원(?:\s*\(10[mg]l당)?/i);

    const origMatch = domOrText.match(/(?:정가|소비자가|정상가|Original Price)?\s*[:\s]*~*([0-9]{1,3}(?:,[0-9]{3})+)\s*원~*/i)
      || domOrText.match(/~~([0-9]{1,3}(?:,[0-9]{3})+)원~~/i);

    const pctMatch = domOrText.match(/([0-9]{1,2})\s*%/);

    if (saleMatch) {
      foreignPrice = parseInt(saleMatch[1].replace(/,/g, ''), 10);
    }
    if (origMatch) {
      originalPrice = parseInt(origMatch[1].replace(/,/g, ''), 10);
    }
    if (pctMatch) {
      discountPercent = parseInt(pctMatch[1], 10);
    }
  } else if (domOrText && typeof domOrText.querySelector === 'function') {
    // 2. Phân tích trực tiếp từ DOM Document / Element
    // Selector Sale Price
    const saleEl = domOrText.querySelector('span.price-2 strong, span.tx_cur .tx_num, [class*="GoodsDetailInfo_price__"], .price-2, strong.price');
    // Selector Original Price
    const origEl = domOrText.querySelector('span.price-1 strike, span.tx_org .tx_num, [class*="GoodsDetailInfo_price-before__"], .price-1 strike');
    // Selector Discount %
    const pctEl = domOrText.querySelector('span.tx_sale, span.discount, [class*="discount"], em.sale');

    if (saleEl) {
      const numStr = (saleEl.textContent || '').replace(/[^0-9]/g, '');
      if (numStr) foreignPrice = parseInt(numStr, 10);
    }
    if (origEl) {
      const numStr = (origEl.textContent || '').replace(/[^0-9]/g, '');
      if (numStr) originalPrice = parseInt(numStr, 10);
    }
    if (pctEl) {
      const numStr = (pctEl.textContent || '').replace(/[^0-9]/g, '');
      if (numStr) discountPercent = parseInt(numStr, 10);
    }
  }

  // Sanity check: Original price must be >= Sale price
  if (originalPrice < foreignPrice) {
    originalPrice = foreignPrice;
  }
  if (originalPrice > foreignPrice && discountPercent === 0) {
    discountPercent = Math.round(((originalPrice - foreignPrice) / originalPrice) * 100);
  }

  return {
    foreignPrice,
    originalPrice,
    discountPercent,
    price: foreignPrice // Backward compatibility
  };
};

/**
 * 7. PHÂN LOẠI DANH MỤC SẢN PHẨM (Category & SubCategory)
 */
export const classifyCosmeticsCategory = (name = '', desc = '') => {
  const text = `${name} ${desc}`.toLowerCase();
  
  if (/sâm|nấm|ginseng|lingzhi/i.test(text)) {
    return { category: 'ginseng', subCategory: 'ginseng' };
  }
  if (/thực phẩm chức năng|supplement|vitamin|collagen|viên uống|omega/i.test(text)) {
    return { category: 'supplements', subCategory: 'supplements' };
  }

  // Cosmetics Subcategories
  let subCategory = 'skincare';
  if (/son|môi|phấn|cushion|kem nền|mascara|eyeliner|má hồng|bb cream|che khuyết điểm|makeup|trang điểm/i.test(text)) {
    subCategory = 'makeup';
  } else if (/dầu gội|xả|tóc|hair|dưỡng tóc|treatment|shampoo/i.test(text)) {
    subCategory = 'haircare';
  } else if (/sữa tắm|body|dưỡng thể|tắm|lăn khử mùi|hand cream/i.test(text)) {
    subCategory = 'bodycare';
  } else {
    subCategory = 'skincare';
  }

  return {
    category: 'cosmetics',
    subCategory
  };
};
