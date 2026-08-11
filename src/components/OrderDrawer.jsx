import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { X, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const totalVnd = product
    ? Math.round(product.foreignPrice * krwRate * qty * 1.15) // rough estimate incl. fees
    : 0;

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

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-dark)' }}>
            {success ? 'Đặt hàng thành công 🎉' : 'Đặt Mua Sản Phẩm Hàn Quốc 🇰🇷'}
          </span>
          <button
            onClick={handleClose}
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {success ? (
            /* Success state */
            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
              <div style={{
                width: 64, height: 64,
                background: 'var(--accent-light)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={36} color="var(--accent)" />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Yêu cầu đã được gửi!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Chúng tôi sẽ kiểm tra nguồn hàng và gửi báo giá chi tiết cho bạn trong vòng <strong>5–15 phút</strong>.
              </p>
              <button
                className="btn-outline"
                onClick={handleClose}
                style={{ marginTop: 28 }}
              >
                Tiếp tục mua sắm
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

                <div className="form-group">
                  <label className="form-label">Địa chỉ giao hàng *</label>
                  <textarea
                    className="input"
                    placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

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
