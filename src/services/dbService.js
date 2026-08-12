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
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(docSnap => ({
        goodsNo: docSnap.id,
        ...docSnap.data()
      }));
      onUpdate(products);
    }, (err) => {
      console.warn("Firestore products listener fallback:", err);
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
    const goodsNo = product.goodsNo || `SP-${Date.now()}`;
    const docRef = doc(db, PRODUCTS_COLLECTION, goodsNo);
    await setDoc(docRef, {
      ...product,
      goodsNo,
      updatedAt: serverTimestamp(),
      createdAt: product.createdAt || serverTimestamp()
    }, { merge: true });
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
    const docRef = doc(db, PRODUCTS_COLLECTION, goodsNo);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.warn("Firestore deleteProduct error:", err);
    return { success: false, error: err };
  }
};
