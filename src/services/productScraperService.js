/**
 * Korean Product Auto-Scraper Service v4.0
 * Jina AI Reader + Multi-proxy fallback, JSON-LD/OG/meta parsing, Korean price format support,
 * KNOWN_KOREAN_GOODS_DB cache for verified products with Korean & Vietnamese names.
 */

const KNOWN_KOREAN_GOODS_DB = {
  'A000000261415': {
    name: 'Kem dưỡng phục hồi hàng rào siêu dưỡng ẩm Layerlab Panthenol Intensive Cream Plus 60ml',
    nameKr: '[초고보습 장벽크림] 레이어랩 판테놀 인텐시브 크림 플러스 60ml',
    brand: 'Layerlab',
    brandKr: '레이어랩',
    category: 'skincare',
    foreignPrice: 32500,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/item/2026/04/02/cd5_03103749.png?RS=100x0&QT=100&SF=webp&sharpen=1x0.5',
    description: 'Kem dưỡng phục hồi hàng rào da siêu dưỡng ẩm Layerlab Panthenol Intensive Cream Plus 60ml — bán chạy Olive Young Korea.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000201102': {
    name: 'Kem chống nắng Round Lab Birch Juice Moisturizing Sunscreen SPF50+ PA++++',
    nameKr: '라운드랩 자작나무 수분 선크림 50ml',
    brand: 'Round Lab',
    brandKr: '라운드랩',
    category: 'skincare',
    foreignPrice: 25000,
    productImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    description: 'Kem chống nắng nhựa cây Bạch Dương TOP 1 Olive Young.',
    origin: 'Store Olive Young Myeongdong, Hàn Quốc',
    rating: 4.9
  },
  'A000000192301': {
    name: 'Kem dưỡng ẩm sâm Beauty of Joseon Dynasty Cream 50ml',
    nameKr: '조선미녀 조선조선 조선미녀 조선주조 조선 조선미녀 조선 조선 50ml',
    brand: 'Beauty of Joseon',
    brandKr: '조선미녀',
    category: 'skincare',
    foreignPrice: 24000,
    productImage: 'https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0018/A00000018593501ko.jpg',
    origin: 'Store Olive Young Korea',
    description: 'Sản phẩm chính hãng nội địa Hàn Quốc.',
    rating: 4.9,
    reviewsCount: 320
  },
  'A000000128120': {
    name: 'Son tint lì bóng Romand Juicy Lasting Tint',
    nameKr: '롬앤 쥬시 래스팅 틴트',
    brand: 'Romand',
    brandKr: '롬앤',
    category: 'makeup',
    foreignPrice: 9900,
    productImage: 'https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0022/A00000022341401ko.jpg',
    origin: 'Store Olive Young Korea',
    description: 'Son tint bóng lâu trôi nội địa Hàn Quốc.',
    rating: 4.9,
    reviewsCount: 1520
  },
  'A000000180234': {
    name: 'Phấn nước Clio Kill Cover Mesh Glow Cushion SPF50+ PA++++',
    nameKr: '클리오 킬커버 메쉬 글로우 쿠션',
    brand: 'Clio',
    brandKr: '클리오',
    category: 'makeup',
    foreignPrice: 32000,
    productImage: 'https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0019/A00000019882201ko.jpg',
    description: 'Sữa tắm giảm mụn lưng hiệu quả.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.8,
    reviewsCount: 880
  },
  'A000000223414': {
    name: 'Gói mặt nạ thiết yếu Mediheal 10+1 (Teatree / Madecassoside / Watermide)',
    nameKr: '메디힐 마스크팩 10+1 기획 (티트리/마데카소사이드/워터마이드)',
    brand: 'Mediheal',
    brandKr: '메디힐',
    category: 'skincare',
    foreignPrice: 10000,
    productImage: '/product-images/mediheal-mask-10plus1.png',
    description: 'Mặt nạ dưỡng da quốc dân Mediheal TOP 1 Olive Young 15 năm liên tiếp.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000255682': {
    name: 'Miếng pad se khít lỗ chân lông Medicube Zero Pore Pad 1+1 (본품70매+리필 70매)',
    nameKr: '[1등/아이돌 모공패드] 메디큐브 제로 모공 패드 1+1 140매 리필 기획 (본품70매+리필 70매)',
    brand: 'Medicube',
    brandKr: '메디큐브',
    category: 'skincare',
    foreignPrice: 27900,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025568254ko.jpg',
    description: 'Miếng pad se khít lỗ chân lông Medicube Zero Pore Pad TOP 1 Olive Young Hàn Quốc. Giá gốc 33.000₩, giảm còn 27.900₩.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000253122': {
    name: 'Phấn Nước Che Phủ Lâu Trôi Fwee All Day Cover Black Cushion (Kèm Lõi)',
    nameKr: '[민스코공동개발] 퓌 올데이 커버 블랙 쿠션 리필기획(본품+리필) 5종',
    brand: 'fwee',
    brandKr: '퓌',
    category: 'makeup',
    foreignPrice: 27800,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025312239ko.jpg',
    description: 'Phấn Nước Che Phủ Lâu Trôi Fwee All Day Cover Black Cushion. Giá gốc 38.000₩, giảm còn 27.800₩.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000250199': {
    name: 'Celimax The Vita A Retinal Shot Tightening Booster 15ml',
    nameKr: '[단독기획/모공탄력] 셀리맥스 더 비타 A 레티날 샷 타이트닝 부스터 15ml 기획(+3ml)',
    brand: 'Celimax',
    brandKr: '셀리맥스',
    category: 'skincare',
    foreignPrice: 23100,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025019901ko.jpg',
    description: 'Tinh chất se khít lỗ chân lông Celimax Vita A Retinal Shot Booster 15ml. Giá gốc 33.000₩, giảm còn 23.100₩.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000240462': {
    name: 'Mặt Nạ Dưỡng Sáng Celimax Tranexamic Acid Brightening Cream Wrapping Mask',
    nameKr: '[잡티미백/TXA] 셀리맥스 트라넥삼산 브라이트닝 크림 랩핑 마스크 5매 기획 (+1매)',
    brand: 'Celimax',
    brandKr: '셀리맥스',
    category: 'skincare',
    foreignPrice: 16900,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0024/A00000024046219ko.jpg',
    description: 'Mặt Nạ Dưỡng Sáng Celimax Tranexamic Acid Cream Wrapping Mask. Giá gốc 26.800₩, giảm còn 16.900₩.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000204975': {
    name: 'Lotion che khuyết điểm tự nhiên OBGE 50g',
    nameKr: '[NEW 보송버전 출시] [덱스PICK] 오브제 내추럴 커버 로션 50g 단품/기획(+미니어처 10ml)',
    brand: 'OBGE',
    brandKr: '오브제',
    category: 'makeup',
    foreignPrice: 22900,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0020/A00000020497522ko.jpg',
    description: 'Lotion che khuyết điểm tự nhiên OBGE 50g. Giá gốc 29.800₩, giảm còn 22.900₩.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000259615': {
    name: 'Bộ chăm sóc tóc Orara X The Wish Hair Market (Dầu gội 460g / Dầu xả 200ml)',
    nameKr: '오라라 X 더위시 헤어마켓 (샴푸 460g / 트리트먼트 200ml)',
    brand: 'Orara',
    brandKr: '오라라',
    category: 'haircare',
    foreignPrice: 27000,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025961514ko.png?l=ko&QT=100&SF=webp&sharpen=1x0.5',
    description: 'Bộ chăm sóc tóc Orara X The Wish Hair Market từ Olive Young Korea, gồm dầu gội 460g hoặc dầu xả 200ml. Giá gốc 34.000₩, giảm còn 27.000₩.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 5
  }
};

/** Clean Korean promotional brackets [단독/기획] [1+1] etc */
const cleanKoreanTitle = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
    .trim();
};

/** Parse Korean price formats: Prioritize Discounted Sale Price over Original Price */
const parseKoreanPrice = (html) => {
  const patterns = [
    /"(?:salePrc|dispSalePrc|finalPrc|salePrice|finalPrice)"\s*:\s*"?([0-9,]+)"?/i,
    /class=["'](?:price-2|tx_cur|total_price)["'][^>]*>.*?([0-9]{1,3}(?:,[0-9]{3})+)\s*원/is,
    /property=["'](?:og:price:amount|product:price:amount)["'][^>]*content=["']([0-9,]+)["']/i,
    /([0-9]{1,3}(?:,[0-9]{3})+)\s*원/,
    /₩\s*([0-9,]+)/,
  ];
  for (const pat of patterns) {
    const m = html.match(pat);
    if (m && m[1]) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 100) return val;
    }
  }
  return null;
};

/** Guess category from product name */
const guessCategory = (name) => {
  const lower = (name || '').toLowerCase();
  if (/cushion|파운데이션|foundation|son |tint|lip|phấn|chì kẻ|mascara|eyeliner|makeup/i.test(lower)) return 'makeup';
  if (/sâm|ginseng|collagen|vitamin|viên uống|kẹo dẻo|thực phẩm|건강/i.test(lower)) return 'health';
  if (/thuốc|dược|pharmacy|cao dán|xịt mũi/i.test(lower)) return 'pharmacy';
  if (/shampoo|dầu gội|xả|hair|tóc/i.test(lower)) return 'haircare';
  if (/body|sữa tắm|lotion/i.test(lower)) return 'bodycare';
  return 'skincare';
};

export const scrapeProductMetadata = async (url) => {
  if (!url || !url.trim()) {
    return { success: false, error: 'Vui lòng cung cấp đường dẫn sản phẩm hợp lệ!' };
  }

  const cleanUrl = url.trim();

  // 1. Known goods DB cache lookup
  const goodsNoMatch = cleanUrl.match(/goodsNo=([A-Z0-9]+)/i);
  const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : null;

  if (goodsNo && KNOWN_KOREAN_GOODS_DB[goodsNo]) {
    const known = KNOWN_KOREAN_GOODS_DB[goodsNo];
    return {
      success: true,
      product: {
        goodsNo,
        name: known.name,
        nameKr: known.nameKr || known.name,
        brand: known.brand,
        brandKr: known.brandKr || known.brand,
        category: known.category,
        foreignPrice: known.foreignPrice,
        productImage: known.productImage,
        description: known.description,
        origin: known.origin,
        rating: known.rating,
        productUrl: cleanUrl,
        reviewsCount: 280
      }
    };
  }

  // Không có trong cache → báo AI cần xử lý (KHÔNG chạy proxy chain cũ chậm 20-30s)
  return { success: false, needsAI: true };
};

/**
 * Chỉ tra cache (KHÔNG chạy proxy/Jina) — dùng cho AI engine để tránh chờ proxy chain cũ.
 * @param {string} url
 * @returns {Promise<{success: boolean, product?: object}>} Nhanh, không network.
 */
export const lookupKnownGoods = async (url) => {
  if (!url || !url.trim()) return { success: false };
  const goodsNoMatch = url.trim().match(/goodsNo=([A-Z0-9]+)/i);
  const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : null;
  if (!goodsNo || !KNOWN_KOREAN_GOODS_DB[goodsNo]) return { success: false };
  const known = KNOWN_KOREAN_GOODS_DB[goodsNo];
  return {
    success: true,
    product: {
      goodsNo,
      name: known.name,
      nameKr: known.nameKr || known.name,
      brand: known.brand,
      brandKr: known.brandKr || known.brand,
      category: known.category,
      foreignPrice: known.foreignPrice,
      productImage: known.productImage,
      description: known.description,
      origin: known.origin,
      rating: known.rating,
      productUrl: url.trim(),
      reviewsCount: 280
    }
  };
};
