/**
 * TAVY KOREA — Korean Health, Ginseng & Supplement Translation & Attribute Dictionary
 * Từ điển dịch thuật và trích xuất chuyên sâu Sâm Nấm & Thực Phẩm Chức Năng Hàn - Việt
 * Chuẩn Dược liệu & Y học dinh dưỡng.
 */

// ═══ 1. BẢNG DỊCH THƯƠNG HIỆU UY TÍN HÀN QUỐC ═══
export const KOREAN_HEALTH_BRANDS = [
  { kr: /정관장|CHEONGKWANJANG|Cheong Kwan Jang/gi, vi: 'KGC CheongKwanJang (Sâm Chính Phủ)' },
  { kr: /굿베이스|GoodBASE|Good Base/gi, vi: 'GoodBASE (KGC)' },
  { kr: /농협|농협홍삼|한삼인|HANSAMIN/gi, vi: 'Hansamin Nonghyup (Nông Hiệp Hàn Quốc)' },
  { kr: /종근당건강|종근당|Chong Kun Dang|CKD/gi, vi: 'Chong Kun Dang Health' },
  { kr: /락토핏|LACTO-FIT|Lacto Fit/gi, vi: 'Lacto-Fit' },
  { kr: /고려은단|KOREA EUNDAN/gi, vi: 'Korea Eundan' },
  { kr: /동아제약|Dong-A Pharm/gi, vi: 'Dong-A Pharm' },
  { kr: /일동제약|ILDONG/gi, vi: 'Ildong Pharmaceutical' },
  { kr: /유한양행|YUHAN/gi, vi: 'Yuhan' },
  { kr: /오소몰|ORTHOMOL/gi, vi: 'Orthomol' },
  { kr: /CJ웰케어|CJ Wellcare|BYO유산균/gi, vi: 'CJ Wellcare' },
  { kr: /대원제약|Daewon/gi, vi: 'Daewon Pharm' },
  { kr: /뉴트리원|NUTRIONE|BB LAB|비비랩/gi, vi: 'NutriOne BB LAB' },
  { kr: /천지양|CHUNJIYANG/gi, vi: 'Chunjiyang Ginseng' },
  { kr: /풍기인삼|Punggi Ginseng/gi, vi: 'Sâm Punggi' },
  { kr: /금산인삼|Geumsan Ginseng/gi, vi: 'Sâm Geumsan' }
];

