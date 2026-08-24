import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Helmet } from 'react-helmet-async';
import paymentService from '../services/paymentService';
import { Trash2, Plus, Minus, CheckCircle, Globe, Zap, CreditCard, Loader2, User } from 'lucide-react';
import CascadingAddressSelector from '../components/CascadingAddressSelector';
import Footer from '../components/Footer';
import confetti from 'canvas-confetti';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, clearCart, currentUser, createOrder, rates, orders } = useContext(AppContext);
  const navigate = useNavigate();

  // Đơn hàng chờ cọc active của người dùng hiện tại
  const activePendingOrder = orders?.find(o => {
    const isUserOrder = (currentUser?.email && o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
                        (currentUser?.phone && o.customerPhone && o.customerPhone === currentUser.phone);
    const isUnpaidPending = (o.status === 'pending' || o.status === 'quoted') && o.paymentStatus !== 'paid';
    return isUserOrder && isUnpaidPending;
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;
  const formatVnd = (n) => (n || n === 0) ? `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} VNĐ` : '0 VNĐ';
  const formatKrw = (n) => new Intl.NumberFormat('ko-KR').format(n) + ' ₩';

  const subTotalKrw = cart.reduce((sum, item) => sum + (item.foreignPrice * item.qty), 0);
  const subTotalVnd = subTotalKrw * krwRate * serviceFeeMultiplier;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ Tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }
    setErrorMsg('');

    setIsSubmitting(true);
    try {
      const country = 'KRW';
      const bankInfo = country === 'KRW'
        ? { bankName: '우라은행', accountNumber: '1002959863658' }
        : { bankName: 'MBbank', accountNumber: '34966778899' };

      const orderData = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerNote: note,
        country,
        items: cart,
        paymentMethod: country === 'KRW' ? 'bank_kr' : 'bank_vn',
        bankAccount: bankInfo.accountNumber,
        bankName: bankInfo.bankName,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 phút
      };

      const res = await createOrder(orderData);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7A4B9E', '#FFD1DC', '#F4EAD3'],
      });

      // Navigate tới trang thanh toán cọc 100%
      const newOrderId = res?.id || activePendingOrder?.id || orderData.id || 'unknown';
      navigate(`/payment/${newOrderId}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      setIsSubmitting(false);
    }
  };
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const session = await paymentService.createCheckoutSession(cart);
      // Navigate to the checkout URL returned by the service
      if (session && session.url) {
        navigate(session.url);
      } else {
        console.error('Invalid checkout session:', session);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9F6FA' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', backgroundColor: '#FFF', padding: '50px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 20px auto' }} />
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '16px' }}>Đặt hàng thành công!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
              Chúng tôi đã nhận được yêu cầu mua hộ của bạn. Admin sẽ kiểm tra và gửi báo giá chi tiết trong thời gian sớm nhất!
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/')} className="btn-outline">Về trang chủ</button>
              <button onClick={() => navigate('/orders')} className="btn-primary">Xem đơn hàng của tôi</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9F6FA' }}>
      
      <Helmet>
        <title>Giỏ Hàng - TAVY Korea</title>
        <meta name="description" content="Xem và quản lý giỏ hàng của bạn trên TAVY Korea. Thanh toán nhanh chóng và an toàn." />
      </Helmet>
      {/* Navbar chung sẽ được hiển thị từ App.jsx nên không cần header đơn giản riêng ở đây */}

      <main className="container" style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--purple-dark)', margin: 0 }}>Giỏ Hàng Của Bạn</h1>
          <div style={{ backgroundColor: '#F3EFF6', border: '1px solid #E9D5FF', borderRadius: '20px', padding: '8px 18px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--purple-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(122, 75, 158, 0.08)' }}>
            <Globe size={16} /> Tỷ giá áp dụng: <strong>1 KRW = {krwRate} VNĐ</strong>
          </div>
        </div>
        
        {activePendingOrder && (
          <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '14px', padding: '14px 20px', marginBottom: '24px', color: '#92400E', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Zap size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                Bạn đang có <strong>1 Giỏ Hàng Chờ Cọc (Mã: {activePendingOrder.id})</strong>. Mọi sản phẩm bạn thêm/xóa sẽ tự động cập nhật giỏ hàng này. Giỏ hàng sẽ chính thức chuyển thành Đơn hàng hoàn chỉnh sau khi bạn cọc 100%!
              </div>
            </div>
            <button
              onClick={() => navigate(`/payment/${activePendingOrder.id}`)}
              style={{ backgroundColor: '#D97706', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CreditCard size={14} /> Thanh toán cọc ngay
            </button>
          </div>
        )}

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#FFF', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '20px' }}>Giỏ hàng đang trống.</p>
            <Link to="/" className="btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div className="cart-layout">
            
            {/* Cột trái: Danh sách item */}
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: idx < cart.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <img src={item.productImage} alt={item.name} loading="lazy" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, aspectRatio: '1/1' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>{item.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.options}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.goodsNo)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                          <button type="button" onClick={() => updateCartQty(item.goodsNo, item.qty - 1)} style={{ padding: '6px 10px', background: '#f9f9f9', border: 'none', cursor: 'pointer' }}><Minus size={14}/></button>
                          <span style={{ padding: '6px 16px', fontSize: '0.9rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{item.qty}</span>
                          <button type="button" onClick={() => updateCartQty(item.goodsNo, item.qty + 1)} style={{ padding: '6px 10px', background: '#f9f9f9', border: 'none', cursor: 'pointer' }}><Plus size={14}/></button>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: 'var(--purple-primary)', fontSize: '1.05rem' }}>
                            {formatKrw(item.foreignPrice * item.qty)}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                            ~ {formatVnd(Math.round(item.foreignPrice * item.qty * krwRate * serviceFeeMultiplier))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Banner Thông Báo Giải Thích Giá Nằm Dưới Danh Sách Sản Phẩm */}
                <div style={{
                  marginTop: '20px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  fontSize: '0.88rem',
                  color: '#581C87',
                  lineHeight: '1.55',
                  boxShadow: '0 2px 8px rgba(122, 75, 158, 0.05)'
                }}>
                  <div style={{ fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem' }}>
                    <span>💡</span> <strong>Thông tin giá & Vận chuyển:</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>• <strong>Giá tại Hàn (Won ₩):</strong> Giá gốc niêm yết tại Store Olive Young / Hàn Quốc.</div>
                    <div>• <strong>Giá VNĐ về tay:</strong> Đã bao gồm tiền hàng gốc, tỷ giá niêm yết và phí dịch vụ mua hộ trọn gói.</div>
                    <div>• <strong>Vận chuyển bay:</strong> Cước cân nặng vận chuyển bay thực tế sẽ thanh toán khi hàng về đến kho Việt Nam.</div>
                  </div>
                </div>
              </div>

            {/* Cột phải: Form Đặt Hàng */}
            <div style={{ backgroundColor: '#FFF', padding: '30px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>Thông tin người nhận</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input type="text" required className="input" placeholder="Nhập họ và tên người nhận..." value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    placeholder="Nhập số điện thoại (10 số)..."
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tỉnh/Thành, Quận/Huyện, Phường/Xã</label>
                  <CascadingAddressSelector 
                    initialAddress={currentUser?.address || ''}
                    onChange={(addrInfo) => setAddress(addrInfo.fullAddress)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (Không bắt buộc)</label>
                  <textarea className="input" placeholder="Ví dụ: Giao hàng trong giờ hành chính..." value={note} onChange={e => setNote(e.target.value)} />
                </div>

                <div style={{ backgroundColor: '#F3EFF6', padding: '16px 18px', borderRadius: '14px', marginTop: '24px', marginBottom: '24px', border: '1px solid #E9D5FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>1. Tổng giá gốc tại Hàn (Won):</span>
                    <strong style={{ fontSize: '1.05rem', color: '#374151' }}>{formatKrw(subTotalKrw)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px dashed #D8B4FE' }}>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.92rem' }}>2. Tổng tiền về tay (VNĐ):</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--purple-primary)' }}>{formatVnd(subTotalVnd)}</strong>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '10px', lineHeight: '1.45', margin: '10px 0 0 0' }}>
                    * <em>Giá VNĐ đã bao gồm tỷ giá niêm yết và phí dịch vụ mua hộ trọn gói. Cước cân nặng vận chuyển bay thực tế thanh toán khi hàng về đến kho Việt Nam.</em>
                  </p>
                </div>

                {errorMsg && (
                  <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '14px',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="lucide-spin" size={20} />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác Nhận Đặt Hàng & Thanh Toán'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
