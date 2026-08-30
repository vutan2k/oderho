import React, { useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Menu, X, ShoppingCart, User, LogOut, Package, AlertCircle, Sun, Moon
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import ProductDetailModal from '../components/ProductDetailModal';
import HeroSection from '../components/HeroSection';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import { triggerFlyToCart } from '../utils/flyToCart';
import { GuestOrderTrackingBar, GuestOrderStatusCard } from '../components/GuestOrderTracking';
import { findGuestOrders } from '../services/guestTrackingService';

export default function KROrderHomePage() {
  const { oliveYoungCatalog, rates, currentUser, logoutUser, cart, addToCart, orders, userTheme, toggleUserTheme } = useContext(AppContext);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guest Order Tracking State
  const [trackingQuery, setTrackingQuery] = useState('');
  const [matchedOrders, setMatchedOrders] = useState([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'cosmetics', name: 'Mỹ phẩm' },
    { id: 'ginseng', name: 'Sâm nấm' },
    { id: 'supplements', name: 'Thực phẩm chức năng' }
  ];

  // Dynamic sample suggestions from existing orders or standard fallbacks
  const sampleSuggestions = useMemo(() => {
    const list = [];
    if (Array.isArray(orders) && orders.length > 0) {
      const firstOrder = orders[0];
      if (firstOrder?.id) {
        list.push({ label: `Thử mã: ${firstOrder.id}`, value: firstOrder.id });
      }
      const phone = firstOrder?.customerPhone || firstOrder?.phone;
      if (phone) {
        list.push({ label: `Thử SĐT: ${phone}`, value: phone });
      }
    }
    if (list.length === 0) {
      list.push(
        { label: 'Thử mã: ORD-100001', value: 'ORD-100001' },
        { label: 'Thử SĐT: 0912345678', value: '0912345678' }
      );
    }
    return list;
  }, [orders]);

  // Handle Guest Tracking Search
  const handleTrackingSearch = (query) => {
    const term = String(query || '').trim();
    if (!term) return;

    setIsSearching(true);
    const results = findGuestOrders(term, orders || []);
    setTrackingQuery(term);
    setMatchedOrders(results);
    setSelectedOrderIndex(0);
    setHasSearched(true);
    setIsSearching(false);

    // Smooth scroll to tracking section on mobile
    const trackerElem = document.getElementById('order-tracker');
    if (trackerElem) {
      trackerElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Handle Clear / Reset Tracking
  const handleTrackingClear = () => {
    setTrackingQuery('');
    setMatchedOrders([]);
    setSelectedOrderIndex(0);
    setHasSearched(false);
  };

  // Close Tracking Status Card / Banner
  const handleCloseTracking = () => {
    setHasSearched(false);
  };

  const filteredProducts = useMemo(() => {
    if (!oliveYoungCatalog) return [];
    return oliveYoungCatalog.filter((product) => {
      if (product.isPublished === false || product.status === 'pending' || product.isHidden === true) return false;

      if (activeCategory === 'all') return true;
      const cat = (product.category || '').toLowerCase();
      
      if (cat === activeCategory) return true;
      if (activeCategory === 'cosmetics') return cat.includes('mỹ phẩm') || cat.includes('skin') || cat.includes('dưỡng') || cat.includes('make') || cat.includes('trang') || cat.includes('hair') || cat.includes('body');
      if (activeCategory === 'ginseng') return cat.includes('sâm') || cat.includes('nấm');
      if (activeCategory === 'supplements') return cat.includes('thực phẩm') || cat.includes('chức năng') || cat.includes('health') || cat.includes('collagen') || cat.includes('pharm') || cat.includes('thuốc');
      
      return false;
    });
  }, [oliveYoungCatalog, activeCategory]);

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
        MUA HÀNG HÀN QUỐC CHÍNH HÃNG 100% | <span>GIAO HÀNG TẬN NƠI TẠI VIỆT NAM (3-7 NGÀY)</span>
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
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'cosmetics')} className={activeCategory === 'cosmetics' ? 'active' : ''}>MỸ PHẨM</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'ginseng')} className={activeCategory === 'ginseng' ? 'active' : ''}>SÂM NẤM</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'supplements')} className={activeCategory === 'supplements' ? 'active' : ''}>THỰC PHẨM CHỨC NĂNG</a></li>
                <li><Link to="/policy">QUY ĐỊNH & CHÍNH SÁCH</Link></li>
              </ul>
            </nav>

            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {/* Nút chuyển đổi Dark/Light mode */}
              <button
                onClick={toggleUserTheme}
                className="icon-btn"
                aria-label={userTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                title={userTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-dark)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {userTheme === 'dark' ? <Sun size={24} color="#FBBF24" /> : <Moon size={24} />}
              </button>

              {/* Tra cứu đơn hàng (Desktop only) */}
              <a href="#order-tracker" className="icon-btn desktop-only-icon" aria-label="Tra cứu đơn hàng" title="Tra cứu tiến độ đơn hàng" style={{ color: 'var(--text-dark)' }}>
                <Search size={26} />
              </a>

              {/* Giỏ hàng (Hiển thị trên cả Desktop & Mobile) */}
              <Link id="cart-icon-header" to="/cart" className="icon-btn" style={{ position: 'relative', transition: 'transform 0.2s ease', color: 'var(--text-dark)' }} aria-label="Giỏ hàng" title="Giỏ hàng">
                <ShoppingCart size={26} />
                {cart && cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-12px',
                    backgroundColor: 'var(--purple-primary)',
                    color: userTheme === 'dark' ? '#111827' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800, width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    border: '2px solid var(--nav-bg, #FFFFFF)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}>
                    {cart.length > 99 ? '99+' : cart.length}
                  </span>
                )}
              </Link>

              {/* Đơn của tôi & Tài khoản & Đăng nhập/Đăng xuất (Desktop only - Trên Mobile được gom gọn vào Menu 3 gạch) */}
              {currentUser ? (
                <>
                  <Link to="/orders" className="icon-btn desktop-only-icon" aria-label="Đơn của tôi" title="Đơn của tôi" style={{ color: 'var(--text-dark)' }}>
                    <Package size={26} />
                  </Link>
                  <Link to="/profile" className="icon-btn desktop-only-icon" aria-label="Tài khoản" title="Tài khoản" style={{ color: 'var(--text-dark)' }}>
                    <User size={26} />
                  </Link>
                  <button onClick={() => logoutUser()} className="icon-btn desktop-only-icon" aria-label="Đăng xuất" title="Đăng xuất" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: 0 }}>
                    <LogOut size={26} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="icon-btn desktop-only-icon" aria-label="Đăng nhập" title="Đăng nhập" style={{ color: 'var(--text-dark)' }}>
                  <User size={26} />
                </Link>
              )}

              {/* Nút 3 gạch Menu trên Mobile */}
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

        {/* Mobile Navigation Drawer (Gom gọn toàn bộ chức năng tài khoản, tra cứu & danh mục) */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer" style={{
            position: 'absolute', top: '80px', left: 0, width: '100%',
            backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '20px 24px', zIndex: 99
          }}>
            {/* 1. Nhóm Tra cứu, Đơn hàng & Tài khoản */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <a
                href="#order-tracker"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const elem = document.getElementById('order-tracker');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ color: 'var(--purple-primary)', fontWeight: 700, fontSize: '0.94rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Search size={18} />
                <span>Tra cứu tiến độ đơn hàng</span>
              </a>

              {currentUser ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <Package size={18} />
                    <span>Đơn hàng của tôi</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <User size={18} />
                    <span>Tài khoản ({currentUser.name || 'Cá nhân'})</span>
                  </Link>

                  <button
                    onClick={() => { logoutUser(); setMobileMenuOpen(false); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', padding: 0, textAlign: 'left' }}
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: 'var(--purple-primary)', fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <User size={18} />
                  <span>Đăng nhập / Đăng ký</span>
                </Link>
              )}

              {/* Nút chuyển đổi Dark/Light Mode trên Mobile */}
              <button
                onClick={() => toggleUserTheme()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-dark)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 0',
                  textAlign: 'left'
                }}
              >
                {userTheme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} />}
                <span>{userTheme === 'dark' ? 'Giao diện: Chế độ Tối (Bật)' : 'Giao diện: Chế độ Sáng (Bật)'}</span>
              </button>
            </div>

            {/* 2. Nhóm Danh mục sản phẩm */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Danh mục mua sắm
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', margin: 0, padding: 0 }}>
              <li><a href="#" onClick={(e) => handleNavCategoryClick(e, 'all')} style={{ color: activeCategory === 'all' ? 'var(--purple-primary)' : 'var(--text-dark)', fontWeight: activeCategory === 'all' ? 700 : 600, textDecoration: 'none', fontSize: '0.9rem' }}>Trang chủ</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'cosmetics')} style={{ color: activeCategory === 'cosmetics' ? 'var(--purple-primary)' : 'var(--text-dark)', fontWeight: activeCategory === 'cosmetics' ? 700 : 600, textDecoration: 'none', fontSize: '0.9rem' }}>Mỹ phẩm</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'ginseng')} style={{ color: activeCategory === 'ginseng' ? 'var(--purple-primary)' : 'var(--text-dark)', fontWeight: activeCategory === 'ginseng' ? 700 : 600, textDecoration: 'none', fontSize: '0.9rem' }}>Sâm nấm</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'supplements')} style={{ color: activeCategory === 'supplements' ? 'var(--purple-primary)' : 'var(--text-dark)', fontWeight: activeCategory === 'supplements' ? 700 : 600, textDecoration: 'none', fontSize: '0.9rem' }}>Thực phẩm chức năng</a></li>
              <li><Link to="/policy" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--purple-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>Quy định & Chính sách</Link></li>
            </ul>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        {/* Banner Tối Giản */}
        <HeroSection />

        {/* Khu vực Tra Cứu Đơn Hàng & Danh mục & Danh sách sản phẩm */}
        <section id="order-tracker" style={{ padding: '36px 0 60px 0', background: 'var(--bg-ivory)' }}>
          <div className="container">

            {/* Prominent Guest Order Tracking Bar (R1) */}
            <GuestOrderTrackingBar
              onSearch={handleTrackingSearch}
              onClear={handleTrackingClear}
              initialValue={trackingQuery}
              isLoading={isSearching}
              sampleSuggestions={sampleSuggestions}
            />

            {/* Matched Order Status Card (R2, R3) */}
            {hasSearched && matchedOrders.length > 0 && (
              <GuestOrderStatusCard
                order={matchedOrders[selectedOrderIndex]}
                matchedOrders={matchedOrders}
                selectedOrderIndex={selectedOrderIndex}
                onSelectOrder={setSelectedOrderIndex}
                onClose={handleCloseTracking}
                rates={rates}
              />
            )}

            {/* Friendly Not-Found Banner */}
            {hasSearched && matchedOrders.length === 0 && (
              <div
                className="tracking-not-found-box"
                style={{
                  maxWidth: '720px',
                  margin: '0 auto 28px auto',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <AlertCircle size={24} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                      Không tìm thấy đơn hàng nào
                    </h4>
                    <button
                      onClick={handleCloseTracking}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', padding: '2px' }}
                      aria-label="Đóng thông báo"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#7F1D1D', margin: '6px 0 10px 0', lineHeight: 1.4 }}>
                    Không tìm thấy đơn hàng nào khớp với thông tin "<strong>{trackingQuery}</strong>". Quý khách vui lòng kiểm tra lại Số điện thoại (VD: 0912345678) hoặc Mã đơn hàng (VD: ORD-100001).
                  </p>
                  <div style={{ fontSize: '0.82rem', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Cần hỗ trợ tra cứu nhanh?</span>
                    <a
                      href="https://zalo.me/0935861690"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#991B1B',
                        fontWeight: 700,
                        textDecoration: 'underline'
                      }}
                    >
                      Chat Zalo CSKH: 0935 861 690
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Tabs (Cuộn ngang mượt mà trên Mobile) */}
            <div id="products" className="category-filter-ribbon">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Lưới sản phẩm */}
            <ProductGrid
              products={filteredProducts}
              krwRate={krwRate * serviceFeeMultiplier}
              onSelectProduct={handleAddToCart}
              onViewDetail={setDetailProduct}
            />

            {/* Banner Tối Giản Mua Hộ Ngoài Web */}
            <div className="consult-banner-wrap">
              <div className="consult-banner-text">
                Cần tìm mua sản phẩm khác từ Hàn Quốc?
              </div>

              <a
                href="https://m.me/100062954372060"
                target="_blank"
                rel="noopener noreferrer"
                className="consult-banner-btn"
              >
                Nhận tư vấn
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Modal Xem Chi Tiết Sản Phẩm */}
      <ProductDetailModal
        product={detailProduct}
        krwRate={krwRate * serviceFeeMultiplier}
        onClose={() => setDetailProduct(null)}
        onOrderNow={handleAddToCart}
      />
    </div>
  );
}
