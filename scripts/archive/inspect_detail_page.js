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
  await page.waitForTimeout(4000); // Wait for dynamic contents to load
  
  const evaluation = await page.evaluate(() => {
    const results = {};
    
    // 1. Brand name exploration
    const brandSelectors = [
      '#moveBrandShop', '.prd_brand', '.tx_brand', '.brand_name', 
      '.prd_info .brand', '.tx_tit', 'p.brand', 'span.brand', 'a.brand'
    ];
    results.brand = brandSelectors.map(sel => {
      const el = document.querySelector(sel);
      return { selector: sel, text: el ? el.innerText.trim() : null, html: el ? el.outerHTML : null };
    });
    
    // 2. Product Name exploration
    const nameSelectors = [
      '.prd_name', '.goods_name', '.prd_info .name', 'h3.prd_name', 
      'p.prd_name', 'div.prd_name', '.prd_title', '.goods_title'
    ];
    results.name = nameSelectors.map(sel => {
      const el = document.querySelector(sel);
      return { selector: sel, text: el ? el.innerText.trim() : null, html: el ? el.outerHTML : null };
    });

    // 3. Category/Breadcrumbs exploration
    const categorySelectors = [
      '.loc_history', '.nav_history', '.breadcrumb', '.prd_detail_menu', 
      '.cate_list', '.now_cate', '.prd_cate', '#curCategoryId', '#curCategoryName'
    ];
    results.category = categorySelectors.map(sel => {
      const el = document.querySelector(sel);
      return { selector: sel, text: el ? el.innerText.trim() : null, html: el ? el.outerHTML : null };
    });
    
    // Let's also check breadcrumbs specifically: commonly list items or links
    const breadcrumbLinks = Array.from(document.querySelectorAll('.loc_history a, .nav_history a, #breadcrumb a, .now_cate a'))
      .map(a => a.innerText.trim());
    results.breadcrumbLinks = breadcrumbLinks;
    
    // 4. Price exploration
    const priceSelectors = [
      '.price', '.price_area', '.price .tx_cur', '.price .tx_org', '.prd_price', 
      '.tx_num', '.price-1', '.price-2', '.price_info', '.price .tx_num'
    ];
    results.price = priceSelectors.map(sel => {
      const el = document.querySelector(sel);
      return { selector: sel, text: el ? el.innerText.trim() : null, html: el ? el.outerHTML : null };
    });
    
    // Find all elements containing '원'
    results.wonElements = Array.from(document.querySelectorAll('*'))
      .filter(el => el.children.length === 0 && el.textContent.includes('원'))
      .map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.trim() }))
      .slice(0, 15);

    // 5. Product Image Gallery exploration
    const imgSelectors = [
      '#mainImg', '#repImageContainer img', '.prd_thumb_list img', 
      '.prd_img img', '.prd_thumb_bg img', '.thumb_list img', '.box_img img'
    ];
    results.productImages = imgSelectors.map(sel => {
      const el = document.querySelector(sel);
      return { 
        selector: sel, 
        src: el ? (el.getAttribute('data-src') || el.src) : null,
        outerHTML: el ? el.outerHTML : null
      };
    });

    results.allImages = Array.from(document.querySelectorAll('img'))
      .map(img => ({
        src: img.src,
        dataSrc: img.getAttribute('data-src'),
        class: img.className,
        id: img.id,
        alt: img.alt
      }))
      .filter(img => (img.src && img.src.includes('oliveyoung')) || (img.dataSrc && img.dataSrc.includes('oliveyoung')))
      .slice(0, 30);

    // 6. Review Images and Ratings
    const reviewScoreSelectors = [
      '.review_score', '.rating', '.score', '.prd_rating', '.star_score', '.point', '.grade'
    ];
    results.reviewScores = reviewScoreSelectors.map(sel => {
      const el = document.querySelector(sel);
      return { selector: sel, text: el ? el.innerText.trim() : null, html: el ? el.outerHTML : null };
    });

    const reviewImgSelectors = [
      '.review_thum img', '.review_list img', '#gdasList img', 
      '.gdas_img img', '.review_cont img', '.review_img_wrap img'
    ];
    results.reviewImages = reviewImgSelectors.map(sel => {
      const el = document.querySelector(sel);
      return { selector: sel, src: el ? (el.getAttribute('data-src') || el.src) : null };
    });

    // 7. Expand descriptions buttons
    const expandButtons = Array.from(document.querySelectorAll('button, a, .btn_detail_more, #btn_artcDescMore, .artcDesc_more'))
      .filter(el => el.textContent && (el.textContent.includes('더보기') || el.textContent.includes('상세')))
      .map(el => ({ tag: el.tagName, class: el.className, id: el.id, text: el.textContent.trim() }));
    results.expandButtons = expandButtons;
    
    // Description content div
    const descContainers = ['#artcDesc', '#prdDetail', '.detail_info_area', '.prd_detail_info'];
    results.descriptionContainers = descContainers.map(sel => {
      const el = document.querySelector(sel);
      return { selector: sel, exists: !!el, htmlSnippet: el ? el.outerHTML.substring(0, 150) : null };
    });

    return results;
  });
  
  const outputPath = './scripts/inspect_results.json';
  fs.writeFileSync(outputPath, JSON.stringify(evaluation, null, 2), 'utf-8');
  console.log(`Results saved to ${outputPath}`);
  await browser.close();
})();