// ═══ 2. TỪ ĐIỂN THUẬT NGỮ DƯỢC LIỆU & THÀNH PHẦN HOẠT CHẤT ═══
export const HEALTH_TRANSLATION_DICT = [
  // SÂM & DƯỢC LIỆU QUÝ
  [/6년근\s*홍삼정\s*에브리타임/g, 'Cao Hồng Sâm 6 Năm Tuổi Everytime Dạng Stick'],
  [/홍삼정\s*에브리타임/g, 'Cao Hồng Sâm Everytime Dạng Stick'],
  [/6년근\s*홍삼정/g, 'Cao Hồng Sâm Cô Đặc 6 Năm Tuổi'],
  [/6년근\s*홍삼농축액|6년근\s*홍삼진액/g, 'Tinh Chất Hồng Sâm 6 Năm Tuổi Đậm Đặc'],
  [/6년근\s*홍삼/g, 'Hồng Sâm 6 Năm Tuổi'],
  [/6년근/g, '6 Năm Tuổi'],
  [/에브리타임/g, 'Everytime'],
  [/홍삼정/g, 'Cao Hồng Sâm Cô Đặc'],
  [/홍삼스틱/g, 'Hồng Sâm Dạng Stick Tiện Lợi'],
  [/홍삼진액|홍삼농축액/g, 'Tinh Chất Hồng Sâm Đậm Đặc'],
  [/홍삼음료|홍삼원/g, 'Nước Hồng Sâm Bổ Dưỡng'],
  [/홍삼절편/g, 'Hồng Sâm Tẩm Mật Ong Cắt Lát'],
  [/홍삼뿌리/g, 'Củ Hồng Sâm Nguyên Củ'],
  [/홍삼/g, 'Hồng Sâm'],
  [/흑삼/g, 'Hắc Sâm Thượng Hạng'],
  [/인삼/g, 'Nhân Sâm Tươi Hàn Quốc'],
  [/수삼/g, 'Sâm Tươi Nguyên Củ'],
  [/태극삼/g, 'Thái Cực Sâm'],
  [/백삼/g, 'Bạch Sâm'],
  [/진세노사이드/g, 'Ginsenoside (Rg1+Rb1+Rg3)'],
  [/사포닌/g, 'Saponin Tự Nhiên'],
  [/녹용/g, 'Nhung Hươu Thượng Hạng'],
  [/침향/g, 'Trầm Hương Quý Hiếm'],
  [/침향환/g, 'Viên Hoàn Trầm Hương Hoàng Gia'],
  [/공진단/g, 'Viên Hoàn Bổ Não Gongjindan'],
  [/경옥고/g, 'Cao Dưỡng Sinh Gyeongokgo'],

  // NẤM QUÝ HÀN QUỐC
  [/영지버섯/g, 'Nấm Linh Chi Đỏ Hàn Quốc'],
  [/상황버섯/g, 'Nấm Thượng Hoàng'],
  [/차가버섯/g, 'Nấm Chaga Tự Nhiên'],
  [/동충하초/g, 'Đông Trùng Hạ Thảo'],
  [/눈꽃동충하초/g, 'Đông Trùng Hạ Thảo Tuyết Hoa'],
  [/노루궁뎅이버섯/g, 'Nấm Đầu Khỉ (Lion Mane)'],
  [/표고버섯/g, 'Nấm Hương Hàn Quốc'],
  [/버섯/g, 'Nấm'],

  // THỰC PHẨM CHỨC NĂNG & VITAMIN
  [/생유산균/g, 'Men Vi Sinh Lợi Khuẩn Sống'],
  [/프로바이오틱스/g, 'Men Vi Sinh Probiotics'],
  [/프리바이오틱스/g, 'Prebiotics'],
  [/포스트바이오틱스/g, 'Postbiotics'],
  [/유산균/g, 'Men Vi Sinh Probiotics'],
  [/오메가3|오메가 3/g, 'Omega 3 Dầu Cá Tinh Khiết'],
  [/rTG 오메가3|알티지 오메가3/g, 'rTG Omega-3 Hấp Thu Cao'],
  [/루테인 지아잔틴/g, 'Lutein & Zeaxanthin Bổ Mắt Toàn Diện'],
  [/루테인/g, 'Lutein Bổ Mắt Giảm Mỏi Thị Lực'],
  [/지아잔틴/g, 'Zeaxanthin'],
  [/밀크씨슬|밀크시슬/g, 'Silymarin Kế Sữa Bổ Gan Giải Độc'],
  [/간건강/g, 'Bảo Vệ Gan Khỏe Mạnh'],
  [/비타민C|비타민 C/g, 'Vitamin C 1000mg'],
  [/멀티비타민/g, 'Vitamin Tổng Hợp & Khoáng Chất'],
  [/활성비타민/g, 'Vitamin Hoạt Tính Hấp Thu Nhanh'],
  [/비타민B|비타민 B/g, 'Phức Hợp Vitamin B Complex'],
  [/비타민D|비타민 D/g, 'Vitamin D3 Tăng Miễn Dịch'],
  [/칼슘 마그네슘 아연/g, 'Canxi + Magie + Kẽm (Cal-Mag-Zinc)'],
  [/저분자 콜라겐/g, 'Collagen Thủy Phân Phân Tử Nhỏ'],
  [/피쉬 콜라겐/g, 'Collagen Cá Biển Sâu Hấp Thu Nhanh'],
  [/콜라겐/g, 'Collagen Đẹp Da Chống Lão Hóa'],
  [/글루타치온/g, 'Glutathione Trắng Da Mờ Nám'],
  [/히알루론산/g, 'Hyaluronic Acid Cấp Ẩm'],
  [/엘라스틴/g, 'Elastin Đàn Hồi'],
  [/단백질 쉐이크|프로틴 쉐이크/g, 'Sữa Lắc Bổ Sung Đạm Protein'],
  [/단백질/g, 'Protein'],
  [/식이섬유/g, 'Chất Xơ Hỗ Trợ Tiêu Hóa'],
  [/코엔자임Q10|코엔자임 Q10|코큐텐/g, 'Coenzyme Q10 Tim Mạch'],

  // QUY CÁCH ĐÓNG GÓI & DẠNG DÙNG
  [/10ml\s*x\s*30포/g, 'Hộp 30 Gói x 10ml (Dùng 1 Tháng)'],
  [/10ml\s*x\s*50포/g, 'Hộp 50 Gói x 10ml'],
  [/10ml\s*x\s*100포/g, 'Hộp 100 Gói x 10ml (Tiết Kiệm)'],
  [/240g/g, 'Hũ 240g'],
  [/120g/g, 'Hũ 120g'],
  [/100g/g, 'Hũ 100g'],
  [/60정|60캡슐/g, 'Lọ 60 Viên (Dùng 1-2 Tháng)'],
  [/90정|90캡슐/g, 'Lọ 90 Viên (Dùng 3 Tháng)'],
  [/120정|120캡슐/g, 'Lọ 120 Viên (Dùng 4 Tháng)'],
  [/180정|180캡슐/g, 'Lọ 180 Viên'],
  [/30포/g, 'Hộp 30 Gói (Dùng 1 Tháng)'],
  [/50포/g, 'Hộp 50 Gói'],
  [/60포/g, 'Hộp 60 Gói (Dùng 2 Tháng)'],
  [/100포/g, 'Hộp 100 Gói'],
  [/선물세트|선물포장/g, 'Bộ Quà Tặng Sang Trọng Kèm Túi Xách'],
  [/기획세트|기획/g, 'Bộ Đặc Biệt Tiết Kiệm'],
  [/골드/g, 'Gold Hoàng Gia'],
  [/로얄/g, 'Royal Xuất Khẩu Cao Cấp'],
  [/프리미엄/g, 'Premium'],
  [/키즈/g, 'Cho Trẻ Em'],
  [/여성용|우먼/g, 'Dành Cho Phụ Nữ'],
  [/남성용|맨/g, 'Dành Cho Nam Giới'],
  [/시니어/g, 'Dành Cho Người Cao Tuổi'],

  // TỪ KHÓA CHỨNG NHẬN & PHÁP LÝ HÀN QUỐC
  [/건강기능식품/g, '[Chứng Nhận TPCN Chuẩn Y Tế Hàn Quốc MFDS]'],
  [/GMP인증|GMP/g, '[Đạt Chuẩn GMP]'],
  [/식약처 인정|식약처/g, '[Bộ An Toàn Thực Phẩm Dược Phẩm Hàn Quốc Chứng Nhận]'],
  [/기능성/g, 'Tác Dụng Dược Lý']
];

