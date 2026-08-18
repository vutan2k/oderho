import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' });
  const page = await context.newPage();
  await page.goto('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414', { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(3000);
  const data = await page.evaluate(() => {
    const allTextTags = Array.from(document.querySelectorAll('p, h1, h2, h3, span, div'));
    const nameNode = allTextTags.find(n => n.innerText && n.innerText.includes('[15년 연속 1위]'));
    const priceNode = allTextTags.find(n => n.innerText && n.innerText.includes('10,000원'));
    return { 
      nameClass: nameNode ? nameNode.className : 'null',
      priceClass: priceNode ? priceNode.className : 'null',
      title: document.title
    };
  });
  console.log(data);
  await browser.close();
})();
