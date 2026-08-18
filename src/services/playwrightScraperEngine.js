/**
 * Playwright AI Scraper Service Integration Module v1.0
 * Connects Playwright browser automation output with Firebase Firestore & Admin DB.
 */

import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export const syncPlaywrightScrapedProductsToDb = async (productsArray) => {
  if (!Array.isArray(productsArray) || productsArray.length === 0) {
    return { success: false, count: 0, message: 'Danh sách sản phẩm trống!' };
  }

  let successCount = 0;
  for (const product of productsArray) {
    try {
      const docId = product.goodsNo || product.id || `PW_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const docRef = doc(db, 'products', docId);
      
      await setDoc(docRef, {
        ...product,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      successCount++;
    } catch (e) {
      console.warn("⚠️ Error saving product to Firestore:", e);
    }
  }

  return {
    success: true,
    count: successCount,
    message: `🎉 Đã đồng bộ thành công ${successCount} sản phẩm Playwright AI vào Admin!`
  };
};

export const fetchLatestPlaywrightScrapedProducts = async () => {
  try {
    const response = await fetch('/data/playwright_scraped_products.json');
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Could not fetch playwright_scraped_products.json:", err);
    return [];
  }
};
