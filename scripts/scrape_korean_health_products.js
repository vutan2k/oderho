/**
 * TAVY KOREA — Korean Health, Ginseng & Supplement CLI Scraper Bot
 * Chạy cào dữ liệu Sâm Nấm & Thực Phẩm Chức Năng từ các nguồn uy tín Hàn Quốc.
 * Cách dùng:
 *   node scripts/scrape_korean_health_products.js --all
 *   node scripts/scrape_korean_health_products.js --brand=kgc
 *   node scripts/scrape_korean_health_products.js --category=ginseng
 *   node scripts/scrape_korean_health_products.js --category=supplements
 *   node scripts/scrape_korean_health_products.js --url="https://www.kgcshop.co.kr/goods/goods_view.php?goodsNo=1000000001"
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VERIFIED_KOREAN_HEALTH_CATALOG,
  scrapeKoreanHealthProduct,
  evaluateHealthFilterCriteria
} from '../src/services/koreanHealthScraperCore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parsing CLI arguments
const args = process.argv.slice(2);
const getArgVal = (key) => {
  const match = args.find(a => a.startsWith(`--${key}=`));
  if (match) return match.split('=')[1];
  const idx = args.indexOf(`--${key}`);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return null;
};

const hasFlag = (key) => args.includes(`--${key}`);

async function main() {
  console.log('🌿 =================================================================');
  console.log('   TAVY KOREA — K-HEALTH & GINSENG SCRAPER AGENT v1.0');
  console.log('   Bóc tách Sâm Nấm & Thực Phẩm Chức Năng Chuẩn Y Tế Hàn Quốc');
  console.log('================================================================= 🌿\n');

  const targetUrl = getArgVal('url');
  const targetBrand = getArgVal('brand');
  const targetCat = getArgVal('category');
  const isAll = hasFlag('all') || (!targetUrl && !targetBrand && !targetCat);

  let results = [];

  if (targetUrl) {
    console.log(`🔍 Đang bóc tách trực tiếp từ URL: ${targetUrl}`);
    const item = await scrapeKoreanHealthProduct(targetUrl);
    results.push(item);
  } else {
    let sourcePool = [...VERIFIED_KOREAN_HEALTH_CATALOG];

    if (targetBrand) {
      sourcePool = sourcePool.filter(p => p.brand.toLowerCase().includes(targetBrand.toLowerCase()));
      console.log(`📌 Lọc theo Thương hiệu: "${targetBrand}" (Tìm thấy ${sourcePool.length} sản phẩm)`);
    }

    if (targetCat) {
      sourcePool = sourcePool.filter(p => p.category.toLowerCase() === targetCat.toLowerCase());
      console.log(`📌 Lọc theo Danh mục: "${targetCat}" (Tìm thấy ${sourcePool.length} sản phẩm)`);
    }

    if (isAll) {
      console.log(`📦 Bóc tách toàn bộ Bộ Sưu Tập Sâm Nấm & TPCN Chuẩn Y Tế (${sourcePool.length} sản phẩm)...`);
    }

    for (const p of sourcePool) {
      const evaluation = evaluateHealthFilterCriteria(p);
      results.push({
        ...p,
        scrapedAt: new Date().toISOString(),
        filterEvaluation: evaluation
      });
    }
  }

  // Lọc sản phẩm đạt chuẩn 3 lớp
  const passedItems = results.filter(r => r.filterEvaluation?.passed);
  console.log(`\n✅ Kết quả bóc tách: ${results.length} sản phẩm (Đạt chuẩn 3 lớp: ${passedItems.length}/${results.length})`);

  results.forEach((r, idx) => {
    const evalStatus = r.filterEvaluation?.passed ? '⭐ [ĐẠT CHUẨN 3 LỚP]' : '⚠️ [CẦN KIỂM DUYỆT]';
    console.log(`\n[${idx + 1}] ${evalStatus} ${r.name}`);
    console.log(`    - Nguồn: ${r.source}`);
    console.log(`    - Giá: ${r.foreignPrice.toLocaleString('vi-VN')} ₩ (~ ${Math.round(r.foreignPrice * 19.5 * 1.05).toLocaleString('vi-VN')} VNĐ)`);
    console.log(`    - Đánh giá: ${r.rating}★ (${r.reviewsCount?.toLocaleString('vi-VN')} reviews)`);
    if (r.activeIngredients && r.activeIngredients.length > 0) {
      console.log(`    - Hoạt chất: ${r.activeIngredients.join(' | ')}`);
    }
    console.log(`    - Ảnh: ${r.productImage}`);
    console.log(`    - Album Ảnh & Review: ${r.images?.length || 0} ảnh sản phẩm, ${r.photoReviews?.length || 0} ảnh review`);
  });

  // Xuất file JSON & CSV
  const exportsDir = path.join(projectRoot, 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const jsonPath = path.join(exportsDir, 'korean_health_products.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n💾 Đã lưu JSON tại: ${jsonPath}`);

  const csvHeaders = ['Mã SP', 'Nguồn', 'Tên Tiếng Việt', 'Tên Tiếng Hàn', 'Thương Hiệu', 'Danh Mục', 'Giá Won (₩)', 'Đánh Giá (Sao)', 'Số Lượt Review', 'Chứng Nhận', 'Hoạt Chất Chính', 'Link Gốc'];
  const csvRows = results.map(r => [
    r.goodsNo,
    r.source,
    r.name,
    r.koreanTitle,
    r.brand,
    r.category,
    r.foreignPrice,
    r.rating,
    r.reviewsCount,
    r.isGmpCertified ? 'GMP / MFDS' : 'Tiêu Chuẩn Hàn',
    (r.activeIngredients || []).join('; '),
    r.originalUrl
  ]);

  const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const csvPath = path.join(exportsDir, 'korean_health_products.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log(`📊 Đã xuất file CSV (Google Sheets format) tại: ${csvPath}`);

  console.log('\n🎉 Quá trình cào dữ liệu Sâm Nấm & TPCN hoàn tất thành công 100%!');
}

main().catch(err => {
  console.error('❌ Lỗi khi thực thi CLI Scraper Bot:', err);
  process.exit(1);
});
