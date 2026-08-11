import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { CheckCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import CascadingAddressSelector from './CascadingAddressSelector';

export default function OrderDrawer({ product, onClose }) {
  const { currentUser, createOrder, rates } = useContext(AppContext);
  const isOpen = !!product;

  const [qty, setQty] = useState(1);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when a new product is selected
  useEffect(() => {
    if (product) {
      setQty(1);
      setNote('');
      setSuccess(false);
    }
  }, [product]);

  // Sync user info
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const krwRate = rates?.KRW?.rate || 19.5;

  const formatVnd = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);



  const handleSubmit = (e) => {
    e.preventDefault();

    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      country: 'KRW',
      productUrl: `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${product.goodsNo}`,
      productName: product.name,
      brand: product.brand,
      options: product.options,
      qty: parseInt(qty),
      foreignPrice: product.foreignPrice,
      productImage: product.productImage,
      customerNote: note,
    };

    createOrder(orderData);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#B76E79', '#FFD1DC', '#1a1a1a'],
    });

    setSuccess(true);
  };

  const handleClose = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>

        {/* Drawer Header */}
        <div className="drawer-header">
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)' }}>
            GỬI YÊU CẦU MUA HÀNG HỘ
          </h3>
          <button onClick={handleClose} className="drawer-close-btn">
            <X size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {success ? (
            /* Success state */
            <div style={{ textAlign: 'center', paddingTop: '20px' }}>
              <div style={{
                width: 64, height: 64,
                background: '#D1FAE5',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle size={36} color="#059669" />
              </div>
              <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: '1.3rem', color: '#111827' }}>GỬI YÊU CẦU MUA HỘ THÀNH CÔNG!</h3>
              <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, marginBottom: 20 }}>
                Hệ thống đã tự động ghi nhận đơn hàng. Bạn có thể chuyển khoản cọc 50% trước để TAVY KOREA tiến hành mua hàng tại Hàn Quốc ngay lập tức.
              </p>

              {/* Thông tin Chuyển Khoản Ngân Hàng */}
              <div style={{ backgroundColor: '#FDFBFF', border: '1.5px solid var(--purple-primary)', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--purple-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🇻🇳 CHUYỂN KHOẢN VIỆT NAM (VIETQR)
                </span>
                <p style={{ fontSize: '0.85rem', margin: '6px 0 2px 0' }}><strong>Ngân hàng:</strong> MB Bank (NHTM CP Quân Đội)</p>
                <p style={{ fontSize: '0.85rem', margin: '2px 0' }}><strong>Số tài khoản:</strong> <span style={{ color: 'var(--purple-primary)', fontWeight: 800 }}>0988 888 888</span></p>
                <p style={{ fontSize: '0.85rem', margin: '2px 0' }}><strong>Chủ tài khoản:</strong> TAVY KOREA</p>
              </div>

              <div style={{ backgroundColor: '#F4F8FF', border: '1.5px solid #3B82F6', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🇰🇷 CHUYỂN KHOẢN HÀN QUỐC (WON ₩)
                </span>
                <p style={{ fontSize: '0.85rem', margin: '6px 0 2px 0' }}><strong>Ngân hàng:</strong> Woori Bank (우리은행)</p>
                <p style={{ fontSize: '0.85rem', margin: '2px 0' }}><strong>Số tài khoản:</strong> <span style={{ color: '#3B82F6', fontWeight: 800 }}>1002-123-456789</span></p>
                <p style={{ fontSize: '0.85rem', margin: '2px 0' }}><strong>Chủ tài khoản:</strong> TAVY CO., LTD</p>
              </div>

              <button
                className="btn-primary"
                onClick={handleClose}
                style={{ width: '100%', padding: '14px 0' }}
              >
                Hoàn tất & Tiếp tục mua sắm
              </button>
            </div>
          ) : product ? (
            <>
              {/* Product preview */}
              <div style={{
                display: 'flex',
                gap: 14,
                padding: '14px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 28,
              }}>
                <img
                  src={product.productImage}
                  alt={product.name}
                  style={{
                    width: 72, height: 72,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--accent)', marginBottom: 4,
                  }}>
                    {product.brand}
                  </div>
                  <div style={{
                    fontSize: '0.9rem', fontWeight: 500,
                    color: 'var(--text)', lineHeight: 1.3,
                  }}>
                    {product.name}
                  </div>
                  <div style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Intl.NumberFormat('ko-KR').format(product.foreignPrice)} ₩
                    &nbsp;·&nbsp;
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                      ~{formatVnd(product.foreignPrice * krwRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>

                {/* Qty */}
                <div className="form-group">
                  <label className="form-label">Số lượng</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    max={10}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                  />
                </div>

                <div style={{
                  borderTop: '1px solid var(--border)',
                  margin: '20px 0',
                  paddingTop: 20,
                }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                    Thông tin người nhận
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nguyễn Thị An"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Select địa chỉ phân cấp 4 tầng Quốc gia -> Tỉnh/TP -> Quận/Huyện -> Phường/Xã */}
                <CascadingAddressSelector
                  initialAddress={currentUser?.address || address}
                  onChange={(addrInfo) => setAddress(addrInfo.fullAddress)}
                  required={true}
                />

                <div className="form-group">
                  <label className="form-label">Ghi chú (tùy chọn)</label>
                  <textarea
                    className="input"
                    placeholder="Màu sắc, size, yêu cầu đặc biệt..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Price estimate */}
                <div style={{
                  background: 'var(--accent-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  marginTop: 4,
                  marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tạm tính (x{qty}):</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      ~{formatVnd(product.foreignPrice * krwRate * qty)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    * Giá cuối cùng sẽ được xác nhận qua báo giá chính thức (bao gồm thuế + cước bay).
                  </p>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px' }}>
                  Gửi yêu cầu mua hộ
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
