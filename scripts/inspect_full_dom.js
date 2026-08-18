import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ 
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
  });
  const page = await context.newPage();
  
  const testUrl = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414';
  console.log(`Navigating to ${testUrl}...`);
  await page.goto(testUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000); // Wait for dynamic contents to load
  
  const domAnalysis = await page.evaluate(() => {
    const analysis = {};
    
    // Helper to find elements by text substring
    const findElementsByText = (textStr) => {
      const results = [];
      const walker = document.createTreeWalker(
        document.body, 
        NodeFilter.SHOW_ELEMENT, 
        {
          acceptNode: (node) => {
            if (node.children.length === 0 && node.textContent && node.textContent.includes(textStr)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            // Check if it's an element that has only text node children
            if (Array.from(node.childNodes).every(c => c.nodeType === Node.TEXT_NODE) && node.textContent && node.textContent.includes(textStr)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        }
      );
      
      let node;
      while (node = walker.nextNode()) {
        results.push({
          tag: node.tagName,
          class: node.className,
          id: node.id,
          text: node.textContent.trim(),
          parentTag: node.parentElement ? node.parentElement.tagName : null,
          parentClass: node.parentElement ? node.parentElement.className : null,
          grandParentTag: node.parentElement && node.parentElement.parentElement ? node.parentElement.parentElement.tagName : null,
          grandParentClass: node.parentElement && node.parentElement.parentElement ? node.parentElement.parentElement.className : null
        });
      }
      return results;
    };

    // Find name elements (Mediheal is 메디힐)
    analysis.brandMatches = findElementsByText('메디힐');
    
    // Product name: 에센셜 마스크
    analysis.nameMatches = findElementsByText('에센셜 마스크');
    
    // Category matches: 마스크팩 or 홈
    analysis.categoryMatches = findElementsByText('마스크팩');
    
    // Review score / rating: "평점" or "4.9"
    analysis.ratingMatches = findElementsByText('평점');
    
    // Review count matches (if any, e.g. "리뷰" or "건" or number of reviews)
    analysis.reviewCountMatches = findElementsByText('리뷰').slice(0, 10);
    
    // Prices matches: Let's find elements containing '원'
    // Let's also look for elements with '할인' (discount)
    analysis.discountMatches = findElementsByText('할인').slice(0, 10);
    
    // Let's dump all img tags with their classes and parent classes to see where the product gallery lives
    analysis.imgGallery = Array.from(document.querySelectorAll('img'))
      .map(img => ({
        src: img.src,
        class: img.className,
        parentTag: img.parentElement ? img.parentElement.tagName : null,
        parentClass: img.parentElement ? img.parentElement.className : null,
        grandParentClass: img.parentElement && img.parentElement.parentElement ? img.parentElement.parentElement.className : null,
        alt: img.alt
      }))
      .filter(img => img.src && (img.src.includes('cf-goods') || img.src.includes('gdas')))
      .slice(0, 30);
      
    // Let's also look at all list items inside the page to see if we can find lists/breadcrumbs
    analysis.lists = Array.from(document.querySelectorAll('ul, ol'))
      .map(list => ({
        class: list.className,
        id: list.id,
        itemsCount: list.children.length,
        textSnippet: list.innerText ? list.innerText.substring(0, 100).replace(/\n/g, ' ') : ''
      }))
      .filter(l => l.textSnippet.length > 0)
      .slice(0, 15);

    return analysis;
  });

  const outputPath = './scripts/inspect_full_dom.json';
  fs.writeFileSync(outputPath, JSON.stringify(domAnalysis, null, 2), 'utf-8');
  console.log(`Full DOM analysis saved to ${outputPath}`);
  await browser.close();
})();
