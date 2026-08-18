import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Mock Vite env
const firebaseConfig = {
  apiKey: "dummy",
  authDomain: "tavyorder.firebaseapp.com",
  projectId: "tavyorder",
  storageBucket: "tavyorder.appspot.com",
  messagingSenderId: "123",
  appId: "1:123:web:456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const data = JSON.parse(fs.readFileSync('./public/data/playwright_scraped_products.json', 'utf8'));

(async () => {
  let count = 0;
  for (const product of data) {
    try {
      const docId = String(product.goodsNo || product.id || `PW_${Date.now()}`);
      const docRef = doc(db, 'pending_products', docId); // Note: Admin UI expects pending products to review!
      
      const cleanPayload = {
        goodsNo: String(docId),
        name: String(product.name || product.nameKr || ''),
        nameKr: String(product.nameKr || product.name || ''),
        brand: String(product.brand || 'Korea Brand'),
        brandKr: String(product.brandKr || product.brand || ''),
        category: String(product.category || 'skincare'),
        foreignPrice: Number(product.foreignPrice || product.priceTxt?.replace(/[^0-9]/g, '')) || 25000,
        price: Number(product.foreignPrice || product.priceTxt?.replace(/[^0-9]/g, '')) || 25000,
        productImage: String(product.mainImg || product.productImage || ''),
        images: Array.isArray(product.albumImgs || product.images) ? (product.albumImgs || product.images).map(String) : [String(product.mainImg || '')],
        photoReviews: Array.isArray(product.photoReviews) ? product.photoReviews.map(String) : [],
        description: String(product.description || ''),
        origin: String(product.origin || 'Store Olive Young Korea'),
        rating: 4.9,
        reviewsCount: 120,
        productUrl: String(product.productUrl || ''),
        scrapedAt: new Date().toISOString()
      };

      await setDoc(docRef, cleanPayload, { merge: true });
      count++;
    } catch(e) {
      console.error(e);
    }
  }
  console.log('Synced ' + count + ' to pending_products');
  process.exit(0);
})();
