import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import 'dotenv/config';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  try {
    // 1. Check Exchange Rates
    const rateRef = doc(db, 'system_config', 'rates');
    const rateSnap = await getDoc(rateRef);
    if (rateSnap.exists()) {
      const data = rateSnap.data();
      console.log("📊 Cấu hình Tỷ Giá hiện tại trên DB:");
      console.log(`- KRW Rate: ${data.KRW?.rate}`);
      console.log(`- USD Rate: ${data.USD?.rate}`);
      console.log(`- Service Fee %: ${data.serviceFeePercent}`);
      console.log(`- Cập nhật lúc: ${data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt}`);
    } else {
      console.log("❌ Không tìm thấy document system_config/rates");
    }

    // 2. Check Recent Pending Products
    const pendingRef = collection(db, 'pending_products');
    const q = query(pendingRef, orderBy('scrapedAt', 'desc'), limit(5));
    const querySnap = await getDocs(q);
    console.log("\n📦 5 Sản Phẩm Hàng Chờ mới nhất trên DB:");
    querySnap.forEach(docSnap => {
      const p = docSnap.data();
      console.log(`- [${docSnap.id}] ${p.name || p.nameKr} (${p.brand}) - Giá: ₩${p.foreignPrice} - Nguồn: ${p.source}`);
    });
    
  } catch (error) {
    console.error("❌ Lỗi truy vấn Database:", error.message);
  }
  process.exit(0);
})();
