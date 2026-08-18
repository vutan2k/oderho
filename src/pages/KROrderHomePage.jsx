import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Menu, X, ShoppingCart, User, LogOut, Package
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import ProductDetailModal from '../components/ProductDetailModal';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import { triggerFlyToCart } from '../utils/flyToCart';

export default function KROrderHomePage() {
  const { oliveYoungCatalog, rates, currentUser, logoutUser, cart, addToCart } = useContext(AppContext);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'skincare', name: 'Mỹ phẩm Dưỡng Da' },
    { id: 'health', name: 'Thực Phẩm Chức Năng' },
    { id: 'pharmacy', name: 'Hiệu Thuốc Hàn' }
  ];

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter((product) => {
    if (product.isPublished === false || product.status === 'pending') return false;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const matchName = (product.name || '').toLowerCase().includes(query);
      const matchBrand = (product.brand || '').toLowerCase().includes(query);
      if (!matchName && !matchBrand) return false;
    }

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

  const handleAddToCart = (product, e) => {
    addToCart(product, 1);
    if (e && product.productImage) {
      triggerFlyToCart(e, product.productImage);
    }
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

            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
              <a href="#products" className="icon-btn" aria-label="Tìm kiếm" title="Tìm kiếm" style={{ color: 'var(--text-dark)' }}>
                <Search size={26} />
              </a>

              <Link id="cart-icon-header" to="/cart" className="icon-btn" style={{ position: 'relative', transition: 'transform 0.2s ease', color: 'var(--text-dark)' }} aria-label="Giỏ hàng" title="Giỏ hàng">
                <ShoppingCart size={26} />
                {cart && cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-12px',
                    backgroundColor: '#3B82F6', color: '#FFF', fontSize: '0.75rem',
                    fontWeight: 800, width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    {cart.length > 99 ? '99+' : cart.length}
                  </span>
                )}
              </Link>

              {currentUser ? (
                <>
                  <Link to="/orders" className="icon-btn" aria-label="Đơn của tôi" title="Đơn của tôi" style={{ color: 'var(--text-dark)' }}>
                    <Package size={26} />
                  </Link>
                  <Link to="/profile" className="icon-btn" aria-label="Tài khoản" title="Tài khoản" style={{ color: 'var(--text-dark)' }}>
                    <User size={26} />
                  </Link>
                  <button onClick={() => logoutUser()} className="icon-btn" aria-label="Đăng xuất" title="Đăng xuất" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: 0 }}>
                    <LogOut size={26} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="icon-btn" aria-label="Đăng nhập" title="Đăng nhập" style={{ color: 'var(--text-dark)' }}>
                  <User size={26} />
                </Link>
              )}
              <button
                className="icon-btn mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                style={{ color: 'var(--text-dark)' }}
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
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
              <h2 className="section-title" style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '6px' }}>
                Mỹ Phẩm & Thực Phẩm Chức Năng Hàn Quốc
              </h2>
            </div>

            {/* Search Input Bar */}
            <div style={{ maxWidth: '540px', margin: '0 auto 30px auto', position: 'relative' }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên hoặc thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 44px',
                  borderRadius: '30px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-dark)'
                }}
              />
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa tìm kiếm"
                  style={{
                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="filter-btn-group" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="filter-btn"
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
              onSelectProduct={handleAddToCart}
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
        onOrderNow={handleAddToCart}
      />
    </div>
  );
}
