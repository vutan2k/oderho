import React, { useState, useEffect } from 'react';
import { OLIVE_YOUNG_CATALOG } from '../data/catalog';
import { AppContext } from './AppContext';
import {
  subscribeToOrders,
  createOrderInDB,
  updateOrderQuoteInDB,
  updateOrderStatusInDB,
  confirmOrderPaymentInDB,
  subscribeToRates,
  updateRatesInDB,
  saveUserProfileInDB,
  subscribeToProducts,
  saveProductToDB,
  deleteProductFromDB,
  deleteOrderFromDB,
  subscribeToPendingProducts,
  savePendingProductToDB,
  deletePendingProductFromDB
} from '../services/dbService';
import { auth, db, loginWithGoogle, checkGoogleRedirectResult } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const defaultRates = {
  USD: { code: 'USD', name: 'Đô la Mỹ', symbol: '$', rate: 25500, shippingFee: 230000 },
  KRW: { code: 'KRW', name: 'Won Hàn Quốc', symbol: '₩', rate: 19.5, shippingFee: 180000 },
  JPY: { code: 'JPY', name: 'Yên Nhật', symbol: '¥', rate: 175, shippingFee: 190000 },
  serviceFeePercent: 5,
};

// Loại bỏ sản phẩm fake cũ (ảnh Unsplash mẫu cũ) — giữ 100% sản phẩm cào thật từ Olive Young
const isFakeProduct = (p) => {
  if (!p || typeof p !== 'object') return true;
  const img = String(p.productImage || '');
  const name = String(p.name || '');
  if (img.includes('unsplash.com')) return true; // Chỉ loại bỏ ảnh mẫu Unsplash cũ
  if (name === 'Sản Phẩm Test Fake') return true;
  return false;
};

const sanitizeProducts = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.filter(p => !isFakeProduct(p));
};

// Mock data for demo purposes (orders, users, products)
const initialMockOrders = [
  {
    id: 'ORD-827192',
    customerName: 'Nguyễn Thị Lan',
    customerPhone: '0912345678',
    customerAddress: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    country: 'USD',
    productUrl: 'https://www.sephora.com/product/dior-lip-glow-oil-P453814',
    productName: 'Son dưỡng Dior Addict Lip Glow Oil',
    brand: 'Dior',
    options: 'Màu 001 Pink - 6ml',
    qty: 2,
    foreignPrice: 40.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    quote: null,
  },
];

