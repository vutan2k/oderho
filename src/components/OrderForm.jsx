import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ShoppingCart, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const sampleImages = [
  { name: 'Son môi (Lipstick)', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80' },
  { name: 'Nước hoa (Perfume)', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kem chống nắng (Sunscreen)', url: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=400&q=80' },
  { name: 'Serum dưỡng da', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80' },
];

export default function OrderForm({ calculationData, clearCalculation }) {
  const { user, createOrder, rates, oliveYoungCatalog } = useContext(AppContext);
  const [country, setCountry] = useState('USD');
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [options, setOptions] = useState('');
  const [qty, setQty] = useState(1);
  const [foreignPrice, setForeignPrice] = useState('');
  const [selectedImg, setSelectedImg] = useState(sampleImages[0].url);
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [note, setNote] = useState('');

  const [customerName, setCustomerName] = useState(user?.username || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(user?.address || '');

  const [successOrder, setSuccessOrder] = useState(null);
  const [linkRecognized, setLinkRecognized] = useState(false);

  // Sync user info
  useEffect(() => {
    if (user) {
      setCustomerName(user.username);
      setCustomerPhone(user.phone || '');
      setCustomerAddress(user.address || '');
    }
  }, [user]);

  // Autofill from calculator or catalog quick buy
  useEffect(() => {
    if (calculationData) {
      setCountry(calculationData.country);
      setForeignPrice(calculationData.foreignPrice);
      setQty(calculationData.qty || 1);
      
      if (calculationData.productUrl) setProductUrl(calculationData.productUrl);
      if (calculationData.productName) setProductName(calculationData.productName);
      if (calculationData.brand) setBrand(calculationData.brand);
      if (calculationData.options) setOptions(calculationData.options);
      if (calculationData.productImage) {
        setSelectedImg(calculationData.productImage);
        setCustomImgUrl('');
      }
    }
  }, [calculationData]);

  // URL link parser for Olive Young
  useEffect(() => {
    if (!productUrl) {
      setLinkRecognized(false);
      return;
    }
    const match = productUrl.match(/goodsNo=([^&]+)/);
    if (match) {
      const goodsNo = match[1];
      const found = oliveYoungCatalog?.find(p => p.goodsNo === goodsNo);
      if (found) {
        setProductName(found.name);
        setBrand(found.brand);
        setForeignPrice(found.foreignPrice);
        setOptions(found.options);
        setCountry('KRW');
        setSelectedImg(found.productImage);
        setCustomImgUrl('');
        setLinkRecognized(true);
      } else {
        setLinkRecognized(false);
      }
    } else {
      setLinkRecognized(false);
    }
  }, [productUrl, oliveYoungCatalog]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user || user.role !== 'customer') {
      alert('Vui lòng chuyển sang "Chế độ KHÁCH HÀNG" trên thanh điều hướng để gửi đơn hàng.');
      return;
    }

    const orderData = {
      customerName,
      customerPhone,
      customerAddress,
      country,
      productUrl,
      productName,
      brand,
      options,
      qty: parseInt(qty),
      foreignPrice: parseFloat(foreignPrice),
      productImage: customImgUrl || selectedImg,
      customerNote: note,
    };

    const created = createOrder(orderData);
    setSuccessOrder(created);

    // Trigger premium confetti celebration
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#B76E79', '#FFD1DC', '#D4AF37', '#2C302E']
    });

    // Reset fields
    setProductUrl('');
    setProductName('');
    setBrand('');
    setOptions('');
    setQty(1);
    setForeignPrice('');
    setNote('');
    setCustomImgUrl('');
    if (clearCalculation) clearCalculation();
  };

  return (
    <div className="glass animate-fade-in" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '35px',
      maxWidth: '800px',
      margin: '40px auto',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-color)',
    }}>
      
      {successOrder ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            color: 'var(--primary-rose)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-rose-light)',
            marginBottom: '20px'
          }}>
            <CheckCircle size={44} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--charcoal)', marginBottom: '10px' }}>Gửi yêu cầu mua hộ thành công!</h2>
          <p style={{ color: 'var(--charcoal-light)', marginBottom: '8px' }}>
            Mã đơn hàng của bạn là <strong style={{ color: 'var(--primary-rose-dark)' }}>{successOrder.id}</strong>.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-light)', maxWidth: '500px', margin: '0 auto 25px auto' }}>
            Admin của BeautyCargo đang kiểm tra nguồn hàng và sẽ gửi báo giá chi tiết (gồm thuế và phí vận chuyển thực tế) đến bạn trong vòng 5-15 phút. Bạn có thể theo dõi tiến trình ở <strong>Cổng thông tin khách hàng</strong> bên dưới.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSuccessOrder(null)}>
              Gửi thêm yêu cầu mới
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setSuccessOrder(null);
              // Smooth scroll to customer dashboard
              const el = document.getElementById('customer-dashboard');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Xem đơn hàng của tôi
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ShoppingCart size={22} style={{ color: 'var(--primary-rose)' }} />
            <h2 style={{ fontSize: '1.6rem', color: 'var(--charcoal)' }}>Gửi yêu cầu đặt mua mỹ phẩm hộ</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-light)', marginBottom: '30px' }}>
            Điền liên kết sản phẩm mỹ phẩm từ Sephora, Ulta, Olive Young, v.v., shop sẽ báo giá và đặt mua cho bạn!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            
            {/* Left side - Product Details */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--primary-rose-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                1. Thông tin sản phẩm mua hộ
              </h3>

              <div className="form-group">
                <label className="form-label">Đường dẫn sản phẩm (URL) *</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="Ví dụ: https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495" 
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  required 
                />
                {linkRecognized && (
                  <p style={{ color: '#2E7D32', fontSize: '0.8rem', fontWeight: 600, marginTop: '5px' }}>
                    ✓ Đã nhận diện sản phẩm thật từ Olive Young Hàn Quốc!
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="VD: Dior Lip Glow" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thương hiệu *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="VD: Dior" 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tùy chọn (Màu sắc, Dung tích, Size...) *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="VD: Màu 01 Pink, 6ml" 
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nước mua</label>
                  <select className="form-control" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="USD">Mỹ</option>
                    <option value="KRW">Hàn Quốc</option>
                    <option value="JPY">Nhật Bản</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Giá gốc ({rates[country].symbol}) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    placeholder="Giá web" 
                    value={foreignPrice}
                    onChange={(e) => setForeignPrice(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số lượng *</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-control" 
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú yêu cầu thêm cho shop</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Nhập ghi chú (nếu có)..." 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Right Side - Image selection and delivery address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--primary-rose-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                  2. Chọn hình minh họa sản phẩm
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  {sampleImages.map((img) => (
                    <div 
                      key={img.name} 
                      onClick={() => {
                        setSelectedImg(img.url);
                        setCustomImgUrl('');
                      }}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImg === img.url && !customImgUrl ? '2.5px solid var(--primary-rose)' : '1px solid var(--border-color)',
                        boxShadow: selectedImg === img.url && !customImgUrl ? '0 0 10px rgba(183,110,121,0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Hoặc dán URL ảnh khác</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://..." 
                    value={customImgUrl}
                    onChange={(e) => setCustomImgUrl(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--primary-rose-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                  3. Thông tin người nhận hàng
                </h3>
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ giao hàng tại Việt Nam *</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    required 
                  ></textarea>
                </div>
              </div>

            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '25px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'center' }}>
            {calculationData && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={clearCalculation}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={14} />
                Xóa giá tính sẵn
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '12px 45px' }}
            >
              <span>Gửi Yêu Cầu Đặt Mua Hộ</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
