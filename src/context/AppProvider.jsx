import React, { useState, useEffect, useCallback } from 'react';
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
  saveProductToDB,
  deleteProductFromDB,
  deleteOrderFromDB,
} from '../services/dbService';
import { auth, db, loginWithGoogle, logoutGoogle } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const defaultRates = {
  USD: { code: 'USD', name: 'Đô la Mỹ', symbol: '$', rate: 25500, shippingFee: 230000 },
  KRW: { code: 'KRW', name: 'Won Hàn Quốc', symbol: '₩', rate: 19.5, shippingFee: 180000 },
  JPY: { code: 'JPY', name: 'Yên Nhật', symbol: '¥', rate: 175, shippingFee: 190000 },
  serviceFeePercent: 5,
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
  // Additional mock orders can be added here
];

const initialMockUsers = [
  { name: 'Nguyễn Thị Lan', email: 'lan@gmail.com', phone: '0912345678', address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh' },
  { name: 'Trần Minh Anh', email: 'anh@gmail.com', phone: '0987654321', address: '456 Phố Huế, Hai Bà Trưng, Hà Nội' },
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
          const newProfile = { name: user.displayName || '', email: user.email, phone: '', addressBook: [] };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const [products, setProducts] = useState(() => {
    try {
      const savedCustom = localStorage.getItem('tavy_custom_products');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading tavy_custom_products:', e);
    }
    return OLIVE_YOUNG_CATALOG;
  });

  const [publishedProducts, setPublishedProducts] = useState(() => {
    try {
      const savedPublished = localStorage.getItem('tavy_published_products');
      if (savedPublished) {
        const parsed = JSON.parse(savedPublished);
        if (Array.isArray(parsed)) return parsed;
      }
      const savedCustom = localStorage.getItem('tavy_custom_products');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading tavy_published_products:', e);
    }
    return OLIVE_YOUNG_CATALOG;
  });

  const publishToWeb = () => {
    setPublishedProducts([...products]);
    localStorage.setItem('tavy_published_products', JSON.stringify(products));
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

  // ----- Bot & Cart State (unchanged) -----
  const [botIsRunning, setBotIsRunning] = useState(() => localStorage.getItem('tavy_bot_is_running') === 'true');
  const [pendingProducts, setPendingProducts] = useState(() => {
    const saved = localStorage.getItem('tavy_pending_products');
    return saved ? JSON.parse(saved) : [];
  });
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
    if (!authUser) return { success: false, error: new Error('Not authenticated') };
    const profileRef = doc(db, 'users', authUser.uid);
    try {
      await updateDoc(profileRef, updates);
      const snap = await getDoc(profileRef);
      setProfile(snap.data());
      return { success: true, profile: snap.data() };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
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
    products,
    setProducts,
    publishedProducts,
    oliveYoungCatalog: publishedProducts,
    publishToWeb,
    revertFromWeb,
    botIsRunning,
    setBotIsRunning,
    pendingProducts,
    setPendingProducts,
    cart,
    addToCart,
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
