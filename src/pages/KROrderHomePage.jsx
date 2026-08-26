import React, { useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Menu, X, ShoppingCart, User, LogOut, Package, AlertCircle
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
  const { oliveYoungCatalog, rates, currentUser, logoutUser, cart, addToCart, orders } = useContext(AppContext);
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

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter((product) => {
    if (product.isPublished === false || product.status === 'pending' || product.isHidden === true) return false;

    if (activeCategory === 'all') return true;
    const cat = (product.category || '').toLowerCase();
    
    if (cat === activeCategory) return true;
    if (activeCategory === 'cosmetics') return cat.includes('mỹ phẩm') || cat.includes('skin') || cat.includes('dưỡng') || cat.includes('make') || cat.includes('trang') || cat.includes('hair') || cat.includes('body');
    if (activeCategory === 'ginseng') return cat.includes('sâm') || cat.includes('nấm');
    if (activeCategory === 'supplements') return cat.includes('thực phẩm') || cat.includes('chức năng') || cat.includes('health') || cat.includes('collagen') || cat.includes('pharm') || cat.includes('thuốc');
    
    return false;
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
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'cosmetics')} className={activeCategory === 'cosmetics' ? 'active' : ''}>MỸ PHẨM</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'ginseng')} className={activeCategory === 'ginseng' ? 'active' : ''}>SÂM NẤM</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'supplements')} className={activeCategory === 'supplements' ? 'active' : ''}>THỰC PHẨM CHỨC NĂNG</a></li>
                <li><Link to="/policy" style={{ color: 'var(--purple-primary)', fontWeight: 700 }}>QUY ĐỊNH & CHÍNH SÁCH</Link></li>
              </ul>
            </nav>

            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
              <a href="#order-tracker" className="icon-btn" aria-label="Tra cứu đơn hàng" title="Tra cứu tiến độ đơn hàng" style={{ color: 'var(--text-dark)' }}>
                <Search size={26} />
              </a>

              <Link id="cart-icon-header" to="/cart" className="icon-btn" style={{ position: 'relative', transition: 'transform 0.2s ease', color: 'var(--text-dark)' }} aria-label="Giỏ hàng" title="Giỏ hàng">
                <ShoppingCart size={26} />
                {cart && cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-12px',
                    backgroundColor: 'var(--purple-primary)', color: '#FFF', fontSize: '0.75rem',
                    fontWeight: 800, width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
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
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'cosmetics')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>MỸ PHẨM</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'ginseng')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>SÂM NẤM</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'supplements')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>THỰC PHẨM CHỨC NĂNG</a></li>
              <li><Link to="/policy" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--purple-primary)', fontWeight: 700 }}>QUY ĐỊNH & CHÍNH SÁCH</Link></li>
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
            <div id="products" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginTop: '12px',
              marginBottom: '28px',
              WebkitOverflowScrolling: 'touch'
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '30px',
                    border: activeCategory === cat.id ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
                    backgroundColor: activeCategory === cat.id ? 'var(--purple-primary)' : '#FFF',
                    color: activeCategory === cat.id ? '#FFF' : 'var(--text-dark)',
                    fontWeight: activeCategory === cat.id ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
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
            <div style={{
              marginTop: '36px',
              padding: '14px 22px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                Cần tìm mua sản phẩm khác từ Hàn Quốc?
              </div>

              <a
                href="https://m.me/100062954372060"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--purple-primary)',
                  color: '#FFFFFF',
                  padding: '8px 20px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(122, 75, 158, 0.25)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
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
