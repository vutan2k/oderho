import React, { useState, useContext } from 'react';
import { 
  Search, User, ShoppingBag, ArrowRight, Star, Heart, Check, 
  Sparkles, Leaf, ShieldCheck, Award, Pill, Smile, Globe, Package, Phone, Mail, MapPin,
  Share2, QrCode, CreditCard
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import OrderDrawer from '../components/OrderDrawer';

export default function KROrderHomePage() {
  const { oliveYoungCatalog, rates } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm', icon: <Sparkles size={24} /> },
    { id: 'skincare', name: 'Mỹ phẩm Dưỡng Da', icon: <Sparkles size={24} /> },
    { id: 'makeup', name: 'Trang Điểm K-Beauty', icon: <Heart size={24} /> },
    { id: 'health', name: 'Thực Phẩm Chức Năng', icon: <Leaf size={24} /> },
    { id: 'pharmacy', name: 'Thuốc Hiệu Thuốc Hàn', icon: <Pill size={24} /> }
  ];

  const formatVnd = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const formatKrw = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num) + ' ₩';
  };

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter(
    (product) => activeCategory === 'all' || product.category === activeCategory
  ) : [];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Thanh thông báo hàng đầu */}
      <div className="top-announcement-bar">
        MUA HÀNG HÀN QUỐC CHÍNH HÃNG 100% | <span>GIAO HÀNG TẬN NƠI TẠI VIỆT NAM (BAY AIR 3-5 NGÀY)</span>
      </div>

      {/* 2. Header & Navigation */}
      <header className="site-header">
        <div className="container">
          <div className="site-nav-wrap">
            {/* Logo */}
            <a href="#" className="brand-logo">
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--purple-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-serif)'
              }}>
                KR
              </div>
              <span className="brand-logo-text">K-MART<span>VIỆT HÀN</span></span>
            </a>

            {/* Navigation Links */}
            <nav>
              <ul className="nav-links">
                <li><a href="#" className="active">TRANG CHỦ</a></li>
                <li><a href="#products">SẢN PHẨM HÀN QUỐC</a></li>
                <li><a href="#skincare">MỸ PHẨM</a></li>
                <li><a href="#health">THỰC PHẨM CHỨC NĂNG</a></li>
                <li><a href="#pharmacy">HIỆU THUỐC HÀN</a></li>
                <li><a href="#payment">THANH TOÁN QR</a></li>
              </ul>
            </nav>

            {/* Action Icons */}
            <div className="nav-icons">
              <a href="#products" className="icon-btn" aria-label="Tìm kiếm">
                <Search size={20} />
              </a>
              <a href="#payment" className="icon-btn" aria-label="Thanh toán VietQR">
                <QrCode size={20} />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* 3. Hero Banner Section */}
        <section style={{
          background: 'linear-gradient(135deg, #F9F6FA 0%, #EDE6F2 100%)',
          padding: '70px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.1fr',
              gap: '40px',
              alignItems: 'center'
            }}>
              {/* Hero Content */}
              <div className="animate-fade-up">
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: 'var(--purple-primary)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '16px'
                }}>
                  🇰🇷 CHUYÊN MỸ PHẨM & THỰC PHẨM CHỨC NĂNG HÀN QUỐC
                </span>
                
                <h1 style={{
                  fontSize: '3.2rem',
                  lineHeight: '1.2',
                  fontWeight: 400,
                  color: 'var(--text-dark)',
                  marginBottom: '20px',
                  fontFamily: 'var(--font-serif)'
                }}>
                  Hàng Chuẩn Store Hàn, <br />
                  <span className="font-serif-italic" style={{ color: 'var(--purple-primary)' }}>Giá Tốt Cho Người Việt</span>
                </h1>

                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  maxWidth: '500px',
                  marginBottom: '32px',
                  lineHeight: '1.7'
                }}>
                  Cung cấp các sản phẩm Mỹ phẩm Olive Young, Hồng Sâm, Collagen & Các loại thuốc nội địa Hàn Quốc bán tại nhà thuốc. Hiển thị song song giá Won (₩) và VNĐ (đ).
                </p>

                <div style={{ marginBottom: '40px', display: 'flex', gap: '15px' }}>
                  <a href="#products" className="btn-gold">
                    <span>XEM DẠNH MỤC SẢN PHẨM</span>
                    <ArrowRight size={16} />
                  </a>
                </div>

                {/* 3 Cam kết */}
                <div style={{
                  display: 'flex',
                  gap: '25px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(122, 75, 158, 0.15)',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { icon: <ShieldCheck size={18} />, label: '100% CHÍNH HÃNG HÀN' },
                    { icon: <Pill size={18} />, label: 'CHUẨN HIỆU THUỐC HÀN' },
                    { icon: <CreditCard size={18} />, label: 'THANH TOÁN VIETQR & BANK HÀN' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--purple-primary)' }}>{item.icon}</span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        color: 'var(--text-dark)'
                      }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Image */}
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{
                  width: '100%',
                  height: '460px',
                  borderRadius: '24px',
                  backgroundImage: 'url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: 'var(--shadow-lg)',
                  border: '8px solid #FFFFFF'
                }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Giá trị cam kết */}
        <section style={{
          background: 'var(--bg-white)',
          padding: '35px 0',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px'
            }}>
              {[
                { icon: <ShieldCheck size={24} />, title: 'Cam Kết Chính Hãng', desc: 'Mua trực tiếp từ Olive Young, hiệu thuốc & Store Hàn.' },
                { icon: <Globe size={24} />, title: 'Vận Chuyển Hàng Không', desc: 'Bay Air từ Seoul về VN chỉ từ 3-5 ngày làm việc.' },
                { icon: <QrCode size={24} />, title: 'Thanh Toán Dễ Dàng', desc: 'Chuyển khoản VietQR Việt Nam hoặc Ngân hàng Hàn Quốc.' },
                { icon: <Award size={24} />, title: 'Hỗ Trợ 24/7', desc: 'Tư vấn nhiệt tình cho cộng đồng người Việt.' }
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--purple-primary)', flexShrink: 0, marginTop: '2px' }}>
                    {feat.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                      {feat.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Danh mục & Danh sách sản phẩm */}
        <section id="products" style={{ padding: '70px 0', background: 'var(--bg-ivory)' }}>
          <div className="container">
            <div className="section-title-wrap" style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ color: 'var(--purple-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                DANH MỤC HÀNG HÓA SẴN CÓ
              </span>
              <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '6px' }}>
                Mỹ Phẩm & Thực Phẩm Chức Năng Hàn Quốc
              </h2>
            </div>

            {/* Filter Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '40px'
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '30px',
                    border: activeCategory === cat.id ? '2px solid var(--purple-primary)' : '1px solid #ddd',
                    backgroundColor: activeCategory === cat.id ? 'var(--purple-primary)' : '#FFF',
                    color: activeCategory === cat.id ? '#FFF' : 'var(--text-dark)',
                    fontWeight: activeCategory === cat.id ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '28px'
            }}>
              {filteredProducts.map((product) => {
                const calculatedVnd = product.foreignPrice * krwRate;

                return (
                  <div
                    key={product.goodsNo}
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: '#FFF',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ position: 'relative', width: '100%', paddingTop: '90%', overflow: 'hidden' }}>
                      <img
                        src={product.productImage}
                        alt={product.name}
                        style={{
                          position: 'absolute',
                          top: 0, left: 0,
                          width: '100%', height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'var(--purple-primary)',
                        color: '#FFF',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        textTransform: 'uppercase'
                      }}>
                        {product.brand}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: '20px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--text-dark)',
                          marginBottom: '8px',
                          lineHeight: '1.4',
                          height: '42px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }} title={product.name}>
                          {product.name}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Quy cách: {product.options}
                        </p>
                      </div>

                      <div>
                        {/* Song song Won & VND */}
                        <div style={{ marginBottom: '15px', background: '#F8F6FA', padding: '10px 14px', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Giá Hàn Quốc:</span>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>
                              {formatKrw(product.foreignPrice)}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quy đổi VNĐ:</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--purple-primary)' }}>
                              {formatVnd(calculatedVnd)}
                            </strong>
                          </div>
                        </div>

                        {/* Button Order */}
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="btn-gold"
                          style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}
                        >
                          <ShoppingBag size={15} />
                          <span>ĐẶT MUA NGAY</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 6. Hướng dẫn Thanh toán VietQR & Ngân hàng Hàn Quốc */}
        <section id="payment" style={{ padding: '70px 0', background: '#FFF' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--purple-primary)', textTransform: 'uppercase' }}>
                HƯỚNG DẪN THANH TOÁN
              </span>
              <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '6px' }}>
                Thanh Toán Linh Hoạt Cho Người Việt
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {/* Thẻ Ngân Hàng Việt Nam */}
              <div style={{ border: '2px solid var(--purple-primary)', borderRadius: '16px', padding: '30px', background: '#FDFBFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <QrCode size={32} color="var(--purple-primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                    Chuyển Khoản Ngân Hàng Việt Nam (VietQR)
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                  Quét mã QR chuyển khoản bằng ứng dụng ngân hàng Việt Nam (MBBank, Vietcombank, Techcombank...). Tự động khớp lệnh tức thì.
                </p>
                <div style={{ background: '#FFF', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Ngân hàng:</strong> MB Bank</p>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Số tài khoản:</strong> 0988 888 888</p>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Chủ tài khoản:</strong> K MART VIET HAN</p>
                </div>
              </div>

              {/* Thẻ Ngân Hàng Hàn Quốc */}
              <div style={{ border: '2px solid #3B82F6', borderRadius: '16px', padding: '30px', background: '#F4F8FF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <CreditCard size={32} color="#3B82F6" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                    Chuyển Khoản Ngân Hàng Hàn Quốc (Won)
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                  Dành cho người Việt đang làm việc và sinh sống tại Hàn Quốc. Chuyển khoản trực tiếp qua tài khoản ngân hàng Hàn Quốc.
                </p>
                <div style={{ background: '#FFF', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Ngân hàng Hàn:</strong> Woori Bank (우리은행)</p>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Số tài khoản:</strong> 1002-123-456789</p>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Tên tài khoản:</strong> K-MART CO., LTD</p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#" className="brand-logo" style={{ marginBottom: '16px' }}>
                <span className="brand-logo-text">K-MART<span>VIỆT HÀN</span></span>
              </a>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                Hệ thống chuyên phân phối Mỹ phẩm Olive Young & Thực phẩm chức năng, thuốc nội địa Hàn Quốc chính hãng cho người Việt.
              </p>
            </div>

            <div className="footer-col">
              <h5>DANH MỤC HÀNG</h5>
              <ul className="footer-links">
                <li><a href="#skincare">Mỹ phẩm Dưỡng da</a></li>
                <li><a href="#makeup">Mỹ phẩm Trang điểm</a></li>
                <li><a href="#health">Hồng sâm & Collagen</a></li>
                <li><a href="#pharmacy">Thuốc hiệu thuốc Hàn</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>LIÊN HỆ</h5>
              <ul className="footer-links" style={{ gap: '12px' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Phone size={14} color="var(--purple-primary)" />
                  <span>Hotline VN: 0988 888 888</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Phone size={14} color="var(--purple-primary)" />
                  <span>Hotline Korea: +82 10-1234-5678</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Mail size={14} color="var(--purple-primary)" />
                  <span>support@kmartviethan.vn</span>
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-light)'
          }}>
            © 2026 K-MART VIỆT HÀN. Tất cả quyền được bảo lưu. Dịch vụ hàng xách tay & nhập khẩu Hàn Quốc uy tín.
          </div>
        </div>
      </footer>

      {/* Drawer Đặt Hàng */}
      <OrderDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
}

