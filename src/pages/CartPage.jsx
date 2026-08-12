import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Helmet } from 'react-helmet-async';
import paymentService from '../services/paymentService';
import { Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import CascadingAddressSelector from '../components/CascadingAddressSelector';
import Footer from '../components/Footer';
import confetti from 'canvas-confetti';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, clearCart, currentUser, createOrder, rates } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const formatKrw = (n) => new Intl.NumberFormat('ko-KR').format(n) + ' ₩';

  const subTotalKrw = cart.reduce((sum, item) => sum + (item.foreignPrice * item.qty), 0);
  const subTotalVnd = subTotalKrw * krwRate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerNote: note,
      country: 'KRW',
      items: cart, // Lưu toàn bộ giỏ hàng
    };

    createOrder(orderData);
    clearCart();
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7A4B9E', '#FFD1DC', '#F4EAD3'],
    });

    setSuccess(true);
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
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--purple-dark)', marginBottom: '30px' }}>Giỏ Hàng Của Bạn</h1>
        
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#FFF', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '20px' }}>Giỏ hàng đang trống.</p>
            <Link to="/" className="btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }} className="hero-grid">
            
            {/* Cột trái: Danh sách item */}
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: idx < cart.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <img src={item.productImage} alt={item.name} loading="lazy" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
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
                        <div style={{ fontWeight: 700, color: 'var(--purple-primary)' }}>{formatKrw(item.foreignPrice * item.qty)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cột phải: Form Đặt Hàng */}
            <div style={{ backgroundColor: '#FFF', padding: '30px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>Thông tin người nhận</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input type="text" required className="input" placeholder="Ví dụ: Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="tel" required className="input" placeholder="Ví dụ: 0912345678" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tỉnh/Thành, Quận/Huyện, Phường/Xã</label>
                  <CascadingAddressSelector 
                    initialAddress={currentUser?.address || address}
                    onChange={(addrInfo) => setAddress(addrInfo.fullAddress)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (Không bắt buộc)</label>
                  <textarea className="input" placeholder="Ví dụ: Giao hàng trong giờ hành chính..." value={note} onChange={e => setNote(e.target.value)} />
                </div>

                <div style={{ backgroundColor: '#F3EFF6', padding: '16px', borderRadius: '12px', marginTop: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tổng tạm tính (Hàn):</span>
                    <strong style={{ fontSize: '1.1rem' }}>{formatKrw(subTotalKrw)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tạm tính (VNĐ):</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--purple-dark)' }}>~ {formatVnd(subTotalVnd)}</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px', fontStyle: 'italic' }}>
                    * Giá chưa bao gồm Thuế, Công Mua và Phí Vận Chuyển Cân Nặng. Admin sẽ báo giá chi tiết sau.
                  </p>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                  Gửi Yêu Cầu Đặt Hộ
                </button>
                <button type="button" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '12px' }} onClick={handleCheckout}>
                  Thanh toán
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
