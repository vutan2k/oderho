import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection References
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const SYSTEM_CONFIG_COLLECTION = 'system_config';
const PRODUCTS_COLLECTION = 'products';
const PENDING_PRODUCTS_COLLECTION = 'pending_products';
const RATES_DOC = 'rates';

/**
 * 1. Subscribe to Realtime Orders (Global or User filtered)
 */
export const subscribeToOrders = (onUpdate, onError, userEmail) => {
  try {
    let q;
    if (userEmail) {
      q = query(
        collection(db, ORDERS_COLLECTION),
        where('userEmail', '==', userEmail),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    }

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt
      }));
      onUpdate(orders);
    }, (err) => {
      console.warn("Firestore orders listener fallback:", err);
      if (onError) onError(err);
    });
  } catch (err) {
    console.warn("Firestore subscription error:", err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * 2. Create New Order
 */
export const createOrderInDB = async (orderData) => {
  try {
    const orderId = orderData.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    
    const payload = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: orderData.paymentMethod || null,
      bankAccount: orderData.bankAccount || null,
      bankName: orderData.bankName || null,
      paymentDue: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, payload);
    return { success: true, id: orderId };
  } catch (err) {
    console.warn("Firestore createOrder error, using local fallback:", err);
    return { success: false, error: err };
  }
};

/**
 * 3. Update Order Quote (Admin)
 */
export const updateOrderQuoteInDB = async (orderId, quoteData, totalCalculated) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const batch = writeBatch(db);

    batch.update(docRef, {
      status: 'quoted',
      quote: quoteData,
      totalVnd: totalCalculated,
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    return { success: true };
  } catch (err) {
    console.warn("Firestore updateQuote error:", err);
    return { success: false, error: err };
  }
};

/**
 * 4. Update Order Status / Tracking (Admin)
 */
export const updateOrderStatusInDB = async (orderId, updates) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.warn("Firestore updateOrderStatus error:", err);
    return { success: false, error: err };
  }
};

/**
 * 4b. Delete Order (Admin)
 */
export const deleteOrderFromDB = async (orderId) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.warn("Firestore deleteOrder error:", err);
    return { success: false, error: err };
  }
};

/**
 * 5. Confirm Order Payment
 */
export const confirmOrderPaymentInDB = async (orderId, amountPaid) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'paid',
      paymentConfirmed: true,
      paymentDate: new Date().toISOString(),
      amountPaid: amountPaid,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.warn("Firestore confirmPayment error:", err);
    return { success: false, error: err };
  }
};

/**
 * 6. System Exchange Rates Sync
 */
export const subscribeToRates = (onUpdate) => {
  try {
    const docRef = doc(db, SYSTEM_CONFIG_COLLECTION, RATES_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (err) => {
      console.warn("Firestore rates listener fallback:", err);
    });
  } catch (err) {
    console.warn("Firestore rates subscribe error:", err);
    return () => {};
  }
};

