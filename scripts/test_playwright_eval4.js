import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' });
  const page = await context.newPage();
  await page.goto('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414', { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(3000);
  const data = await page.evaluate(() => {
    const mainImg = document.querySelector('#mainImg, #goodsImg img, .prd_detail_info img, .prd_img img');
    const thumbs = Array.from(document.querySelectorAll('#thumbs img, .prd_thumb img, .thumb_list img, .goods_thumb img')).map(img => img.src || img.getAttribute('data-src'));
    const desc = Array.from(document.querySelectorAll('#artcDesc img, #prdDetail img, .detail_info_area img')).map(img => img.src || img.getAttribute('data-src'));
    return { mainImg: mainImg ? mainImg.src : null, thumbs, desc };
  });
  console.log(data);
  await browser.close();
})();
