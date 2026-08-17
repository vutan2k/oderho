import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductManager from '../components/AdminProductManager';
import AdminOrderManager from '../components/AdminOrderManager';
import { 
  BarChart3, 
  ShoppingBag, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  DollarSign, 
  Tag, 
  RefreshCw, 
  FileText 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    isAdminAuthenticated, 
    logoutAdmin, 
    orders, 
    rates, 
    updateRates,
    publishToWeb,
    revertFromWeb,
    products,
    botIsRunning,
    toggleBot,
    pendingProducts
  } = useContext(AppContext);
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'products' | 'settings'
  const [krwRateInput, setKrwRateInput] = useState(rates?.KRW?.rate || 19.5);
  const [usdRateInput, setUsdRateInput] = useState(rates?.USD?.rate || 25500);
  const [serviceFeeInput, setServiceFeeInput] = useState(rates?.serviceFeePercent || 5);
  const [prevOrdersLength, setPrevOrdersLength] = useState(orders.length);

  React.useEffect(() => {
    if (rates) {
      if (rates.KRW?.rate) setKrwRateInput(rates.KRW.rate);
      if (rates.USD?.rate) setUsdRateInput(rates.USD.rate);
      if (rates.serviceFeePercent !== undefined) setServiceFeeInput(rates.serviceFeePercent);
    }
  }, [rates]);

  React.useEffect(() => {
    if (orders.length > prevOrdersLength) {
      if (prevOrdersLength > 0) {
        const newestOrder = orders[0];
        if (newestOrder && newestOrder.status === 'pending') {
          if (showToast) {
            showToast(`🔔 CÓ ĐƠN HÀNG MỚI! Khách hàng ${newestOrder.customerName || 'Khách'} vừa gửi yêu cầu mua hộ ${newestOrder.id}.`, 'info');
          }
          // Play dynamic synth notification double beep
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);

            setTimeout(() => {
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(1046.5, ctx.currentTime);
              gain2.gain.setValueAtTime(0.08, ctx.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
              osc2.start(ctx.currentTime);
              osc2.stop(ctx.currentTime + 0.18);
            }, 120);
          } catch {}
        }
      }
    }
    setPrevOrdersLength(orders.length);
  }, [orders, prevOrdersLength, showToast]);

  if (!isAdminAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Truy cập bị từ chối. Vui lòng đăng nhập quyền Admin!</h2>
        <button className="btn-gold" style={{ marginTop: '16px' }} onClick={() => navigate('/admin/login')}>
          Đến trang đăng nhập Admin
        </button>
      </div>
    );
  }

  // Handle updates for rates & fees
  const handleUpdateKrw = (e) => {
    e.preventDefault();
    const val = parseFloat(krwRateInput);
    if (!val || val <= 0) return;
    updateRates({ ...rates, KRW: { ...rates.KRW, rate: val } });
    if (showToast) showToast('Đã cập nhật tỷ giá KRW thành công!', 'success');
  };

  const handleUpdateUsd = (e) => {
    e.preventDefault();
    const val = parseFloat(usdRateInput);
    if (!val || val <= 0) return;
    updateRates({ ...rates, USD: { ...rates.USD, rate: val } });
    if (showToast) showToast('Đã cập nhật tỷ giá USD thành công!', 'success');
  };

  const handleUpdateServiceFee = (e) => {
    e.preventDefault();
    const val = parseFloat(serviceFeeInput);
    if (val < 0) return;
    updateRates({ ...rates, serviceFeePercent: val });
    if (showToast) showToast('Đã cập nhật phần trăm phí dịch vụ!', 'success');
  };

  // KPI Calculations
  const krwRate = rates?.KRW?.rate || 19.5;
  const estimatedRevenue = orders.reduce((sum, order) => {
    if (order.status === 'completed' || order.status === 'cancelled') return sum;
    const displayTotal = order.quote 
      ? order.quote.totalVnd 
      : Math.round((order.foreignPrice || 0) * (rates[order.country]?.rate || krwRate) * (order.qty || 1));
    return sum + displayTotal;
  }, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'quoted').length;
  const catalogCount = products?.length || 0;

  // Sorting 5 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const navItems = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag, count: orders.length },
    { id: 'products', label: 'Sản phẩm', icon: FileSpreadsheet },
    { id: 'settings', label: 'Cấu hình', icon: Settings },
  ];

  return (
    <div className="admin-container">
      
      {/* LEFT SIDEBAR */}
      <aside className="admin-sidebar">
        {/* Sidebar Header / Brand */}
        <div className="admin-sidebar-header-wrap" style={{ padding: '24px 20px', borderBottom: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', letterSpacing: '1px' }}>TAVY KOREA</span>
          </div>
          <div style={{ display: 'inline-block' }}>
            <span style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="admin-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`admin-nav-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--purple-primary)' : '#9CA3AF' }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== undefined && (
                  <span style={{ 
                    backgroundColor: isActive ? 'var(--purple-primary)' : '#4B5563', 
                    color: '#FFF', 
                    fontSize: '0.75rem', 
                    padding: '2px 6px', 
                    borderRadius: '9999px',
                    fontWeight: 600
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer-wrap" style={{ padding: '20px', borderTop: '1px solid #374151' }}>
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL */}
      <main className="admin-main">
        
        {/* Tab Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {activeTab === 'overview' && 'Tổng quan hệ thống'}
              {activeTab === 'orders' && 'Quản lý đơn hàng'}
              {activeTab === 'products' && 'Quản lý sản phẩm'}
              {activeTab === 'settings' && 'Cấu hình hệ thống'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activeTab === 'overview' && 'Xem hiệu suất bán hàng, đơn hàng mới & điều khiển bot tự động.'}
              {activeTab === 'orders' && 'Xem trạng thái, cập nhật mã vận đơn & báo giá khách hàng.'}
              {activeTab === 'products' && 'Quản lý danh sách sản phẩm hiển thị trên website.'}
              {activeTab === 'settings' && 'Cài đặt tỷ giá hối đoái nước ngoại & đồng bộ hóa dữ liệu.'}
            </p>
          </div>
          
          {/* Quick Info Status on Header */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFF', padding: '8px 16px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: botIsRunning ? '#10B981' : '#9CA3AF' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                Scraper Bot: {botIsRunning ? 'Đang chạy' : 'Đang tắt'}
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {/* Card 1 */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'var(--purple-light)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={24} style={{ color: 'var(--purple-primary)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Doanh thu dự kiến</p>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-dark)' }}>
                    {estimatedRevenue.toLocaleString('vi-VN')} ₫
                  </h3>
                </div>
              </div>

              {/* Card 2 */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: '#E0F2FE', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={24} style={{ color: '#0284C7' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng số đơn hàng</p>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-dark)' }}>{totalOrders}</h3>
                </div>
              </div>

              {/* Card 3 */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: '#FEF3C7', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={24} style={{ color: '#D97706' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đơn chờ xử lý</p>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-dark)' }}>{pendingOrders}</h3>
                </div>
              </div>

              {/* Card 4 */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: '#ECFDF5', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={24} style={{ color: '#059669' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sản phẩm Web</p>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-dark)' }}>{catalogCount}</h3>
                </div>
              </div>
            </div>

            {/* BOT CONTROL & PENDING QUEUE */}
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>🤖 Điều khiển Scraper Bot tự động</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tự động tìm kiếm & cào các sản phẩm Hot Olive Young Hàn Quốc về hàng đợi phê duyệt.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: botIsRunning ? '#10B981' : '#EF4444' }}>
                    {botIsRunning ? 'BOT ĐANG HOẠT ĐỘNG' : 'BOT ĐANG TẮT'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => { toggleBot(true); if (showToast) showToast('Đã kích hoạt Bot tự động!', 'info'); }}
                      style={{
                        backgroundColor: botIsRunning ? '#10B981' : '#E5E7EB',
                        color: botIsRunning ? '#FFF' : '#374151',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Bật Bot
                    </button>
                    <button
                      onClick={() => { toggleBot(false); if (showToast) showToast('Đã dừng Bot tự động!', 'info'); }}
                      style={{
                        backgroundColor: !botIsRunning ? '#EF4444' : '#E5E7EB',
                        color: !botIsRunning ? '#FFF' : '#374151',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Tắt Bot
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Sản phẩm chờ duyệt trong hàng đợi: <strong style={{ color: 'var(--purple-primary)' }}>{pendingProducts?.length || 0}</strong>
                </span>
                <button 
                  onClick={() => setActiveTab('products')} 
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--purple-primary)',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Đến trang quản lý sản phẩm để duyệt
                </button>
              </div>
            </div>

            {/* RECENT ORDERS TABLE */}
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: 'var(--purple-primary)' }} />
                  Đơn hàng gần đây
                </h4>
                <button 
                  onClick={() => setActiveTab('orders')}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--purple-primary)',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Xem tất cả đơn hàng &rarr;
                </button>
              </div>

              {recentOrders.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  Chưa có đơn hàng nào trong danh sách.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px 8px', fontWeight: 600 }}>Mã Đơn</th>
                        <th style={{ padding: '12px 8px', fontWeight: 600 }}>Khách Hàng</th>
                        <th style={{ padding: '12px 8px', fontWeight: 600 }}>Sản Phẩm</th>
                        <th style={{ padding: '12px 8px', fontWeight: 600 }}>Ngày Đặt</th>
                        <th style={{ padding: '12px 8px', fontWeight: 600 }}>Trạng Thế</th>
                        <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'right' }}>Tổng Tiền (₫)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => {
                        const rateInfo = rates[order.country] || rates.KRW;
                        const displayTotal = order.quote 
                          ? order.quote.totalVnd 
                          : Math.round((order.foreignPrice || 0) * (rateInfo?.rate || 19.5) * (order.qty || 1));

                        // Status styling helper
                        let statusColor = '#374151';
                        let statusBg = '#F3F4F6';
                        let statusText = order.status;

                        if (order.status === 'pending') {
                          statusBg = '#FEF3C7';
                          statusColor = '#D97706';
                          statusText = 'Chờ xử lý';
                        } else if (order.status === 'quoted') {
                          statusBg = '#DBEAFE';
                          statusColor = '#2563EB';
                          statusText = 'Đã báo giá';
                        } else if (order.status === 'paid') {
                          statusBg = '#D1FAE5';
                          statusColor = '#059669';
                          statusText = 'Đã thanh toán';
                        } else if (order.status === 'completed') {
                          statusBg = '#ECFDF5';
                          statusColor = '#10B981';
                          statusText = 'Hoàn thành';
                        } else if (order.status === 'cancelled') {
                          statusBg = '#FEE2E2';
                          statusColor = '#EF4444';
                          statusText = 'Đã hủy';
                        }

                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-dark)' }}>{order.id}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{order.customerPhone}</div>
                            </td>
                            <td style={{ padding: '12px 8px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.productName}>
                              {order.productName}
                            </td>
                            <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ 
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: statusColor,
                                backgroundColor: statusBg
                              }}>
                                {statusText}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--text-dark)' }}>
                              {displayTotal.toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <AdminOrderManager />
        )}

        {/* TAB 3: PRODUCTS */}
        {activeTab === 'products' && (
          <AdminProductManager />
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Rates & Fee Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* KRW Rate form */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '14px' }}>₩ Tỷ giá Won Hàn Quốc (KRW/VND)</h4>
                <form onSubmit={handleUpdateKrw} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Giá trị quy đổi (1 KRW = x VND):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={krwRateInput}
                      onChange={(e) => setKrwRateInput(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '4px', fontSize: '0.9rem', fontWeight: 700 }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ 
                      backgroundColor: 'var(--purple-primary)', 
                      color: '#FFF', 
                      border: 'none', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 700
                    }}
                  >
                    Cập nhật tỷ giá KRW
                  </button>
                </form>
              </div>

              {/* USD Rate form */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '14px' }}>$ Tỷ giá Đô la Mỹ (USD/VND)</h4>
                <form onSubmit={handleUpdateUsd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Giá trị quy đổi (1 USD = x VND):</label>
                    <input
                      type="number"
                      step="1"
                      value={usdRateInput}
                      onChange={(e) => setUsdRateInput(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '4px', fontSize: '0.9rem', fontWeight: 700 }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ 
                      backgroundColor: 'var(--purple-primary)', 
                      color: '#FFF', 
                      border: 'none', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 700
                    }}
                  >
                    Cập nhật tỷ giá USD
                  </button>
                </form>
              </div>

              {/* Service Fee Form */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '14px' }}>⚙️ Phần trăm phí dịch vụ (%)</h4>
                <form onSubmit={handleUpdateServiceFee} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Phí mua hộ thu của khách (% trên giá sản phẩm):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={serviceFeeInput}
                      onChange={(e) => setServiceFeeInput(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '4px', fontSize: '0.9rem', fontWeight: 700 }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ 
                      backgroundColor: 'var(--purple-primary)', 
                      color: '#FFF', 
                      border: 'none', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 700
                    }}
                  >
                    Cập nhật phí dịch vụ
                  </button>
                </form>
              </div>

            </div>

            {/* Sync & Maintenance Actions */}
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '14px' }}>🔄 Đồng bộ & Bảo trì dữ liệu Website</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Khi bạn chỉnh sửa, thêm, xóa sản phẩm trong Quản lý sản phẩm, dữ liệu sẽ được lưu nháp cục bộ. Để áp dụng các thay đổi này cho người dùng ngoài Website, bạn cần đồng bộ. Hoặc bạn có thể khôi phục lại dữ liệu từ Website.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    if (window.confirm('Khôi phục lại dữ liệu gốc (bản backup gần nhất đang chạy trên Website)? Các chỉnh sửa nháp sẽ bị xóa.')) {
                      revertFromWeb();
                      if (showToast) showToast('Đã khôi phục dữ liệu gần nhất!', 'info');
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.05)', 
                    color: '#374151', 
                    border: '1px solid #D1D5DB',
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    fontSize: '0.88rem', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RefreshCw size={16} />
                  Khôi phục lần đăng nhập gần nhất
                </button>
                
                <button 
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn đẩy tất cả dữ liệu kho này lên Website cho khách hàng xem?')) {
                      publishToWeb();
                      if (showToast) showToast('Đã đồng bộ lên Website thành công!', 'success');
                    }
                  }}
                  style={{
                    backgroundColor: '#10B981', 
                    color: '#FFF', 
                    border: 'none',
                    padding: '12px 24px', 
                    borderRadius: '8px', 
                    fontSize: '0.88rem', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Đồng bộ lên Website
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
