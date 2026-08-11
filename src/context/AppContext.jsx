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
    goodsNo: 'A000000192301',
    name: 'Bảng phấn mắt 16 ô Wakemake Soft Blurring Eye Palette',
    brand: 'Wakemake',
    category: 'makeup',
    foreignPrice: 34000,
    productImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80',
    options: 'Màu 02 Lively Blurring'
  },
  {
    goodsNo: 'A000000168341',
    name: 'Kem ủ dưỡng tóc hư tổn nặng Unove Deep Damage Treatment EX',
    brand: 'Unove',
    category: 'haircare',
    foreignPrice: 25000,
    productImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80',
    options: 'Tuýp lớn 320ml'
  },
  {
    goodsNo: 'A000000140231',
    name: 'Dầu dưỡng tóc phục hồi Mise En Scene Perfect Serum Original',
    brand: 'Mise En Scene',
    category: 'haircare',
    foreignPrice: 15000,
    productImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80',
    options: 'Chai 80ml'
  },
  {
    goodsNo: 'A000000139102',
    name: 'Xịt dưỡng tóc chắc khỏe Aromatica Rosemary Root Enhancer',
    brand: 'Aromatica',
    category: 'haircare',
    foreignPrice: 16000,
    productImage: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
    options: 'Chai xịt 100ml'
  },
  {
    goodsNo: 'A000000120231',
    name: 'Kem dưỡng ẩm dịu lành Illiyoon Ceramide Ato Concentrate Cream',
    brand: 'Illiyoon',
    category: 'bodycare',
    foreignPrice: 20000,
    productImage: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=400&q=80',
    options: 'Tuýp 200ml'
  },
  {
    goodsNo: 'A000000148102',
    name: 'Sữa tắm hương nước hoa Kundal Pure Natural Body Wash',
    brand: 'Kundal',
    category: 'bodycare',
    foreignPrice: 13000,
    productImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    options: 'Hương Baby Powder - 500ml'
  },
  {
    goodsNo: 'A000000109230',
    name: 'Kem dưỡng da tay cổ điển Kamill Hand & Nail Cream Classic',
    brand: 'Kamill',
    category: 'bodycare',
    foreignPrice: 6900,
    productImage: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80',
    options: 'Tuýp 100ml'
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