export const AppProvider = ({ children }) => {
  // ----- Authentication & Profile State -----
  const [authUser, setAuthUser] = useState(null); // Firebase User object
  const [profile, setProfile] = useState(null); // Custom profile stored in Firestore
  // ----- Admin Authentication -----
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    const saved = localStorage.getItem('admin_auth');
    return saved === 'true';
  });
  const loginAdmin = (password) => {
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === adminPass) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      return { success: true };
    }
    return { success: false, message: 'Mật khẩu không đúng' };
  };
  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  // Listen for Firebase auth changes and load/create profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        const profileRef = doc(db, 'users', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          const newProfile = { name: user.displayName || '', email: user.email, phone: '', address: '', addressBook: [] };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle Google Redirect Result
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const res = await checkGoogleRedirectResult();
        if (res && res.success) {
          // Logged in successfully via redirect
        }
      } catch (err) {
        console.error('Redirect result handle error:', err);
      }
    };
    handleRedirect();
  }, []);

  const currentUser = authUser ? {
    uid: authUser.uid,
    email: authUser.email,
    photoURL: authUser.photoURL || '',
    ...profile
  } : null;

  // ----- Existing Application State (orders, rates, products, cart, bot, etc.) -----
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('beauty_orders');
    return saved ? JSON.parse(saved) : initialMockOrders;
  });

  // Realtime Orders Subscription
  useEffect(() => {
    let emailFilter = null;
    if (authUser && !isAdminAuthenticated) {
      emailFilter = authUser.email;
    }
    const unsubscribe = subscribeToOrders(
      (updatedOrders) => {
        setOrders(updatedOrders);
        localStorage.setItem('beauty_orders', JSON.stringify(updatedOrders));
      },
      (err) => console.warn('Firestore orders sync:', err),
      emailFilter
    );
    return () => unsubscribe();
  }, [authUser, isAdminAuthenticated]);

  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('beauty_rates');
    return saved ? JSON.parse(saved) : defaultRates;
  });

  const CURRENT_CATALOG_VER = 'v5.0_unsplash_fix';

  const [products, setProducts] = useState(() => {
    try {
      const isCleared = localStorage.getItem('tavy_catalog_cleared');
      if (isCleared === 'true') {
        const savedCustom = localStorage.getItem('tavy_custom_products');
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          if (Array.isArray(parsed)) return sanitizeProducts(parsed);
        }
        return [];
      }
      const storedVer = localStorage.getItem('tavy_catalog_ver');
      if (storedVer !== CURRENT_CATALOG_VER) {
        localStorage.removeItem('tavy_published_products');
        localStorage.removeItem('tavy_custom_products');
        localStorage.setItem('tavy_catalog_ver', CURRENT_CATALOG_VER);
      }
      const savedCustom = localStorage.getItem('tavy_custom_products');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeProducts(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading tavy_custom_products:', e);
    }
    return OLIVE_YOUNG_CATALOG;
  });

  const [publishedProducts, setPublishedProducts] = useState(() => {
    try {
      const isCleared = localStorage.getItem('tavy_catalog_cleared');
      if (isCleared === 'true') {
        const savedPublished = localStorage.getItem('tavy_published_products');
        if (savedPublished) {
          const parsed = JSON.parse(savedPublished);
          if (Array.isArray(parsed)) return sanitizeProducts(parsed);
        }
        return [];
      }
      const storedVer = localStorage.getItem('tavy_catalog_ver');
      if (storedVer === CURRENT_CATALOG_VER) {
        const savedPublished = localStorage.getItem('tavy_published_products');
        if (savedPublished) {
          const parsed = JSON.parse(savedPublished);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sanitizeProducts(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading tavy_published_products:', e);
    }
    return OLIVE_YOUNG_CATALOG;
  });

  // ----- Realtime Firestore Rates Sync -----
  useEffect(() => {
    const unsubscribe = subscribeToRates((realtimeRates) => {
      if (realtimeRates && typeof realtimeRates === 'object') {
        setRates(prev => {
          const merged = { ...prev, ...realtimeRates };
          try {
            localStorage.setItem('beauty_rates', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const updateRates = async (newRates) => {
    setRates(newRates);
    try {
      localStorage.setItem('beauty_rates', JSON.stringify(newRates));
    } catch {}
    updateRatesInDB(newRates).catch(err => console.warn('Firestore updateRates failed:', err));
  };

  // ----- Realtime Firestore Products Sync (Hợp nhất dữ liệu kho hàng tuyệt đối không mất sản phẩm khi chuyển tab) -----
  useEffect(() => {
    const unsubscribe = subscribeToProducts((realtimeProducts) => {
      if (Array.isArray(realtimeProducts)) {
        const clean = sanitizeProducts(realtimeProducts);
        setProducts(prev => {
          const map = new Map();
          (prev || []).forEach(p => { if (p && p.goodsNo) map.set(p.goodsNo, p); });
          clean.forEach(p => { if (p && p.goodsNo) map.set(p.goodsNo, p); });
          const merged = Array.from(map.values());
          try { localStorage.setItem('tavy_custom_products', JSON.stringify(merged)); } catch {}
          return merged;
        });

        setPublishedProducts(prev => {
          const map = new Map();
          (prev || []).forEach(p => { if (p && p.goodsNo) map.set(p.goodsNo, p); });
          clean.forEach(p => { if (p && p.goodsNo) map.set(p.goodsNo, p); });
          const merged = Array.from(map.values());
          try { localStorage.setItem('tavy_published_products', JSON.stringify(merged)); } catch {}
          return merged;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const publishToWeb = async () => {
    const publishedList = products.map(p => ({ ...p, isPublished: true, status: 'published' }));
    setPublishedProducts(publishedList);
    localStorage.setItem('tavy_published_products', JSON.stringify(publishedList));

    // Đồng bộ thời gian thực 100% sản phẩm chính thức lên Firebase Firestore
    try {
      for (const item of publishedList) {
        if (item && item.goodsNo) {
          await saveProductToDB(item);
        }
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ sản phẩm lên Firestore:', err);
    }
  };

  const revertFromWeb = () => {
    setProducts([...publishedProducts]);
    localStorage.setItem('tavy_custom_products', JSON.stringify(publishedProducts));
  };

  const createOrder = async (orderData) => {
    const payload = {
      ...orderData,
      userEmail: authUser?.email || 'guest@tavy.vn',
      createdAt: new Date().toISOString(),
    };
    const res = await createOrderInDB(payload);
    if (!res.success) {
      const newOrder = { id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`, ...payload };
      const updated = [newOrder, ...orders];
      setOrders(updated);
      localStorage.setItem('beauty_orders', JSON.stringify(updated));
    }
    return res;
  };

  const deleteOrder = async (orderId) => {
    const res = await deleteOrderFromDB(orderId);
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem('beauty_orders', JSON.stringify(updated));
    return res;
  };

  // ----- Pending Products State -----
  const [pendingProducts, setPendingProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('tavy_pending_products');
      const parsed = saved ? JSON.parse(saved) : [];
      const clean = sanitizeProducts(parsed);
      if (clean.length !== parsed.length) {
        localStorage.setItem('tavy_pending_products', JSON.stringify(clean));
      }
      return clean;
    } catch {
      return [];
    }
  });

  // Sync Firestore Pending Products Realtime
  useEffect(() => {
    const unsubscribe = subscribeToPendingProducts((remoteItems) => {
      if (remoteItems && Array.isArray(remoteItems)) {
        const clean = sanitizeProducts(remoteItems);
        setPendingProducts(clean);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tavy_pending_products', JSON.stringify(pendingProducts));
    } catch {}
  }, [pendingProducts]);

  // Listener CÁCH 1: Nhận tin nhắn trực tiếp trong bộ nhớ Browser từ Extension (ZERO Limit & KHÔNG NẢY TAB)
  useEffect(() => {
    const handleExtensionMessage = (event) => {
      if (
        event.data &&
        event.data.source === 'TAVY_EXTENSION' &&
        event.data.type === 'TAVY_NEW_SCRAPED_PRODUCT' &&
        event.data.payload
      ) {
        console.log("⚡ [AppProvider] Nhận dữ liệu cào nguyên bản từ TAVY Extension:", event.data.payload.goodsNo);
        addPendingProduct(event.data.payload);
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, []);

  // Sync qua storage event giữa các tab trình duyệt
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tavy_pending_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPendingProducts(sanitizeProducts(parsed));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Global autoFill listener - Tự động nhận dữ liệu từ Extension bất kỳ ở trang nào
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const autoFill = params.get('autoFill');
      if (autoFill) {
        let decodedStr = '';
        try {
          const base64Clean = autoFill.replace(/-/g, '+').replace(/_/g, '/');
          decodedStr = decodeURIComponent(escape(atob(base64Clean)));
        } catch {
          try {
            decodedStr = decodeURIComponent(atob(autoFill));
          } catch {
            decodedStr = atob(autoFill);
          }
        }

        const decoded = JSON.parse(decodedStr);
        if (decoded && (decoded.name || decoded.n || decoded.nameKr || decoded.nk)) {
          const goodsNo = decoded.goodsNo || decoded.g || (decoded.url || decoded.u || '').match(/goodsNo=([A-Za-z0-9_]+)/)?.[1] || `SP-OY-${Date.now()}`;
          const rawPrice = decoded.foreignPrice || decoded.price || decoded.fp || decoded.p || 0;
          const parsedPrice = parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10) || 0;
          const mainImg = decoded.productImage || decoded.image || decoded.img || (decoded.images && decoded.images[0]) || (decoded.imgs && decoded.imgs[0]) || '';
          const albumImgs = decoded.images || decoded.imgs || (mainImg ? [mainImg] : []);

          const newPendingItem = {
            goodsNo: goodsNo,
            name: decoded.name || decoded.n || 'Sản phẩm Olive Young',
            nameKr: decoded.nameKr || decoded.nk || '',
            foreignPrice: parsedPrice,
            price: parsedPrice,
            productImage: mainImg,
            images: albumImgs,
            photoReviews: decoded.photoReviews || [],
            brand: decoded.brand || decoded.b || 'Korea Brand',
            brandKr: decoded.brandKr || '',
            category: decoded.category || decoded.cat || 'skincare',
            options: decoded.options || '1 Hộp',
            origin: 'Store Olive Young Korea',
            description: decoded.description || decoded.d || 'Sản phẩm chính hãng nội địa Hàn Quốc.',
            usage: decoded.usage || decoded.u || 'Xem chi tiết trên bao bì.',
            rating: decoded.rating || 4.9,
            reviewsCount: (decoded.photoReviews && decoded.photoReviews.length) || decoded.reviewsCount || 120,
            productUrl: decoded.url || decoded.u || '',
            scrapedAt: new Date().toISOString()
          };

          addPendingProduct(newPendingItem);

          // Xóa query autoFill khỏi URL để làm sạch thanh địa chỉ
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    } catch (e) {
      console.warn("Global autoFill listener error:", e);
    }
  }, []);

  const addPendingProduct = (product) => {
    if (!product) return;
    const cleanProduct = {
      ...product,
      goodsNo: product.goodsNo || `SP-${Date.now()}`
    };
    setPendingProducts(prev => {
      const filtered = prev.filter(p => p.goodsNo !== cleanProduct.goodsNo);
      return [cleanProduct, ...filtered];
    });
    savePendingProductToDB(cleanProduct).catch(e => console.warn("Lỗi lưu pending Firestore:", e));
  };

  const updatePendingProduct = (goodsNo, updates) => {
    setPendingProducts(prev => {
      const updated = prev.map(p => p.goodsNo === goodsNo ? { ...p, ...updates } : p);
      const target = updated.find(p => p.goodsNo === goodsNo);
      if (target) savePendingProductToDB(target).catch(() => {});
      return updated;
    });
  };

  const addProduct = (product) => {
    if (!product) return;
    const cleanProduct = {
      ...product,
      goodsNo: product.goodsNo || `SP-${Date.now()}`,
      isPublished: true,
      status: 'published'
    };

    setProducts(prev => {
      const filtered = prev.filter(p => p.goodsNo !== cleanProduct.goodsNo);
      const updated = [cleanProduct, ...filtered];
      try {
        localStorage.setItem('tavy_custom_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setPublishedProducts(prev => {
      const filtered = prev.filter(p => p.goodsNo !== cleanProduct.goodsNo);
      const updated = [cleanProduct, ...filtered];
      try {
        localStorage.setItem('tavy_published_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    saveProductToDB(cleanProduct).catch(err => console.warn('Firestore sync product failed:', err));
  };

  const updateProduct = (goodsNo, updates) => {
    let targetUpdated = null;
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.goodsNo === goodsNo) {
          targetUpdated = { ...p, ...updates };
          return targetUpdated;
        }
        return p;
      });
      try {
        localStorage.setItem('tavy_custom_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setPublishedProducts(prev => {
      const updated = prev.map(p => p.goodsNo === goodsNo ? { ...p, ...updates } : p);
      try {
        localStorage.setItem('tavy_published_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (targetUpdated) {
      saveProductToDB(targetUpdated).catch(err => console.warn('Firestore update product failed:', err));
    }
  };

  const deleteProduct = (goodsNo) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.goodsNo !== goodsNo);
      try {
        localStorage.setItem('tavy_custom_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setPublishedProducts(prev => {
      const updated = prev.filter(p => p.goodsNo !== goodsNo);
      try {
        localStorage.setItem('tavy_published_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    deleteProductFromDB(goodsNo).catch(err => console.warn('Firestore delete product failed:', err));
  };

  const deleteAllProducts = () => {
    const listToDelete = [...products];
    setProducts([]);
    setPublishedProducts([]);
    try {
      localStorage.removeItem('tavy_custom_products');
      localStorage.removeItem('tavy_published_products');
    } catch {}

    for (const item of listToDelete) {
      if (item && item.goodsNo) {
        deleteProductFromDB(item.goodsNo).catch(() => {});
      }
    }
  };

  const approvePendingProduct = (goodsNo) => {
    const target = pendingProducts.find(p => p.goodsNo === goodsNo);
    if (target) {
      addProduct(target);
      setPendingProducts(prev => prev.filter(p => p.goodsNo !== goodsNo));
      deletePendingProductFromDB(goodsNo).catch(e => console.warn("Lỗi xoá pending Firestore:", e));
    }
  };

  const approveSelectedPendingProducts = (goodsNoArray = []) => {
    if (!goodsNoArray || goodsNoArray.length === 0) return;
    const selectedSet = new Set(goodsNoArray);
    const targets = pendingProducts.filter(p => selectedSet.has(p.goodsNo));
    
    targets.forEach(item => {
      addProduct(item);
      deletePendingProductFromDB(item.goodsNo).catch(() => {});
    });

    setPendingProducts(prev => prev.filter(p => !selectedSet.has(p.goodsNo)));
  };

  const approveAllPendingProducts = () => {
    pendingProducts.forEach(p => {
      addProduct(p);
      deletePendingProductFromDB(p.goodsNo).catch(() => {});
    });
    setPendingProducts([]);
  };

  const rejectPendingProduct = (goodsNo) => {
    setPendingProducts(prev => prev.filter(p => p.goodsNo !== goodsNo));
    deletePendingProductFromDB(goodsNo).catch(e => console.warn("Lỗi xoá pending Firestore:", e));
  };

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('tavy_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading tavy_cart:', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tavy_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    const productId = product.goodsNo || product.id;
    setCart((prev) => {
      const existing = prev.find((item) => (item.goodsNo || item.id) === productId);
      if (existing) {
        return prev.map((item) =>
          (item.goodsNo || item.id) === productId ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (goodsNo) => {
    setCart((prev) => prev.filter((item) => (item.goodsNo || item.id) !== goodsNo));
  };

  const updateCartQty = (goodsNo, qty) => {
    if (qty <= 0) return removeFromCart(goodsNo);
    setCart((prev) =>
      prev.map((item) => ((item.goodsNo || item.id) === goodsNo ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // ----- Authentication Helper Functions -----
  const registerUser = async (email, password, name) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const profileRef = doc(db, 'users', user.uid);
      const newProfile = { name: name || '', email, phone: '', addressBook: [] };
      await setDoc(profileRef, newProfile);
      setProfile(newProfile);
      return { success: true, user };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      // Profile will be synced via onAuthStateChanged
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const loginWithGoogleAuth = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      // Listener will sync profile if needed
    }
    return result;
  };

  const logoutUser = async () => {
    try {
      await logoutGoogle();
      setAuthUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  const updateUserProfile = async (updates) => {
    if (!authUser) return { success: false, error: new Error('Not authenticated'), message: 'Chưa đăng nhập' };
    const profileRef = doc(db, 'users', authUser.uid);
    try {
      await setDoc(profileRef, { ...updates, email: authUser.email }, { merge: true });
      const snap = await getDoc(profileRef);
      const data = snap.data();
      setProfile(data);
      return { success: true, profile: data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error, message: error.message || 'Lỗi cập nhật hồ sơ' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!authUser) return { success: false, error: new Error('Not authenticated') };
    try {
      const credential = EmailAuthProvider.credential(authUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error };
    }
  };

  // ----- Context Value -----
  const contextValue = {
    // Auth related
    authUser,
    profile,
    currentUser,
    registerUser,
    loginUser,
    loginWithGoogleAuth,
    logoutUser,
    updateUserProfile,
    changePassword,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    // Existing app state
    orders,
    setOrders,
    rates,
    setRates,
    updateRates,
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    publishedProducts,
    oliveYoungCatalog: publishedProducts,
    publishToWeb,
    revertFromWeb,
    pendingProducts,
    setPendingProducts,
    addPendingProduct,
    updatePendingProduct,
    approvePendingProduct,
    approveSelectedPendingProducts,
    approveAllPendingProducts,
    rejectPendingProduct,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    createOrder,
    deleteOrder,
    // DB service functions (exposed for other components)
    subscribeToOrders,
    createOrderInDB,
    updateOrderQuoteInDB,
    updateOrderStatusInDB,
    confirmOrderPaymentInDB,
    subscribeToRates,
    updateRatesInDB,
    saveUserProfileInDB,
    saveProductToDB,
    deleteProductFromDB,
    deleteOrderFromDB,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
