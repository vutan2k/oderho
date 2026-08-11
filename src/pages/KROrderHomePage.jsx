import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Menu, X
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import OrderDrawer from '../components/OrderDrawer';
import ProductDetailModal from '../components/ProductDetailModal';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';

export default function KROrderHomePage() {
  const { oliveYoungCatalog, rates, currentUser, logoutUser } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
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

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter((product) => {
    if (activeCategory === 'all') return true;
    const cat = (product.category || '').toLowerCase();
    if (activeCategory === 'skincare') return cat.includes('skin') || cat.includes('dưỡng');
    if (activeCategory === 'makeup') return cat.includes('make') || cat.includes('trang');
    if (activeCategory === 'health') return cat.includes('health') || cat.includes('thực phẩm') || cat.includes('sâm') || cat.includes('collagen');
    if (activeCategory === 'pharmacy') return cat.includes('pharm') || cat.includes('thuốc');
    return cat === activeCategory;
  }) : [];

  const handleNavCategoryClick = (e, catId) => {
    e.preventDefault();
    setActiveCategory(catId);
    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const elem = document.getElementById('products');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

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
            <a href="#" onClick={(e) => handleNavCategoryClick(e, 'all')} className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img
                src="/tavy-logo.png"
                alt="TAVY Logo"
                style={{ height: '54px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                KOREA
              </span>
            </a>

            <nav>
              <ul className="nav-links">
                <li><a href="#" onClick={(e) => handleNavCategoryClick(e, 'all')} className={activeCategory === 'all' ? 'active' : ''}>TRANG CHỦ</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'skincare')} className={activeCategory === 'skincare' ? 'active' : ''}>MỸ PHẨM</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'health')} className={activeCategory === 'health' ? 'active' : ''}>THỰC PHẨM CHỨC NĂNG</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'pharmacy')} className={activeCategory === 'pharmacy' ? 'active' : ''}>HIỆU THUỐC HÀN</a></li>
              </ul>
            </nav>

            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* ĐĂNG NHẬP / ĐƠN CỦA TÔI ĐƯỢC CHUYỂN SANG BÊN PHẢI CẠNH KÍNH LÚP TÌM KIẾM */}
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link to="/orders" style={{ color: 'var(--purple-primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.82rem', letterSpacing: '1px' }}>ĐƠN CỦA TÔI</Link>
                  <button onClick={() => logoutUser()} style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '1px' }}>ĐĂNG XUẤT</button>
                </div>
              ) : (
                <Link to="/login" style={{ color: 'var(--purple-primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '1px' }}>ĐĂNG NHẬP</Link>
              )}

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
              <li><a href="#" onClick={(e) => handleNavCategoryClick(e, 'all')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>TRANG CHỦ</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'skincare')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>MỸ PHẨM</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'health')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>THỰC PHẨM CHỨC NĂNG</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'pharmacy')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>HIỆU THUỐC HÀN</a></li>
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

            <ProductGrid
              products={filteredProducts}
              krwRate={krwRate}
              onSelectProduct={setSelectedProduct}
              onViewDetail={setDetailProduct}
            />
          </div>
        </section>

      </main>

      <Footer />

      {/* Modal Xem Chi Tiết Sản Phẩm */}
      <ProductDetailModal
        product={detailProduct}
        krwRate={krwRate}
        onClose={() => setDetailProduct(null)}
        onOrderNow={(prod) => setSelectedProduct(prod)}
      />

      {/* Drawer Đặt Hàng */}
      <OrderDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
