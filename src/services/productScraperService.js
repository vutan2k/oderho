/**
 * Korean Product Auto-Scraper Service v4.0
 * Jina AI Reader + Multi-proxy fallback, JSON-LD/OG/meta parsing, Korean price format support,
 * KNOWN_KOREAN_GOODS_DB cache for verified products with Korean & Vietnamese names.
 */

const KNOWN_KOREAN_GOODS_DB = {
  'A000000117541': {
    name: 'Sữa dưỡng thể toàn diện ULOS All-In-One 200ml (Dành cho Nam)',
    nameKr: '[베스트 올인원]우르오스 올인원 200ml 2종 택 1',
    brand: 'ULOS',
    brandKr: '우르오스',
    category: 'cosmetics',
    foreignPrice: 23700,
    originalPrice: 29700,
    discountPercent: 20,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0011/A00000011754111ko.jpg',
    description: 'Sữa dưỡng thể toàn diện ULOS All-In-One 200ml nội địa Olive Young Hàn Quốc.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000171427': {
    name: 'Bộ 7 loại mặt nạ dạng miếng Mediheal Derma Pad cỡ lớn 200 miếng',
    nameKr: '[업그레이드 리뉴얼/단독기획] 메디힐 더마 패드 200매 대용량 기획 세트 7종 골라담기',
    brand: 'Mediheal',
    brandKr: '메디힐',
    category: 'cosmetics',
    foreignPrice: 28500,
    originalPrice: 39900,
    discountPercent: 28,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0017/A00000017142718ko.jpg',
    description: 'Bộ mặt nạ miếng Mediheal Derma Pad 200 miếng dung tích lớn bán chạy số 1 Olive Young.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000204975': {
    name: 'Lotion che khuyết điểm tự nhiên OBGE 50g (Kèm Mini 10ml)',
    nameKr: '[NEW 보송버전 출시] [덱스PICK] 오브제 내추럴 커버 로션 50g 단품/기획(+미니어처 10ml)',
    brand: 'OBGE',
    brandKr: '오브제',
    category: 'cosmetics',
    foreignPrice: 27900,
    originalPrice: 29800,
    discountPercent: 6,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0020/A00000020497522ko.jpg',
    description: 'Lotion che khuyết điểm tự nhiên OBGE 50g mỏng nhẹ tệp da chuẩn Hàn.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000219553': {
    name: 'Kem chống nắng dịu da Goodal Heartleaf Calming Sun Cream 50ml [Bộ 1+1]',
    nameKr: '[1등 선크림/화잘먹] 구달 맑은 어성초 진정 수분 선크림 50ml 1+1 기획',
    brand: 'Goodal',
    brandKr: '구달',
    category: 'cosmetics',
    foreignPrice: 17900,
    originalPrice: 22000,
    discountPercent: 18,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0021/A00000021955315ko.jpg',
    description: 'Kem chống nắng dịu da chiết xuất rau diếp cá Goodal Heartleaf chống nắng hoàn hảo không bết dính.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000223414': {
    name: 'Mặt Nạ Giấy Mediheal Essential Sheet Mask [Bộ 10+1 Miếng]',
    nameKr: '[15년 연속 1위] 메디힐 에센셜 마스크팩 10/10+1매 기획 7종 골라담기',
    brand: 'Mediheal',
    brandKr: '메디힐',
    category: 'skincare',
    foreignPrice: 10000,
    originalPrice: 20000,
    discountPercent: 50,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0022/A000000223414117ko.jpg',
    description: 'Mặt nạ giấy quốc dân số 1 Olive Young Hàn Quốc 15 năm liên tiếp.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000238816': {
    name: 'Sáp chống nắng kiềm dầu Obge Pore Zero Oil Control Sun Stick 18g',
    nameKr: '[1등 기름종이선스틱] 오브제 포어 제로 오일 컨트롤 선스틱 18g 단품/기획',
    brand: 'OBGE',
    brandKr: '오브제',
    category: 'cosmetics',
    foreignPrice: 18900,
    originalPrice: 25000,
    discountPercent: 24,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0023/A00000023881608ko.jpg',
    description: 'Thanh lăn chống nắng kiềm dầu kiểm soát bã nhờn se khít lỗ chân lông Obge.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000240462': {
    name: 'Mặt Nạ Dưỡng Sáng Celimax Tranexamic Acid Brightening Cream Wrapping Mask [5+1 Miếng]',
    nameKr: '[잡티미백/TXA] 셀리맥스 트라넥삼산 브라이트닝 크림 랩핑 마스크 5매 기획 (+1매)',
    brand: 'Celimax',
    brandKr: '셀리맥스',
    category: 'cosmetics',
    foreignPrice: 23400,
    originalPrice: 26800,
    discountPercent: 12,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0024/A00000024046219ko.jpg',
    description: 'Mặt Nạ Dưỡng Sáng Celimax Tranexamic Acid Cream Wrapping Mask giảm thâm mờ nám hiệu quả.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000246985': {
    name: 'Tinh Chất Ampoule Dưỡng Tóc Chuyên Sâu Orara Hair Treatment 150ml',
    nameKr: '오라라 헤어 트리트먼트 앰플 150ml',
    brand: 'Orara',
    brandKr: '오라라',
    category: 'cosmetics',
    foreignPrice: 27500,
    originalPrice: 34000,
    discountPercent: 19,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0024/A00000024698501ko.jpg',
    description: 'Tinh chất phục hồi tóc xơ rối hư tổn Orara Hair Treatment 150ml.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000248829': {
    name: 'Mặt Nạ Giảm Mụn Khẩn Cấp Eom Trouble Patch Mask 3 Miếng',
    nameKr: '[8월올영픽/최예나PICK] 이옴 트러블 패치 마스크 3매',
    brand: 'Eom',
    brandKr: '이옴',
    category: 'cosmetics',
    foreignPrice: 13900,
    originalPrice: 21000,
    discountPercent: 33,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0024/A00000024882903ko.jpg',
    description: 'Mặt nạ giảm sưng mụn và làm dịu da cấp tốc Eom Trouble Patch Mask.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000250199': {
    name: 'Tinh Chất Thu Nhỏ Lỗ Chân Lông Celimax The Vita A Retinal Shot Booster 15ml (+3ml)',
    nameKr: '[단독기획/모공탄력] 셀리맥스 더 비타 A 레티날 샷 타이트닝 부스터 15ml 기획(+3ml)',
    brand: 'Celimax',
    brandKr: '셀리맥스',
    category: 'cosmetics',
    foreignPrice: 20900,
    originalPrice: 30000,
    discountPercent: 30,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025019901ko.jpg',
    description: 'Tinh chất Retinal tăng sinh collagen se khít lỗ chân lông Celimax Vita A Retinal Shot Booster 15ml.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000253122': {
    name: 'Phấn Nước Che Phủ Lâu Trôi Fwee All Day Cover Black Cushion (Kèm Lõi Thay Thế)',
    nameKr: '[민스코공동개발] 퓌 올데이 커버 블랙 쿠션 리필기획(본품+리필) 5종',
    brand: 'fwee',
    brandKr: '퓌',
    category: 'cosmetics',
    foreignPrice: 29000,
    originalPrice: 38000,
    discountPercent: 23,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025312239ko.jpg',
    description: 'Phấn Nước Che Phủ Lâu Trôi Fwee All Day Cover Black Cushion cao cấp.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000255585': {
    name: 'Bông Tẩy Da Chết & Dưỡng Ẩm Cà Rốt Skinfood Carrot Carotene Water Pad [Bộ 1+1 120 Miếng]',
    nameKr: '[1+1/한정기획] 스킨푸드 캐롯 카로틴 카밍 워터 패드 60매 더블기획 (+PDRN 패드 2매*3)',
    brand: 'Skinfood',
    brandKr: '스킨푸드',
    category: 'cosmetics',
    foreignPrice: 26200,
    originalPrice: 42000,
    discountPercent: 37,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025558512ko.jpg',
    description: 'Bông dưỡng ẩm làm dịu chiết xuất cà rốt Skinfood Carrot Carotene Water Pad bán chạy số 1.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000255682': {
    name: 'Miếng Pad Se Khít Lỗ Chân Lông Medicube Zero Pore Pad [Bộ 1+1 140 Miếng]',
    nameKr: '[1등/아이돌 모공패드] 메디큐브 제로 모공 패드 1+1 140매 리필 기획 (본품70매+리필 70매)',
    brand: 'Medicube',
    brandKr: '메디큐브',
    category: 'cosmetics',
    foreignPrice: 28900,
    originalPrice: 33000,
    discountPercent: 12,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025568254ko.jpg',
    description: 'Miếng pad se khít lỗ chân lông Medicube Zero Pore Pad TOP 1 Olive Young Hàn Quốc.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000259222': {
    name: 'Xịt Khoáng Tinh Chất Thạch Collagen Biodance Peptide Jelly Serum Mist 50ml',
    nameKr: '[한정기획] 바이오던스 콜라겐 펩타이드 젤리 세럼 미스트 50ml 기획(+퍼글러 미스트 파우치)',
    brand: 'Biodance',
    brandKr: '바이오던스',
    category: 'cosmetics',
    foreignPrice: 16200,
    originalPrice: 19000,
    discountPercent: 14,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0025/A00000025922201ko.jpg',
    description: 'Xịt khoáng collagen peptide thạch dưỡng căng bóng Biodance Collagen Peptide Serum Mist.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000260530': {
    name: 'Mặt Nạ Giấy Đậu Xanh Làm Dịu & Hạ Nhiệt Beplain Mung Bean Cooling Mask 5 Miếng',
    nameKr: '[8월올영픽/붓기쏙] 비플레인 녹두 쿨링 앤 슬림 페이스 마스크 5매',
    brand: 'Beplain',
    brandKr: '비플레인',
    category: 'cosmetics',
    foreignPrice: 7100,
    originalPrice: 15000,
    discountPercent: 52,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0026/A00000026053001ko.jpg',
    description: 'Mặt nạ chiết xuất hạt đậu xanh làm dịu làm mát giảm sưng Beplain Mung Bean Cooling Mask 5 miếng.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000261415': {
    name: 'Kem Dưỡng Tái Tạo Da Phục Hồi Hàng Rào Bảo Vệ Layerlab 80ml',
    nameKr: '레이어랩 배리어 리페어 수분 진정 크림 80ml',
    brand: 'Layerlab',
    brandKr: '레이어랩',
    category: 'skincare',
    foreignPrice: 28000,
    originalPrice: 35000,
    discountPercent: 20,
    productImage: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0026/A00000026141501ko.jpg',
    description: 'Kem dưỡng phục hồi da mẩn đỏ yếu tổn thương Layerlab Barrier Repair Cream 80ml.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.8
  }
};

import {
  cleanHighResImageUrl,
  isOliveYoungJunkImage,
  cleanKoreanTitle as cleanCoreTitle,
  extractBrandFromTitleOrDom,
  parseOliveYoungPrices,
  classifyCosmeticsCategory
} from './oliveYoungScraperCore.js';

/** Clean Korean promotional brackets [단독/기획] [1+1] etc */
export const cleanKoreanTitle = (raw) => {
  return cleanCoreTitle(raw);
};

/** Parse Korean price formats: Prioritize Discounted Sale Price over Original Price */
export const parseKoreanPrice = (html) => {
  if (!html) return null;
  const parsed = parseOliveYoungPrices(html);
  return parsed.foreignPrice || null;
};

/** Guess category from product name */
export const guessCategory = (name) => {
  const classified = classifyCosmeticsCategory(name);
  return classified.subCategory || classified.category;
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
        reviewsCount: Number(known.reviewsCount) || 0
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
      reviewsCount: Number(known.reviewsCount) || 0
    }
  };
};