// ═══ 3. HÀM DỊCH TÊN TIẾNG HÀN SANG TIẾNG VIỆT CHUẨN DƯỢC LIỆU ═══
export function translateKoreanHealthTitle(krTitle) {
  if (!krTitle || typeof krTitle !== 'string') return 'Sản phẩm Sâm Nấm & TPCN Hàn Quốc';
  let title = krTitle;

  // 1. Thay thế tên thương hiệu
  KOREAN_HEALTH_BRANDS.forEach(b => {
    title = title.replace(b.kr, b.vi + ' ');
  });

  // 2. Thay thế thuật ngữ chuyên ngành
  HEALTH_TRANSLATION_DICT.forEach(([regex, vi]) => {
    title = title.replace(regex, vi);
  });

  // 3. Xử lý dấu ngoặc và từ rác
  title = title
    .replace(/\[[^\]]*단독[^\]]*\]/gi, '')
    .replace(/\[[^\]]*특가[^\]]*\]/gi, '')
    .replace(/\[[^\]]*쿠폰[^\]]*\]/gi, '')
    .replace(/\[[^\]]*무료배송[^\]]*\]/gi, '')
    .replace(/[가-힣]/g, '') // Lược bỏ ký tự tiếng Hàn còn sót lại
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();

  // Làm sạch các dấu ngoặc vuông rỗng []
  title = title.replace(/\[\s*\]/g, '').trim();

  return title || krTitle;
}

