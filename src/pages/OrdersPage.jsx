import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  Package, Clock, CheckCircle2, Truck, ArrowLeft, ShoppingBag, 
  Copy, Check, MapPin, Phone, User, Calendar
} from 'lucide-react';

export default function OrdersPage() {
  const { currentUser, orders, rates } = useContext(AppContext);
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState('');

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
        <Package size={54} style={{ color: 'var(--purple-primary)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Bạn cần đăng nhập tài khoản để theo dõi lịch sử và tiến trình vận chuyển đơn hàng của mình.
        </p>
        <button className="btn-gold" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Lọc danh sách đơn của người dùng
  const userOrders = orders.filter(
    (o) =>
      (o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (o.customerPhone && currentUser.phone && o.customerPhone === currentUser.phone)
  );

  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Các bước trong Tiến trình 5 bước
  const steps = [
    { key: 'pending', title: 'Chờ cọc' },
    { key: 'quoted', title: 'Đã nhận cọc' },
    { key: 'purchased', title: 'Đã mua tại Hàn' },
    { key: 'transit', title: 'Đang về VN' },
    { key: 'completed', title: 'Đã giao thành công' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'quoted': return 1;
      case 'purchased': return 2;
      case 'transit': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--purple-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'var(--font-serif)' }}>Theo Dõi Đơn Hàng Của Tôi</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Tài khoản: <strong>{currentUser.name || currentUser.email}</strong>
          </p>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', border: '1px dashed #D1D5DB', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: 'var(--purple-primary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>Bạn chưa có đơn hàng nào</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Hãy chọn mua các sản phẩm Mỹ phẩm & Thực phẩm chức năng Hàn Quốc chất lượng!</p>
          <button className="btn-gold" onClick={() => navigate('/')}>
            Khám phá sản phẩm ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {userOrders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);
            const krwRate = rates?.KRW?.rate || 19.5;
            const estimatedVnd = Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1));
            const displayTotal = order.quote ? order.quote.totalVnd : estimatedVnd;

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                {/* Order Top Bar */}
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>MÃ ĐƠN HÀNG</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--purple-primary)' }}>{order.id}</h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ngày đặt:</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', paddingLeft: '15px', borderLeft: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Tổng thanh toán:</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {formatVnd(displayTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar 5 Bước */}
                <div style={{ padding: '30px 24px', backgroundColor: '#FDFBFF', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    
                    {/* Line nối */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '8%',
                      right: '8%',
                      height: '3px',
                      backgroundColor: '#E5E7EB',
                      zIndex: 1
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: 'var(--purple-primary)',
                        width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                        transition: 'width 0.4s ease'
                      }}></div>
                    </div>

                    {/* Step Circles */}
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={st.key} style={{ zIndex: 2, textAlign: 'center', flex: 1 }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--purple-primary)' : '#FFF',
                            color: isCompleted ? '#FFF' : '#9CA3AF',
                            border: isCompleted ? '2px solid var(--purple-primary)' : '2px solid #E5E7EB',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            marginBottom: '8px',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(122, 75, 158, 0.2)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {isCompleted ? <Check size={18} /> : idx + 1}
                          </div>
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCompleted ? 'var(--purple-primary)' : '#6B7280'
                          }}>
                            {st.title}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Tracking Code Bar & Info */}
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Chi tiết sản phẩm */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {order.productImage && (
                      <img src={order.productImage} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px' }} />
                    )}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                        {order.productName}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Thương hiệu: {order.brand} | Quy cách: {order.options} | Số lượng: x{order.qty}
                      </p>
                      {order.adminNote && (
                        <p style={{ fontSize: '0.8rem', color: '#D97706', marginTop: '6px', backgroundColor: '#FEF3C7', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                          💬 Ghi chú từ Admin: {order.adminNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mã Vận Đơn Air */}
                  <div style={{ backgroundColor: '#F9FAFB', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block' }}>MÃ VẬN ĐƠN (AIR HÀN - VIỆT)</span>
                      <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: 'var(--purple-primary)' }}>
                        {order.trackingCode || 'Đang cập nhật...'}
                      </strong>
                    </div>

                    {order.trackingCode && (
                      <button
                        onClick={() => handleCopyCode(order.trackingCode)}
                        style={{
                          backgroundColor: copiedCode === order.trackingCode ? '#10B981' : 'var(--purple-primary)',
                          color: '#FFF',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedCode === order.trackingCode ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedCode === order.trackingCode ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
