import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Sparkles, Heart, Leaf, Pill,
  QrCode, CreditCard, Menu, X
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import OrderDrawer from '../components/OrderDrawer';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';

export default function KROrderHomePage() {
  const { oliveYoungCatalog, rates, currentUser, logoutUser } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'skincare', name: 'Mỹ phẩm Dưỡng Da' },
    { id: 'makeup', name: 'Trang Điểm K-Beauty' },
    { id: 'health', name: 'Thực Phẩm Chức Năng' },
    { id: 'pharmacy', name: 'Thuốc Hiệu Thuốc Hàn' }
  ];

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter(
    (product) => activeCategory === 'all' || product.category === activeCategory
  ) : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 1. Thanh thông báo hàng đầu */}
      <div className="top-announcement-bar">
        MUA HÀNG HÀN QUỐC CHÍNH HÃNG 100% | <span>GIAO HÀNG TẬN NƠI TẠI VIỆT NAM (3-5 NGÀY)</span>
      </div>

      {/* 2. Header & Navigation */}
      <header className="site-header">
        <div className="container">
          <div className="site-nav-wrap">
            <a href="#" className="brand-logo">
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'var(--purple-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-serif)'
              }}>KR</div>
              <span className="brand-logo-text">K-MART<span>VIỆT HÀN</span></span>
            </a>

            <nav>
              <ul className="nav-links">
                <li><a href="#" className="active">TRANG CHỦ</a></li>
                <li><a href="#skincare">MỸ PHẨM</a></li>
                <li><a href="#health">THỰC PHẨM CHỨC NĂNG</a></li>
                <li><a href="#pharmacy">HIỆU THUỐC HÀN</a></li>
                {currentUser ? (
                  <>
                    <li><Link to="/orders" style={{ color: 'var(--purple-primary)', fontWeight: 700 }}>ĐƠN CỦA TÔI</Link></li>
                    <li><button onClick={() => logoutUser()} style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '1px' }}>ĐĂNG XUẤT</button></li>
                  </>
                ) : (
                  <li><Link to="/login">ĐĂNG NHẬP</Link></li>
                )}
              </ul>
            </nav>

            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href="#products" className="icon-btn" aria-label="Tìm kiếm" title="Tìm kiếm">
                <Search size={18} />
              </a>
              <button
                className="icon-btn mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer" style={{
            position: 'absolute', top: '80px', left: 0, width: '100%',
            backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)', padding: '20px 24px', zIndex: 99
          }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li><a href="#" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>TRANG CHỦ</a></li>
              <li><a href="#skincare" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>MỸ PHẨM</a></li>
              <li><a href="#health" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>THỰC PHẨM CHỨC NĂNG</a></li>
              <li><a href="#pharmacy" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>HIỆU THUỐC HÀN</a></li>
              {currentUser ? (
                <>
                  <li><Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--purple-primary)', fontWeight: 700 }}>ĐƠN CỦA TÔI</Link></li>
                  <li><button onClick={() => { logoutUser(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>ĐĂNG XUẤT</button></li>
                </>
              ) : (
                <li><Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--purple-primary)', fontWeight: 700 }}>ĐĂNG NHẬP</Link></li>
              )}
            </ul>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <HeroSection krwRate={krwRate} />
        <WhyChooseUs />

        {/* Danh mục & Danh sách sản phẩm */}
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '10px 22px', borderRadius: '30px',
                    border: activeCategory === cat.id ? '2px solid var(--purple-primary)' : '1px solid #ddd',
                    backgroundColor: activeCategory === cat.id ? 'var(--purple-primary)' : '#FFF',
                    color: activeCategory === cat.id ? '#FFF' : 'var(--text-dark)',
                    fontWeight: activeCategory === cat.id ? 700 : 500,
                    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <ProductGrid products={filteredProducts} krwRate={krwRate} onSelectProduct={setSelectedProduct} />
          </div>
        </section>

        {/* Hướng dẫn Thanh toán VietQR & Tỷ giá Hàn - Việt */}
        <section id="payment" style={{ padding: '70px 0', background: '#FFF' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--purple-primary)', textTransform: 'uppercase' }}>
                BẢNG TỶ GIÁ & THANH TOÁN
              </span>
              <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '6px' }}>
                Thanh Toán Linh Hoạt & Tỷ Giá Hôm Nay
              </h2>
            </div>

            {/* Khối Tỷ giá Won Hàn / VNĐ */}
            <div style={{
              backgroundColor: 'var(--purple-light)', borderRadius: '16px', padding: '24px 30px',
              marginBottom: '35px', border: '1px solid rgba(122, 75, 158, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--purple-primary)' }}>
                  🇰🇷 TỶ GIÁ QUY ĐỔI THỜI GIAN THỰC
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '4px' }}>
                  1 Won (₩) = <span style={{ color: 'var(--purple-primary)', fontSize: '1.6rem' }}>{krwRate} VNĐ (đ)</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  * Giá sản phẩm trên website được tự động cập nhật chính xác theo tỷ giá này.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ background: '#FFF', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>10.000 Won (₩)</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--purple-primary)' }}>{(10000 * krwRate).toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{ background: '#FFF', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>50.000 Won (₩)</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--purple-primary)' }}>{(50000 * krwRate).toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
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

      <Footer />

      {/* Drawer Đặt Hàng */}
      <OrderDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