// ═══ 4. HÀM TỰ ĐỘNG PHÂN LOẠI DANH MỤC (GINSENG VS SUPPLEMENTS) ═══
export function categorizeHealthProduct(krTitle = '', brand = '') {
  const text = `${krTitle} ${brand}`.toLowerCase();
  
  const isGinseng = /홍삼|인삼|수삼|흑삼|태극삼|백삼|절편|진세노사이드|사포닌|ginseng|red ginseng|영지버섯|상황버섯|차가버섯|동충하초|mushroom|reishi/i.test(text);
  
  if (isGinseng) {
    return 'ginseng';
  }
  return 'supplements';
}

// ═══ 5. BÓC TÁCH HOẠT CHẤT CHÍNH (ACTIVE INGREDIENTS) ═══
export function extractActiveIngredients(rawText = '') {
  const ingredients = [];
  const text = String(rawText);

  // Bóc tách Ginsenoside
  const ginMatch = text.match(/(진세노사이드|Ginsenoside|Rg1\s*\+\s*Rb1\s*\+\s*Rg3)[^\d]*([\d\.]+\s*mg)/i);
  if (ginMatch) {
    ingredients.push(`Ginsenoside (Rg1+Rb1+Rg3): ${ginMatch[2]}`);
  }

  // Bóc tách Hàm lượng cô đặc hồng sâm
  const redGinConc = text.match(/홍삼농축액[^\d]*(\d+[\.]?\d*\s*%)/i);
  if (redGinConc) {
    ingredients.push(`Hồng sâm 6 năm tuổi cô đặc: ${redGinConc[1]}`);
  }

  // Bóc tách Men vi sinh CFU
  const cfuMatch = text.match(/(\d+[\.]?\d*\s*(억|조|Billion)?\s*(CFU|마리|유산균))/i);
  if (cfuMatch) {
    ingredients.push(`Lợi khuẩn sống Probiotics: ${cfuMatch[0]}`);
  }

  // Bóc tách Vitamin C
  const vitCMatch = text.match(/(비타민C|Vitamin\s*C)[^\d]*(\d+[\.]?\d*\s*mg)/i);
  if (vitCMatch) {
    ingredients.push(`Vitamin C tinh khiết: ${vitCMatch[2]}`);
  }

  // Bóc tách Lutein
  const luteinMatch = text.match(/(루테인|Lutein)[^\d]*(\d+[\.]?\d*\s*mg)/i);
  if (luteinMatch) {
    ingredients.push(`Lutein bổ mắt: ${luteinMatch[2]}`);
  }

  // Bóc tách Silymarin kế sữa
  const milkMatch = text.match(/(밀크씨슬|실리마린|Silymarin)[^\d]*(\d+[\.]?\d*\s*mg)/i);
  if (milkMatch) {
    ingredients.push(`Silymarin chiết xuất cây kế sữa: ${milkMatch[2]}`);
  }

  return ingredients;
}

