import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ 
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
  });
  const page = await context.newPage();
  
  const testUrl = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414';
  await page.goto(testUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  
  const priceDetails = await page.evaluate(() => {
    const results = [];
    
    // Find all elements under GoodsDetailInfo_goods-info__NvhCW
    const container = document.querySelector('[class*="GoodsDetailInfo_goods-info"]');
    if (container) {
      // Find all elements with text inside container
      const allInside = container.querySelectorAll('*');
      allInside.forEach(el => {
        if (el.children.length === 0 && el.innerText) {
          results.push({
            tag: el.tagName,
            class: el.className,
            text: el.innerText.trim(),
            parentClass: el.parentElement ? el.parentElement.className : null
          });
        } else if (Array.from(el.childNodes).every(c => c.nodeType === Node.TEXT_NODE) && el.innerText) {
          results.push({
            tag: el.tagName,
            class: el.className,
            text: el.innerText.trim(),
            parentClass: el.parentElement ? el.parentElement.className : null
          });
        }
      });
    }
    
    // Also scan the whole document for any classes containing 'price' or 'Price' or 'PriceArea'
    const priceClasses = [];
    document.querySelectorAll('*').forEach(el => {
      const cls = el.className;
      if (cls && typeof cls === 'string' && (cls.toLowerCase().includes('price') || cls.toLowerCase().includes('discount'))) {
        priceClasses.push({
          tag: el.tagName,
          class: cls,
          text: el.innerText ? el.innerText.substring(0, 100).replace(/\n/g, ' ') : ''
        });
      }
    });
    
    return { infoContainerTexts: results, priceClassElements: priceClasses.slice(0, 30) };
  });
  
  console.log(JSON.stringify(priceDetails, null, 2));
  await browser.close();
})();
