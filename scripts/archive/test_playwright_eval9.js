import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' });
  const page = await context.newPage();
  await page.goto('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414', { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(3000);
  const data = await page.evaluate(() => {
    const title = document.title.split('|')[0].trim();
    
    // Find all elements containing '원', grab the first one that has a number
    const elementsWithWon = Array.from(document.querySelectorAll('*'))
      .filter(el => el.children.length === 0 && el.textContent.includes('원'));
    let priceText = '25000';
    for (const el of elementsWithWon) {
      const match = el.textContent.match(/[\d,]+원/);
      if (match) {
        priceText = match[0];
        break; // take first valid price we see
      }
    }

    const allImgs = Array.from(document.querySelectorAll('img'))
      .map(img => img.getAttribute('data-src') || img.src || '')
      .filter(src => src.includes('cf-goods') || src.includes('gdasEditor') || src.includes('item') || src.includes('crop') || src.includes('thumbnails'));
    
    // De-dupe and clean up URLs
    const cleanImgs = [...new Set(allImgs)].map(src => {
       if (src.startsWith('//')) return 'https:' + src;
       if (src.startsWith('/')) return 'https://www.oliveyoung.co.kr' + src;
       return src;
    });

    return { nameKr: title, priceText, images: cleanImgs.slice(0, 30) };
  });
  console.log(data);
  await browser.close();
})();