// ═══ 6. TỰ ĐỘNG TẠO HƯỚNG DẪN SỬ DỤNG & CÔNG DỤNG CHUẨN ═══
export function generateHealthUsageGuide(productName = '', category = 'ginseng') {
  const name = String(productName).toLowerCase();
  
  if (category === 'ginseng') {
    if (name.includes('stick') || name.includes('gói') || name.includes('everytime')) {
      return {
        usage: 'Mỗi ngày dùng 1 gói (10ml). Uống trực tiếp trước hoặc sau bữa ăn 30 phút vào buổi sáng hoặc trưa để tăng cường sinh lực và tỉnh táo cả ngày.',
        targetUsers: 'Người mệt mỏi, suy nhược, người làm việc trí óc căng thẳng, người lớn tuổi cần bồi bổ đề kháng.',
        contraindications: 'Không dùng cho phụ nữ có thai hoặc đang cho con bú. Người có tiền sử mẫn cảm hoặc đang điều trị bệnh lý đặc biệt nên tham khảo ý kiến bác sĩ.'
      };
    } else if (name.includes('cao') || name.includes('hũ') || name.includes('cô đặc')) {
      return {
        usage: 'Mỗi ngày dùng 1-2 lần, mỗi lần 1 muỗng gạt (kèm theo hộp, khoảng 1g-3g) pha với 80ml nước ấm, có thể thêm mật ong tùy khẩu vị.',
        targetUsers: 'Người cần phục hồi sức khỏe sau ốm, người lớn tuổi, người muốn duy trì sự dẻo dai và trẻ hóa cơ thể.',
        contraindications: 'Tránh dùng vào buổi tối muộn để không gây khó ngủ.'
      };
    } else if (name.includes('nấm') || name.includes('linh chi') || name.includes('thượng hoàng')) {
      return {
        usage: 'Dùng 10g-20g nấm thái lát hãm với 1.5 - 2 lít nước sôi trong 30-45 phút, uống thay nước lọc hàng ngày hoặc dùng dạng cao cô đặc theo chỉ dẫn.',
        targetUsers: 'Người cần thanh lọc cơ thể, người mỡ máu cao, cần hỗ trợ chức năng gan và tăng miễn dịch tự nhiên.',
        contraindications: 'Phụ nữ có thai và người huyết áp quá thấp nên hỏi ý kiến chuyên gia.'
      };
    }
  } else {
    // Supplements
    if (name.includes('men') || name.includes('probiotics') || name.includes('lacto')) {
      return {
        usage: 'Mỗi ngày uống 1 gói hoặc 1 viên vào buổi sáng trước khi ăn 30 phút hoặc ngay khi thức dậy với nước nguội.',
        targetUsers: 'Người bị rối loạn tiêu hóa, đầy hơi, táo bón, người dùng kháng sinh hoặc cần cân bằng hệ vi sinh đường ruột.',
        contraindications: 'Không pha với nước sôi trên 40°C làm chết lợi khuẩn sống.'
      };
    } else if (name.includes('gan') || name.includes('silymarin') || name.includes('kế sữa')) {
      return {
        usage: 'Mỗi ngày uống 1 viên sau bữa ăn trưa hoặc tối với nước ấm.',
        targetUsers: 'Người thường xuyên uống bia rượu, thức khuya, nóng trong, men gan cao, mệt mỏi do chức năng gan kém.',
        contraindications: 'Người dị ứng với cây họ cúc cần lưu ý.'
      };
    } else if (name.includes('mắt') || name.includes('lutein')) {
      return {
        usage: 'Mỗi ngày uống 1 viên sau bữa ăn có chất béo để hấp thu tốt nhất.',
        targetUsers: 'Dân văn phòng tiếp xúc màn hình máy tính điện thoại nhiều, người mỏi mắt, khô mắt, người lớn tuổi suy giảm thị lực.',
        contraindications: 'Không uống vượt quá liều lượng khuyến cáo hàng ngày.'
      };
    } else if (name.includes('collagen')) {
      return {
        usage: 'Mỗi ngày 1 gói hoặc 1 chai uống vào buổi tối trước khi đi ngủ 30 phút hoặc buổi sáng khi bụng đói.',
        targetUsers: 'Người muốn cải thiện độ đàn hồi da, chống lão hóa, giảm nếp nhăn và khô ráp.',
        contraindications: 'Uống đủ 2 lít nước mỗi ngày để collagen phát huy tối đa hiệu quả.'
      };
    }
  }

  // Mặc định
  return {
    usage: 'Mỗi ngày dùng 1 lần theo liều lượng in trên bao bì. Uống đều đặn hàng ngày cùng nước ấm.',
    targetUsers: 'Người trưởng thành cần tăng cường sức khỏe, bổ sung dinh dưỡng thiếu hụt.',
    contraindications: 'Đọc kỹ thành phần trước khi sử dụng. Ngưng sử dụng nếu có dấu hiệu dị ứng bất thường.'
  };
}
