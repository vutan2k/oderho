import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414', { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(3000);
  const detailData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.className + ' | ' + img.id + ' | ' + img.getAttribute('src'));
  });
  console.log(detailData.filter(s => s.includes('.jpg') || s.includes('.png')).slice(0, 20));
  await browser.close();
})();
