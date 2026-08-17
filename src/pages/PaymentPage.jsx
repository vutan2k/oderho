import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';
import { Clock, Upload, CheckCircle, AlertTriangle, Copy, CreditCard } from 'lucide-react';
import Footer from '../components/Footer';

const BANK_ACCOUNTS = {
  VN: {
    bankName: 'MBbank',
    accountNumber: '34966778899',
    accountHolder: 'VU VAN TAN',
    currency: 'VND',
    flag: '🇻🇳',
  },
  KR: {
    bankName: '우라은행',
    accountNumber: '1002959863658',
    accountHolder: 'VU VAN TAN',
    currency: 'KRW',
    flag: '🇰🇷',
  },
};

const PAYMENT_DEADLINE_MS = 15 * 60 * 1000; // 15 phút

function getQRUrl(bankInfo, amount, orderId) {
  const content = `${bankInfo.bankName} ${bankInfo.accountNumber} ${bankInfo.accountHolder} ${orderId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(content)}`;
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
  const { currentUser } = useContext(AppContext);

  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_DEADLINE_MS);
  const [copied, setCopied] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  // Realtime listener cho order
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setOrder(data);
      }
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

  // Auto-hold khi hết giờ
  useEffect(() => {
    if (timeLeft <= 0 && order && order.paymentStatus === 'unpaid' && order.status !== 'on_hold') {
      updateDoc(doc(db, 'orders', orderId), {
        status: 'on_hold',
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

  const handleUploadProof = async () => {
    if (!proofFile || !orderId) return;
    setUploading(true);
    try {
      // Lưu file dạng base64 vào Firestore (đơn giản, không cần Storage)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        await updateDoc(doc(db, 'orders', orderId), {
          paymentProofUrl: base64,
          paymentProofName: proofFile.name,
          updatedAt: serverTimestamp(),
        });
        setUploadDone(true);
        setUploading(false);
      };
      reader.readAsDataURL(proofFile);
    } catch (err) {
      console.warn('Upload proof error:', err);
      setUploading(false);
    }
  };

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F6FA' }}>
        <p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin đơn hàng...</p>
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

  // Đã bị hold
  if (order.status === 'on_hold') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9F6FA' }}>
        <Helmet><title>Đơn hàng tạm dừng - TAVY Korea</title></Helmet>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', background: '#fff', padding: '50px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: '480px' }}>
            <AlertTriangle size={64} color="#F59E0B" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '12px' }}>Đơn hàng tạm dừng</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Đơn <strong>{orderId}</strong> đã quá thời hạn thanh toán 15 phút. Vui lòng liên hệ admin để được hỗ trợ.
            </p>
            <button onClick={() => navigate('/orders')} className="btn-primary">Xem đơn hàng</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Xác định bank theo country
  const country = order.country === 'KRW' ? 'KR' : 'VN';
  const bankInfo = BANK_ACCOUNTS[country];
  const otherBank = BANK_ACCOUNTS[country === 'VN' ? 'KR' : 'VN'];
  const qrUrl = getQRUrl(bankInfo, order.totalVnd || 0, orderId);
  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft > 0 && timeLeft < 3 * 60 * 1000; // dưới 3 phút

  const s = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9F6FA' },
    main: { flex: 1, padding: '40px 24px', maxWidth: '720px', margin: '0 auto', width: '100%' },
    card: { background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '24px' },
    header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
    timer: {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '1.4rem',
      background: isExpired ? '#FEE2E2' : isUrgent ? '#FEF3C7' : '#ECFDF5',
      color: isExpired ? '#DC2626' : isUrgent ? '#D97706' : '#059669',
    },
    bankRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    bankLabel: { color: '#6b7280', fontSize: '0.9rem' },
    bankValue: { fontWeight: 700, color: '#1a1a2e', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' },
    copyBtn: {
      background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px',
      cursor: 'pointer', color: '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px',
    },
    qrWrap: { textAlign: 'center', padding: '20px', background: '#FAFAFA', borderRadius: '16px', margin: '20px 0' },
    uploadArea: {
      border: '2px dashed #d1d5db', borderRadius: '12px', padding: '24px', textAlign: 'center',
      cursor: 'pointer', transition: 'border-color 0.2s',
    },
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

        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={s.timer}>
            <Clock size={20} />
            {isExpired ? 'Hết thời hạn!' : formatTime(timeLeft)}
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '8px' }}>
            {isExpired ? 'Vui lòng liên hệ admin.' : 'Vui lòng chuyển khoản trong thời gian trên'}
          </p>
        </div>

        {/* Thông tin chuyển khoản chính */}
        <div style={s.card}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {bankInfo.flag} Chuyển khoản {bankInfo.currency}
          </h3>

          <div style={s.qrWrap}>
            <img src={qrUrl} alt="QR Code thanh toán" width={220} height={220} style={{ borderRadius: '12px' }} />
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '8px' }}>Quét mã QR để chuyển khoản</p>
          </div>

          <div style={s.bankRow}>
            <span style={s.bankLabel}>Ngân hàng</span>
            <span style={s.bankValue}>{bankInfo.bankName}</span>
          </div>
          <div style={s.bankRow}>
            <span style={s.bankLabel}>Số tài khoản</span>
            <span style={s.bankValue}>
              {bankInfo.accountNumber}
              <button style={s.copyBtn} onClick={() => copyToClipboard(bankInfo.accountNumber, 'stk')}>
                <Copy size={12} /> {copied === 'stk' ? 'Đã copy!' : 'Copy'}
              </button>
            </span>
          </div>
          <div style={s.bankRow}>
            <span style={s.bankLabel}>Chủ tài khoản</span>
            <span style={s.bankValue}>{bankInfo.accountHolder}</span>
          </div>
          <div style={{ ...s.bankRow, borderBottom: 'none' }}>
            <span style={s.bankLabel}>Nội dung CK</span>
            <span style={s.bankValue}>
              {orderId}
              <button style={s.copyBtn} onClick={() => copyToClipboard(orderId, 'nd')}>
                <Copy size={12} /> {copied === 'nd' ? 'Đã copy!' : 'Copy'}
              </button>
            </span>
          </div>
        </div>

        {/* Tài khoản phụ */}
        <div style={{ ...s.card, background: '#FAFAFA' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {otherBank.flag} Hoặc chuyển khoản {otherBank.currency}
          </h4>
          <div style={s.bankRow}>
            <span style={s.bankLabel}>Ngân hàng</span>
            <span style={s.bankValue}>{otherBank.bankName}</span>
          </div>
          <div style={s.bankRow}>
            <span style={s.bankLabel}>Số tài khoản</span>
            <span style={s.bankValue}>
              {otherBank.accountNumber}
              <button style={s.copyBtn} onClick={() => copyToClipboard(otherBank.accountNumber, 'stk2')}>
                <Copy size={12} /> {copied === 'stk2' ? 'Đã copy!' : 'Copy'}
              </button>
            </span>
          </div>
          <div style={{ ...s.bankRow, borderBottom: 'none' }}>
            <span style={s.bankLabel}>Chủ tài khoản</span>
            <span style={s.bankValue}>{otherBank.accountHolder}</span>
          </div>
        </div>

        {/* Upload bằng chứng */}
        <div style={s.card}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} /> Tải lên bằng chứng chuyển khoản
          </h3>

          {uploadDone || order.paymentProofUrl ? (
            <div style={{ textAlign: 'center', padding: '20px', background: '#ECFDF5', borderRadius: '12px' }}>
              <CheckCircle size={32} color="#10B981" style={{ marginBottom: '8px' }} />
              <p style={{ color: '#059669', fontWeight: 600 }}>Đã tải lên bằng chứng!</p>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Admin sẽ xác nhận sớm nhất.</p>
            </div>
          ) : (
            <>
              <div
                style={s.uploadArea}
                onClick={() => document.getElementById('proof-input').click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#7C3AED'; }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#d1d5db'; setProofFile(e.dataTransfer.files[0]); }}
              >
                <Upload size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#6b7280', marginBottom: '4px' }}>Kéo thả hoặc nhấn để chọn ảnh</p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>PNG, JPG, PDF (tối đa 5MB)</p>
                <input
                  id="proof-input"
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => setProofFile(e.target.files[0])}
                />
              </div>
              {proofFile && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#374151', fontSize: '0.9rem' }}>📎 {proofFile.name}</span>
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    onClick={handleUploadProof}
                    disabled={uploading}
                  >
                    {uploading ? 'Đang tải...' : 'Gửi bằng chứng'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Nút quay lại */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/orders" style={{ color: 'var(--purple-primary)', fontWeight: 600, textDecoration: 'none' }}>
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
