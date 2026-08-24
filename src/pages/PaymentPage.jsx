import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';
import { Clock, Upload, CheckCircle, AlertTriangle, Copy, CreditCard, RefreshCw } from 'lucide-react';
import Footer from '../components/Footer';

const BANK_ACCOUNTS = {
  VN: {
    bankName: 'MBbank',
    accountNumber: '34966778899',
    accountHolder: 'VU VAN TAN',
    currency: 'VND',
    flag: 'vn', // Will render an icon instead
  },
  KR: {
    bankName: '우라은행 (Woori Bank)',
    accountNumber: '1002959863658',
    accountHolder: 'VU VAN TAN',
    currency: 'KRW',
    flag: 'kr', // Will render an icon instead
  },
};

const PAYMENT_DEADLINE_MS = 15 * 60 * 1000; // 15 phút

function getVndQRUrl(amount, _orderId) {
  return `https://img.vietqr.io/image/MBBANK-34966778899-compact2.png?amount=${amount || 0}&accountName=VU%20VAN%20TAN`;
}

function getKrwQRUrl(orderId) {
  // Chỉ mã hóa thuần số tài khoản 1002959863658 để các ứng dụng ngân hàng Hàn Quốc (Toss, Woori WON, KakaoPay) quét trực tiếp số tài khoản
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=1002959863658`;
}

function formatTime(ms) {
  if (ms <= 0) return '00:00';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser, rates } = useContext(AppContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_DEADLINE_MS);
  const [copied, setCopied] = useState('');

  // Realtime listener cho order
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setErrorNotFound(true);
      return;
    }
    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      setLoading(false);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setOrder(data);
        setErrorNotFound(false);
      } else {
        setErrorNotFound(true);
      }
    }, (err) => {
      console.warn('Lỗi đọc đơn hàng:', err);
      setLoading(false);
      setErrorNotFound(true);
    });
    return unsub;
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (!order?.paymentDue) return;
    const deadline = new Date(order.paymentDue).getTime();

    const tick = () => {
      const remaining = deadline - Date.now();
      setTimeLeft(Math.max(0, remaining));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.paymentDue]);

  // Khi hết 15 phút -> Chuyển về trạng thái 'pending' (Chờ cọc)
  useEffect(() => {
    if (timeLeft <= 0 && order && order.paymentStatus === 'unpaid' && order.status !== 'pending') {
      updateDoc(doc(db, 'orders', orderId), {
        status: 'pending',
        updatedAt: serverTimestamp(),
      }).catch(console.warn);
    }
  }, [timeLeft, order, orderId]);

  const copyToClipboard = useCallback((text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  }, []);

  const handleRenewPayment = async () => {
    if (!orderId) return;
    try {
      const newDue = new Date(Date.now() + PAYMENT_DEADLINE_MS).toISOString();
      await updateDoc(doc(db, 'orders', orderId), {
        paymentDue: newDue,
        status: 'pending',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Renew payment error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F6FA' }}>
        <p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (errorNotFound || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9F6FA' }}>
        <Helmet><title>Không tìm thấy đơn hàng - TAVY Korea</title></Helmet>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '24px', maxWidth: '450px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#1a1a2e', marginBottom: '12px' }}>Không tìm thấy đơn hàng</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>Mã đơn hàng <strong>{orderId}</strong> không tồn tại hoặc đã bị hủy.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/')} className="btn-outline">Về trang chủ</button>
              <button onClick={() => navigate('/orders')} className="btn-primary">Danh sách đơn</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Đã thanh toán
  if (order.paymentStatus === 'paid') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9F6FA' }}>
        <Helmet><title>Thanh toán thành công - TAVY Korea</title></Helmet>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', background: '#fff', padding: '50px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '12px' }}>Thanh toán thành công!</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Đơn hàng <strong>{orderId}</strong> đã được xác nhận thanh toán.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/')} className="btn-outline">Về trang chủ</button>
              <button onClick={() => navigate('/orders')} className="btn-primary">Xem đơn hàng</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const bankVn = BANK_ACCOUNTS.VN;
  const bankKr = BANK_ACCOUNTS.KR;
  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;
  
  const transferVnd = order.quote?.totalVnd || order.totalVnd || (Array.isArray(order.items) && order.items.length > 0
    ? order.items.reduce((sum, i) => sum + (i.price || Math.round((i.foreignPrice || 0) * krwRate * serviceFeeMultiplier)) * (i.qty || 1), 0)
    : Math.round((order.foreignPrice || 0) * krwRate * serviceFeeMultiplier * (order.qty || 1)));

  const transferKrw = (Array.isArray(order.items) && order.items.length > 0)
    ? order.items.reduce((sum, i) => sum + (i.foreignPrice || 0) * (i.qty || 1), 0)
    : (order.foreignPrice || (order.quote?.totalVnd ? Math.round(order.quote.totalVnd / krwRate) : 0));

  const qrVnUrl = getVndQRUrl(transferVnd, orderId);
  const qrKrUrl = getKrwQRUrl(orderId);
  const isExpired = timeLeft <= 0 || order.status === 'cancelled';
  const isUrgent = timeLeft > 0 && timeLeft < 3 * 60 * 1000 && order.status !== 'cancelled';

  const s = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9F6FA' },
    main: { flex: 1, padding: '40px 24px', maxWidth: '980px', margin: '0 auto', width: '100%' },
    card: { background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
    timer: {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '1.4rem',
      background: isExpired ? '#FEE2E2' : isUrgent ? '#FEF3C7' : '#ECFDF5',
      color: isExpired ? '#DC2626' : isUrgent ? '#D97706' : '#059669',
    },
    bankRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    bankLabel: { color: '#6b7280', fontSize: '0.9rem' },
    bankValue: { fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' },
    copyBtn: {
      background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px',
      cursor: 'pointer', color: '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px',
    },
    qrWrap: { textAlign: 'center', padding: '16px', background: '#FAFAFA', borderRadius: '16px', margin: '16px 0', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  };

  return (
    <div style={s.page}>
      <Helmet><title>Thanh toán đơn {orderId} - TAVY Korea</title></Helmet>

      <div style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <CreditCard size={28} color="var(--purple-primary)" />
          <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: '#1a1a2e', margin: 0 }}>Thanh toán đơn hàng</h1>
        </div>

        {/* Timer & Renew Button */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={s.timer}>
            <Clock size={20} />
            {isExpired ? 'Đơn hàng đã bị hủy do quá hạn 15 phút!' : formatTime(timeLeft)}
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '8px' }}>
            {isExpired ? 'Đơn hàng đã tự động hủy. Vui lòng tạo đơn hàng mới nếu bạn vẫn muốn mua sản phẩm.' : 'Vui lòng chuyển khoản trong thời gian trên'}
          </p>
        </div>

        {/* Thông báo giải thích rõ ràng về giá & thanh toán 1 lần */}
        <div style={{
          backgroundColor: '#FAF5FF',
          border: '1px solid #E9D5FF',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '24px',
          fontSize: '0.86rem',
          color: '#581C87',
          lineHeight: '1.55',
          boxShadow: '0 2px 8px rgba(122, 75, 158, 0.05)'
        }}>
          <div style={{ fontWeight: 800, marginBottom: '6px', fontSize: '0.9rem' }}>
            Thông tin thanh toán & Giá về tay:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div>• <strong>Giá tại Hàn (Won ₩):</strong> Là giá gốc niêm yết khi mua trực tiếp tại Store Olive Young / Hàn Quốc.</div>
            <div>• <strong>Giá VNĐ về tay:</strong> Đã bao gồm tiền hàng gốc, tỷ giá và phí dịch vụ mua hộ trọn gói (toàn bộ tiền vận chuyển 2 đầu đã nằm tất cả trong phí dịch vụ, quý khách chỉ thanh toán 1 lần duy nhất).</div>
          </div>
        </div>

        {/* HAI BẢNG CHUYỂN KHOẢN NẰM NGANG NHAU (SIDE-BY-SIDE GRID) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* 1. BẢNG CHUYỂN KHOẢN VND */}
          <div style={s.card}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: '#E11D48', color: 'white', fontSize: '10px', fontWeight: 'bold'
                }}>VN</span>
                Chuyển khoản VND
              </h3>

              <div style={s.qrWrap}>
                <img src={qrVnUrl} alt="VietQR Chuyển khoản VND" width={200} height={200} style={{ borderRadius: '12px', objectFit: 'contain' }} />
                <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '8px', fontWeight: 600 }}>Quét mã QR để chuyển khoản VND tự động</p>
              </div>
            </div>

            <div>
              <div style={s.bankRow}>
                <span style={s.bankLabel}>Số tiền cần chuyển</span>
                <span style={{ ...s.bankValue, color: '#2563EB', fontSize: '1.05rem', fontWeight: 800 }}>
                  {transferVnd.toLocaleString()} đ
                  <button style={{ ...s.copyBtn, background: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE', fontWeight: 700 }} onClick={() => copyToClipboard(transferVnd.toString(), 'amount_vn')}>
                    <Copy size={12} /> {copied === 'amount_vn' ? 'Đã copy!' : 'Copy tiền'}
                  </button>
                </span>
              </div>
              <div style={s.bankRow}>
                <span style={s.bankLabel}>Ngân hàng</span>
                <span style={s.bankValue}>{bankVn.bankName}</span>
              </div>
              <div style={s.bankRow}>
                <span style={s.bankLabel}>Số tài khoản</span>
                <span style={s.bankValue}>
                  {bankVn.accountNumber}
                  <button style={s.copyBtn} onClick={() => copyToClipboard(bankVn.accountNumber, 'stk_vn')}>
                    <Copy size={12} /> {copied === 'stk_vn' ? 'Đã copy!' : 'Copy'}
                  </button>
                </span>
              </div>
              <div style={{ ...s.bankRow, borderBottom: 'none' }}>
                <span style={s.bankLabel}>Chủ tài khoản</span>
                <span style={s.bankValue}>{bankVn.accountHolder}</span>
              </div>
            </div>
          </div>

          {/* 2. BẢNG CHUYỂN KHOẢN KRW */}
          <div style={s.card}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: '#2563EB', color: 'white', fontSize: '10px', fontWeight: 'bold'
                }}>KR</span>
                Hoặc chuyển khoản KRW
              </h3>

              <div style={s.qrWrap}>
                <img src={qrKrUrl} alt="QR Code Woori Bank KRW" width={200} height={200} style={{ borderRadius: '12px' }} />
              </div>
            </div>

            <div>
              {transferKrw > 0 && (
                <div style={s.bankRow}>
                  <span style={s.bankLabel}>Số tiền cần chuyển</span>
                  <span style={{ ...s.bankValue, color: '#059669', fontSize: '1.05rem', fontWeight: 800 }}>
                    ₩{transferKrw.toLocaleString()}
                    <button style={{ ...s.copyBtn, background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0', fontWeight: 700 }} onClick={() => copyToClipboard(transferKrw.toString(), 'amount_kr')}>
                      <Copy size={12} /> {copied === 'amount_kr' ? 'Đã copy!' : 'Copy tiền'}
                    </button>
                  </span>
                </div>
              )}
              <div style={s.bankRow}>
                <span style={s.bankLabel}>Ngân hàng</span>
                <span style={s.bankValue}>{bankKr.bankName}</span>
              </div>
              <div style={s.bankRow}>
                <span style={s.bankLabel}>Số tài khoản</span>
                <span style={s.bankValue}>
                  {bankKr.accountNumber}
                  <button style={s.copyBtn} onClick={() => copyToClipboard(bankKr.accountNumber, 'stk_kr')}>
                    <Copy size={12} /> {copied === 'stk_kr' ? 'Đã copy!' : 'Copy'}
                  </button>
                </span>
              </div>
              <div style={{ ...s.bankRow, borderBottom: 'none' }}>
                <span style={s.bankLabel}>Chủ tài khoản</span>
                <span style={s.bankValue}>{bankKr.accountHolder}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Nút quay lại */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/orders" style={{ color: 'var(--purple-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