export const updateRatesInDB = async (newRates) => {
  try {
    const docRef = doc(db, SYSTEM_CONFIG_COLLECTION, RATES_DOC);
    await setDoc(docRef, {
      ...newRates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore updateRates error:", err);
    return { success: false, error: err };
  }
};

/**
 * 7. Save / Update User Profile
 */
export const saveUserProfileInDB = async (userData) => {
  try {
    const userId = userData.uid || userData.email.replace(/[@.]/g, '_');
    const docRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore saveUserProfile error:", err);
    return { success: false, error: err };
  }
};

/**
 * 8. Subscribe to Realtime Products (published catalog)
 */
export const subscribeToProducts = (onUpdate) => {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(colRef, (snapshot) => {
      const products = snapshot.docs.map(docSnap => ({
        goodsNo: docSnap.id,
        ...docSnap.data()
      }));

      // Sắp xếp in-memory theo thời gian cập nhật mới nhất
      products.sort((a, b) => {
        const timeA = a.updatedAt?.seconds || (a.createdAt?.seconds) || (new Date(a.scrapedAt || 0).getTime()) || 0;
        const timeB = b.updatedAt?.seconds || (b.createdAt?.seconds) || (new Date(b.scrapedAt || 0).getTime()) || 0;
        return timeB - timeA;
      });

      onUpdate(products);
    }, (err) => {
      console.warn("Firestore products listener error:", err);
    });
  } catch (err) {
    console.warn("Firestore subscribeToProducts error:", err);
    return () => {};
  }
};

/**
 * 9. Save / Upsert a single product to Firestore
 */
export const saveProductToDB = async (product) => {
  try {
    if (!product || typeof product !== 'object') return { success: false };
    const goodsNo = product.goodsNo || `SP-${Date.now()}`;
    const docRef = doc(db, PRODUCTS_COLLECTION, String(goodsNo));

    const cleanPayload = {
      goodsNo: String(goodsNo),
      name: String(product.name || ''),
      nameKr: String(product.nameKr || product.name || ''),
      brand: String(product.brand || 'Korea Brand'),
      brandKr: String(product.brandKr || product.brand || ''),
      category: String(product.category || 'skincare'),
      foreignPrice: Number(product.foreignPrice) || 0,
      productImage: String(product.productImage || ''),
      images: Array.isArray(product.images) ? product.images.map(String) : [String(product.productImage || '')],
      photoReviews: Array.isArray(product.photoReviews) ? product.photoReviews.map(String) : [],
      description: String(product.description || ''),
      usage: String(product.usage || ''),
      origin: String(product.origin || 'Store Olive Young Korea'),
      rating: Number(product.rating) || 4.9,
      reviewsCount: Number(product.reviewsCount) || 120,
      productUrl: String(product.productUrl || ''),
      isPublished: product.isPublished !== false,
      status: String(product.status || 'published'),
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, cleanPayload, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore saveProduct error:", err);
    return { success: false, error: err };
  }
};

/**
 * 10. Delete a product from Firestore
 */
export const deleteProductFromDB = async (goodsNo) => {
  try {
    if (!goodsNo) return { success: false, error: 'missing goodsNo' };
    const docRef = doc(db, PRODUCTS_COLLECTION, String(goodsNo));
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.warn("Firestore deleteProduct error:", err);
    return { success: false, error: err };
  }
};

/**
 * 11. Subscribe to Realtime Pending Products (Hàng chờ duyệt)
 */
export const subscribeToPendingProducts = (onUpdate) => {
  try {
    const colRef = collection(db, PENDING_PRODUCTS_COLLECTION);
    return onSnapshot(colRef, (snapshot) => {
      const pendingItems = snapshot.docs.map(docSnap => ({
        goodsNo: docSnap.id,
        ...docSnap.data()
      }));

      pendingItems.sort((a, b) => {
        const timeA = new Date(a.scrapedAt || 0).getTime();
        const timeB = new Date(b.scrapedAt || 0).getTime();
        return timeB - timeA;
      });

      onUpdate(pendingItems);
    }, (err) => {
      console.warn("Firestore pending_products listener error:", err);
    });
  } catch (err) {
    console.warn("Firestore subscribeToPendingProducts error:", err);
    return () => {};
  }
};

/**
 * 12. Save Pending Product to Firestore
 */
export const savePendingProductToDB = async (product) => {
  try {
    if (!product || typeof product !== 'object') return { success: false };
    const goodsNo = product.goodsNo || `SP-${Date.now()}`;
    const docRef = doc(db, PENDING_PRODUCTS_COLLECTION, String(goodsNo));

    const cleanPayload = {
      goodsNo: String(goodsNo),
      name: String(product.name || ''),
      nameKr: String(product.nameKr || product.name || ''),
      brand: String(product.brand || 'Korea Brand'),
      brandKr: String(product.brandKr || product.brand || ''),
      category: String(product.category || 'skincare'),
      foreignPrice: Number(product.foreignPrice || product.price) || 0,
      price: Number(product.price || product.foreignPrice) || 0,
      productImage: String(product.productImage || ''),
      images: Array.isArray(product.images) ? product.images.map(String) : [String(product.productImage || '')],
      photoReviews: Array.isArray(product.photoReviews) ? product.photoReviews.map(String) : [],
      description: String(product.description || ''),
      usage: String(product.usage || ''),
      origin: String(product.origin || 'Store Olive Young Korea'),
      rating: Number(product.rating) || 4.9,
      reviewsCount: Number(product.reviewsCount) || 120,
      productUrl: String(product.productUrl || ''),
      scrapedAt: product.scrapedAt || new Date().toISOString(),
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, cleanPayload, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore savePendingProduct error:", err);
    return { success: false, error: err };
  }
};

/**
 * 13. Delete Pending Product from Firestore
 */
export const deletePendingProductFromDB = async (goodsNo) => {
  try {
    if (!goodsNo) return { success: false, error: 'missing goodsNo' };
    const docRef = doc(db, PENDING_PRODUCTS_COLLECTION, String(goodsNo));
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.warn("Firestore deletePendingProduct error:", err);
    return { success: false, error: err };
  }
};

