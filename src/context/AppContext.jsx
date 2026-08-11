import React, { createContext, useState, useEffect } from 'react';
import { OLIVE_YOUNG_CATALOG } from '../data/catalog';
import {
  subscribeToOrders,
  createOrderInDB,
  updateOrderQuoteInDB,
  updateOrderStatusInDB,
  confirmOrderPaymentInDB,
  subscribeToRates,
  updateRatesInDB,
  saveUserProfileInDB
} from '../services/dbService';

export const AppContext = createContext();

const defaultRates = {
  USD: { code: 'USD', name: 'Đô la Mỹ', symbol: '$', rate: 25500, shippingFee: 230000 },
  KRW: { code: 'KRW', name: 'Won Hàn Quốc', symbol: '₩', rate: 19.5, shippingFee: 180000 },
  JPY: { code: 'JPY', name: 'Yên Nhật', symbol: '¥', rate: 175, shippingFee: 190000 },
  serviceFeePercent: 5,
};

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
    quote: null
  },
  {
    id: 'ORD-554190',
    customerName: 'Trần Minh Anh',
    customerPhone: '0987654321',
    customerAddress: '456 Phố Huế, Hai Bà Trưng, Hà Nội',
    country: 'KRW',
    productUrl: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495',
    productName: 'Tinh chất dưỡng da Anua Heartleaf 77% Soothing Toner',
    brand: 'Anua',
    options: 'Chai 250ml',
    qty: 1,
    foreignPrice: 28000,
    status: 'quoted',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    quote: {
      vietnamRate: 19.5,
      rawVnd: 546000,
      taxWebVnd: 54600,
      serviceFeeVnd: 27300,
      shippingWeightKg: 0.35,
      shippingWeightFeeVnd: 63000,
      totalVnd: 690900,
      depositNeededVnd: 345450,
      note: 'Hàng sale Olive Young chính hãng, thời gian bay dự kiến 7-10 ngày làm việc.'
    }
  },
  {
    id: 'ORD-988312',
    customerName: 'Hoàng Thùy Dương',
    customerPhone: '0905556677',
    customerAddress: '78 Lê Duẩn, Hải Châu, Đà Nẵng',
    country: 'JPY',
    productUrl: 'https://www.amazon.co.jp/dp/B07N91P3B5',
    productName: 'Kem chống nắng Anessa Perfect UV Skin Care Milk',
    brand: 'Anessa',
    options: 'Dạng sữa - 60ml',
    qty: 3,
    foreignPrice: 3300,
    status: 'paid',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    quote: {
      vietnamRate: 175,
      rawVnd: 1732500,
      taxWebVnd: 173250,
      serviceFeeVnd: 86625,
      shippingWeightKg: 0.6,
      shippingWeightFeeVnd: 114000,
      totalVnd: 2106375,
      depositNeededVnd: 2106375,
      note: 'Đã mua hàng thành công tại Amazon Nhật Bản.'
    },
    paymentConfirmed: true,
    paymentDate: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

const initialMockUsers = [
  { name: 'Nguyễn Thị Lan', email: 'lan@gmail.com', password: '123', phone: '0912345678', address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh' },
  { name: 'Trần Minh Anh', email: 'anh@gmail.com', password: '123', phone: '0987654321', address: '456 Phố Huế, Hai Bà Trưng, Hà Nội' }
];

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('beauty_users');
    return saved ? JSON.parse(saved) : initialMockUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('beauty_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('beauty_orders');
    return saved ? JSON.parse(saved) : initialMockOrders;
  });

  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('beauty_rates');
    return saved ? JSON.parse(saved) : defaultRates;
  });

  const [products, setProducts] = useState(() => {
    const savedCustom = localStorage.getItem('tavy_custom_products');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      // Dedupe by goodsNo (keep first occurrence)
      const seen = new Set();
      return parsed.filter(p => {
        if (!p.goodsNo || seen.has(p.goodsNo)) return false;
        seen.add(p.goodsNo);
        return true;
      });
    }
    return OLIVE_YOUNG_CATALOG;
  });

  // 🤖 AUTO SCRAPER BOT STATE & PENDING APPROVAL QUEUE
  const [botIsRunning, setBotIsRunning] = useState(() => {
    return localStorage.getItem('tavy_bot_is_running') === 'true';
  });

  const [pendingProducts, setPendingProducts] = useState(() => {
    const saved = localStorage.getItem('tavy_pending_products');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tavy_bot_is_running', botIsRunning ? 'true' : 'false');
  }, [botIsRunning]);

  useEffect(() => {
    localStorage.setItem('tavy_pending_products', JSON.stringify(pendingProducts));
  }, [pendingProducts]);

  // Periodic Auto-Scraper Bot Effect (Runs every 30 minutes when botIsRunning is TRUE)
  useEffect(() => {
    if (!botIsRunning) return;

    const runBotCycle = async () => {
      const { executeSingleBotRun } = await import('../services/autoScraperBotService');
      const res = await executeSingleBotRun(products, pendingProducts);
      if (res.success && res.product) {
        setPendingProducts(prev => {
          if (prev.some(p => p.goodsNo === res.product.goodsNo)) return prev;
          return [res.product, ...prev];
        });
      }
    };

    // Run first cycle after 5 seconds of enabling, then every 30 minutes (1,800,000 ms)
    const initialTimer = setTimeout(runBotCycle, 5000);
    const intervalTimer = setInterval(runBotCycle, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [botIsRunning, products]);

  const toggleBot = (enabled) => {
    setBotIsRunning(enabled);
  };

  const approvePendingProduct = (goodsNo) => {
    const target = pendingProducts.find(p => p.goodsNo === goodsNo);
    if (target) {
      addProduct(target);
      setPendingProducts(prev => prev.filter(p => p.goodsNo !== goodsNo));
    }
  };

  const approveSelectedPendingProducts = (goodsNoArray = []) => {
    if (!goodsNoArray || goodsNoArray.length === 0) return;
    const selectedSet = new Set(goodsNoArray);
    const targets = pendingProducts.filter(p => selectedSet.has(p.goodsNo));
    
    // Add all selected to products catalog
    setProducts(prev => {
      const existingIds = new Set(prev.map(p => p.goodsNo));
      const newItems = targets.filter(p => !existingIds.has(p.goodsNo));
      return [...newItems, ...prev];
    });

    // Remove from pending queue
    setPendingProducts(prev => prev.filter(p => !selectedSet.has(p.goodsNo)));
  };

  const approveAllPendingProducts = () => {
    pendingProducts.forEach(p => addProduct(p));
    setPendingProducts([]);
  };

  const rejectPendingProduct = (goodsNo) => {
    setPendingProducts(prev => prev.filter(p => p.goodsNo !== goodsNo));
  };

  const addProduct = (product) => {
    setProducts(prev => {
      if (prev.some(p => p.goodsNo === product.goodsNo)) {
        // Replace existing instead of duplicate
        return prev.map(p => p.goodsNo === product.goodsNo ? { ...p, ...product } : p);
      }
      return [product, ...prev];
    });
  };

  const updateProduct = (goodsNo, updates) => {
    setProducts(prev => prev.map(p => p.goodsNo === goodsNo ? { ...p, ...updates } : p));
  };

  const deleteProduct = (goodsNo) => {
    setProducts(prev => prev.filter(p => p.goodsNo !== goodsNo));
  };

  useEffect(() => {
    localStorage.setItem('beauty_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('beauty_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('beauty_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('beauty_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('beauty_rates', JSON.stringify(rates));
  }, [rates]);

  // Firestore Realtime Listeners
  useEffect(() => {
    const unsubOrders = subscribeToOrders((firestoreOrders) => {
      if (firestoreOrders && firestoreOrders.length > 0) {
        setOrders(prev => {
          const combined = [...firestoreOrders];
          prev.forEach(p => {
            if (!combined.some(c => c.id === p.id)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }
    });

    const unsubRates = subscribeToRates((dbRates) => {
      if (dbRates) {
        setRates(prev => ({ ...prev, ...dbRates }));
      }
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubRates === 'function') unsubRates();
    };
  }, []);

  const registerUser = (name, email, password) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký.' };
    }
    const newUser = { name, email, password, phone: '', address: '' };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    saveUserProfileInDB(newUser);
    return { success: true };
  };

  const loginUser = (email, password) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác.' };
    }
    setCurrentUser(found);
    return { success: true };
  };

  const loginWithGoogleAuth = async () => {
    const { loginWithGoogle } = await import('../firebase');
    const res = await loginWithGoogle();
    if (res.success) {
      setCurrentUser(res.user);
      saveUserProfileInDB(res.user);
      const existing = users.find((u) => u.email.toLowerCase() === res.user.email.toLowerCase());
      if (!existing) {
        setUsers((prev) => [...prev, res.user]);
      }
    }
    return res;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userEmail: currentUser ? currentUser.email : 'guest@beautycargo.vn',
      createdAt: new Date().toISOString(),
      status: 'pending',
      quote: null,
      ...orderData,
    };
    createOrderInDB(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateRates = (newRates) => {
    setRates(newRates);
    updateRatesInDB(newRates);
  };

  const updateOrderQuote = (orderId, quoteData) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const rateInfo = rates[order.country];
          const rawVnd = order.foreignPrice * order.qty * rateInfo.rate;
          const taxWebVnd = quoteData.taxWebPercent ? (rawVnd * quoteData.taxWebPercent) / 100 : 0;
          const serviceFeeVnd = (rawVnd * rates.serviceFeePercent) / 100;
          const shippingWeightFeeVnd = quoteData.shippingWeightKg * rateInfo.shippingFee;
          const totalVnd = Math.round(rawVnd + taxWebVnd + serviceFeeVnd + shippingWeightFeeVnd);
          const depositNeededVnd = Math.round(totalVnd * 0.5);

          const fullQuote = {
            vietnamRate: rateInfo.rate,
            rawVnd,
            taxWebVnd,
            serviceFeeVnd,
            shippingWeightKg: quoteData.shippingWeightKg,
            shippingWeightFeeVnd,
            totalVnd,
            depositNeededVnd,
            note: quoteData.note,
          };

          updateOrderQuoteInDB(orderId, fullQuote, totalVnd);

          return {
            ...order,
            status: 'quoted',
            quote: fullQuote,
          };
        }
        return order;
      })
    );
  };

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('kmart_admin_auth') === 'true';
  });

  const loginAdmin = (password) => {
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';
    if (password === adminPass) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('kmart_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, message: 'Mật khẩu quản trị không chính xác.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('kmart_admin_auth');
  };

  const updateOrderTracking = (orderId, { status, trackingCode, note }) => {
    const updates = {
      status: status || undefined,
      trackingCode: trackingCode !== undefined ? trackingCode : undefined,
      adminNote: note !== undefined ? note : undefined,
    };

    updateOrderStatusInDB(orderId, updates);

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: status || order.status,
            trackingCode: trackingCode !== undefined ? trackingCode : order.trackingCode,
            adminNote: note !== undefined ? note : order.adminNote,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      })
    );
  };

  const updateOrderStatus = (orderId, status) => {
    updateOrderStatusInDB(orderId, { status });
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const confirmPayment = (orderId, amountPaid) => {
    confirmOrderPaymentInDB(orderId, amountPaid);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'paid',
              paymentConfirmed: true,
              paymentDate: new Date().toISOString(),
              amountPaid: amountPaid
            }
          : order
      )
    );
  };

  const resetAllData = () => {
    setOrders(initialMockOrders);
    setRates(defaultRates);
    setUsers(initialMockUsers);
    setCurrentUser(null);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        rates,
        currentUser,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        registerUser,
        loginUser,
        loginWithGoogleAuth,
        logoutUser,
        createOrder,
        updateRates,
        updateOrderQuote,
        updateOrderStatus,
        updateOrderTracking,
        confirmPayment,
        resetAllData,
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        botIsRunning,
        toggleBot,
        pendingProducts,
        approvePendingProduct,
        approveSelectedPendingProducts,
        approveAllPendingProducts,
        rejectPendingProduct,
        oliveYoungCatalog: products || OLIVE_YOUNG_CATALOG,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
