import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const OLIVE_YOUNG_CATALOG = [
  {
    goodsNo: 'A000000185934',
    name: 'Tinh chất dưỡng ẩm sâu Torriden Dive-In Low Molecular Hyaluronic Acid Serum',
    brand: 'Torriden',
    category: 'skincare',
    foreignPrice: 18000,
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    options: 'Chai 50ml'
  },
  {
    goodsNo: 'A000000159495',
    name: 'Nước hoa hồng làm dịu da Anua Heartleaf 77% Soothing Toner',
    brand: 'Anua',
    category: 'skincare',
    foreignPrice: 28000,
    productImage: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=400&q=80',
    options: 'Chai 250ml'
  },
  {
    goodsNo: 'A000000146950',
    name: 'Tinh chất rau má Madagascar Centella Ampoule',
    brand: 'Skin1004',
    category: 'skincare',
    foreignPrice: 22000,
    productImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80',
    options: 'Chai 100ml'
  },
  {
    goodsNo: 'A000000128120',
    name: 'Son tint lì bóng Romand Juicy Lasting Tint',
    brand: 'Romand',
    category: 'makeup',
    foreignPrice: 9900,
    productImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',
    options: 'Màu 06 Figfig - 5.5g'
  },
  {
    goodsNo: 'A000000180234',
    name: 'Phấn nước che phủ căng bóng Clio Kill Cover Mesh Glow Cushion',
    brand: 'Clio',
    category: 'makeup',
    foreignPrice: 32000,
    productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
    options: 'Tone 03 Linen - 15g x 2'
  },
  {
    goodsNo: 'P000000001001',
    name: 'Cao Hắc Sâm Hàn Quốc Cao Cấp CheongKwanJang Everytime Extract',
    brand: 'CheongKwanJang (KGC)',
    category: 'health',
    foreignPrice: 98000,
    productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    options: 'Hộp 30 gói x 10ml'
  },
  {
    goodsNo: 'P000000001002',
    name: 'Viên Uống Collagen Thủy Phân Orthomol Beauty Hàn Quốc',
    brand: 'Orthomol',
    category: 'health',
    foreignPrice: 65000,
    productImage: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=400&q=80',
    options: 'Hộp 30 chai liquid'
  },
  {
    goodsNo: 'P000000001003',
    name: 'Nước Hồng Sâm Linh Chi KGC JungKwanJang Tonic Gold',
    brand: 'JungKwanJang',
    category: 'health',
    foreignPrice: 85000,
    productImage: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80',
    options: 'Hộp 30 gói x 50ml'
  },
  {
    goodsNo: 'P000000002001',
    name: 'Dung Dịch Xịt Mũi Trị Xoang Dị Ứng Hàn Quốc Nazal / Hanmi',
    brand: 'Hanmi Pharmacy',
    category: 'pharmacy',
    foreignPrice: 12000,
    productImage: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80',
    options: 'Chai xịt 30ml'
  },
  {
    goodsNo: 'P000000002002',
    name: 'Miếng Dán Trị Đau Nhức Xương Khớp Hồng Sâm Hàn Quốc Himena',
    brand: 'Himena Korea',
    category: 'pharmacy',
    foreignPrice: 8500,
    productImage: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80',
    options: 'Gói 20 miếng dán'
  },
  {
    goodsNo: 'P000000002003',
    name: 'Men Vi Sinh Bổ Sung Lợi Khuẩn Đường Ruột LACTO-FIT Gold Hàn Quốc',
    brand: 'Chong Kun Dang',
    category: 'pharmacy',
    foreignPrice: 19500,
    productImage: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80',
    options: 'Hộp 50 gói bột'
  }
];

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
    status: 'pending', // pending, quoted, paid, transit, completed
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
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
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    quote: {
      vietnamRate: 19.5,
      rawVnd: 546000,
      taxWebVnd: 54600, // 10% tax
      serviceFeeVnd: 27300, // 5% fee
      shippingWeightKg: 0.35,
      shippingWeightFeeVnd: 63000, // 0.35 * 180000
      totalVnd: 690900,
      depositNeededVnd: 345450, // 50% deposit
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
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    quote: {
      vietnamRate: 175,
      rawVnd: 1732500,
      taxWebVnd: 173250,
      serviceFeeVnd: 86625,
      shippingWeightKg: 0.6,
      shippingWeightFeeVnd: 114000, // 0.6 * 190000
      totalVnd: 2106375,
      depositNeededVnd: 2106375, // Paid 100%
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

  const registerUser = (name, email, password) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký.' };
    }
    const newUser = { name, email, password, phone: '', address: '' };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
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
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateRates = (newRates) => {
    setRates(newRates);
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

          return {
            ...order,
            status: 'quoted',
            quote: {
              vietnamRate: rateInfo.rate,
              rawVnd,
              taxWebVnd,
              serviceFeeVnd,
              shippingWeightKg: quoteData.shippingWeightKg,
              shippingWeightFeeVnd,
              totalVnd,
              depositNeededVnd,
              note: quoteData.note,
            },
          };
        }
        return order;
      })
    );
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const confirmPayment = (orderId, amountPaid) => {
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
        registerUser,
        loginUser,
        loginWithGoogleAuth,
        logoutUser,
        createOrder,
        updateRates,
        updateOrderQuote,
        updateOrderStatus,
        confirmPayment,
        resetAllData,
        oliveYoungCatalog: OLIVE_YOUNG_CATALOG,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
