import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414', { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(2000);
  const detailData = await page.evaluate(() => {
    try {
        const detailImgs = Array.from(document.querySelectorAll('#artcDesc img, #prdDetail img, .detail_info_area img, .review_list img, .review_img img'))
          .map(img => img.getAttribute('src') || img.getAttribute('data-src') || '')
          .filter(src => src.length > 5);

        const thumbs = Array.from(document.querySelectorAll('#thumbs img, .prd_thumb img, .thumb_list img, .goods_thumb img'))
          .map(img => img.getAttribute('src') || '')
          .filter(Boolean);

        const allImgs = [...new Set([...thumbs, ...detailImgs])].slice(0, 30);
        return { success: true, count: allImgs.length, allImgs };
    } catch(err) {
        return { success: false, err: err.message };
    }
  });
  console.log(detailData);
  await browser.close();
})();
