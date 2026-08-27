import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductCatalog from '../components/AdminProductCatalog';
import AdminProductSourcing from '../components/AdminProductSourcing';
import AdminOrderManager from '../components/AdminOrderManager';
import { APP_VERSION } from '../data/appVersion';
import { getOrderTotalVnd } from '../utils/priceCalculator';
import {
  BarChart3,
  ShoppingBag,
  Zap,
  Layers,
  LogOut,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Calculator,
  ChevronRight,
  Menu,
  X,
  Clock,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Inbox
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    isAdminAuthenticated,
    logoutAdmin,
    orders,
    rates,
    updateRates,
    products,
    pendingProducts
  } = useContext(AppContext);
  const navigate = useNavigate();
  const showToast = useToast();

  // 4 Tabs chuẩn E-commerce
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'products' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick Currency Converter state
  const [calcWon, setCalcWon] = useState('50000');

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFee = rates?.serviceFeePercent || 5;

  const calcVnd = useMemo(() => {
    const won = parseFloat(String(calcWon).replace(/,/g, '')) || 0;
    const vnd = Math.round(won * krwRate * (1 + serviceFee / 100));
    return vnd.toLocaleString('vi-VN');
  }, [calcWon, krwRate, serviceFee]);

  // Settings inputs
  const [krwRateInput, setKrwRateInput] = useState(rates?.KRW?.rate || 19.5);
  const [serviceFeeInput, setServiceFeeInput] = useState(rates?.serviceFeePercent || 5);
  const [isSavingRates, setIsSavingRates] = useState(false);

  useEffect(() => {
    if (rates?.KRW?.rate !== undefined) setKrwRateInput(rates.KRW.rate);
    if (rates?.serviceFeePercent !== undefined) setServiceFeeInput(rates.serviceFeePercent);
  }, [rates?.KRW?.rate, rates?.serviceFeePercent]);

  // Current time clocks (Seoul KST & Vietnam ICT)
  const [timeNow, setTimeNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seoulTimeStr = useMemo(() => {
    return timeNow.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit' });
  }, [timeNow]);

  const vnTimeStr = useMemo(() => {
    return timeNow.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
  }, [timeNow]);

  // Phân tích việc cần làm khẩn cấp
  const urgentQueue = useMemo(() => {
    const needQuote = orders.filter(o => o.status === 'pending');
    const needPurchase = orders.filter(o => o.status === 'deposit_paid' || o.status === 'paid' || o.status === 'purchasing_korea');
    return { needQuote, needPurchase };
  }, [orders]);

  // Tổng doanh số GMV
  const totalGmvVnd = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + getOrderTotalVnd(order, krwRate, serviceFee);
    }, 0);
  }, [orders, krwRate, serviceFee]);

  const handleSaveRates = async (e) => {
    e.preventDefault();
    setIsSavingRates(true);
    try {
      if (updateRates) {
        await updateRates({
          KRW: { rate: parseFloat(krwRateInput) || 19.5 },
          serviceFeePercent: parseFloat(serviceFeeInput) || 5
        });
      }
      if (showToast) showToast('Đã lưu cấu hình tỷ giá & phí dịch vụ thành công!', 'success');
    } catch {
      if (showToast) showToast('Lỗi khi lưu tỷ giá!', 'error');
    } finally {
      setIsSavingRates(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'inherit' }}>
      {/* 📱 Mobile Top Navbar */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#0F172A',
        color: '#FFF',
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 900
      }} className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: 900, fontSize: '1rem' }}>TAVY KOREA ADMIN</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Seoul {seoulTimeStr}</div>
      </div>

      {/* 🧭 Sidebar Điều Hướng 4 Tab Chuẩn */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0F172A',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: sidebarOpen ? 0 : '-260px',
          zIndex: 1000,
          transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          borderRight: '1px solid #1E293B'
        }}
        className="admin-sidebar-responsive"
      >
        {/* Brand Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>TAVY KOREA</span>
              <span style={{ fontSize: '0.65rem', backgroundColor: '#2563EB', padding: '1px 6px', borderRadius: '4px' }}>
                ADMIN
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '3px' }}>
              Hệ Thống Quản Trị & Vận Hành
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
            className="admin-close-mobile-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items (4 Main Tabs) */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {[
            {
              id: 'overview',
              label: 'Tổng Quan (Overview)',
              icon: BarChart3,
              badge: urgentQueue.needQuote.length > 0 ? `${urgentQueue.needQuote.length} việc` : null,
              badgeColor: '#EF4444'
            },
            {
              id: 'orders',
              label: 'Quản Lý Đơn Hàng',
              icon: CreditCard,
              badge: `${orders.length}`,
              badgeColor: '#3B82F6'
            },
            {
              id: 'products',
              label: 'Kho Sản Phẩm',
              icon: ShoppingBag,
              badge: `${products.length}`,
              badgeColor: '#10B981'
            },
            {
              id: 'sourcing',
              label: 'Kho Nạp Hàng',
              icon: Zap,
              badge: pendingProducts?.length > 0 ? `${pendingProducts.length} chờ duyệt` : null,
              badgeColor: '#F59E0B'
            },
            {
              id: 'settings',
              label: 'Cài Đặt & Tỷ Giá',
              icon: Sliders
            }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFF' : '#94A3B8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? '#FFF' : '#94A3B8'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : item.badgeColor,
                    color: '#FFF',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '999px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Time Clocks & Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
            <span>🇰🇷 Seoul (KST):</span>
            <strong style={{ color: '#FFF' }}>{seoulTimeStr}</strong>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
            <span>🇻🇳 VN (ICT):</span>
            <strong style={{ color: '#FFF' }}>{vnTimeStr}</strong>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#1E293B',
              color: '#F87171',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <LogOut size={14} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* 🖥️ Main Content Area */}
      <main style={{ flex: 1, minHeight: '100vh', padding: '24px' }} className="admin-main-wrapper">
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: TỔNG QUAN (OVERVIEW)                                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Title */}
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
                📊 Tổng Quan Hoạt Động & Việc Cần Làm
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                Bảng theo dõi các chỉ số quan trọng và danh sách công việc cần xử lý ngay hôm nay.
              </p>
            </div>

            {/* 4 Essential KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Card 1: Doanh Số GMV */}
              <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '18px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                  <span>TỔNG DOANH SỐ (GMV)</span>
                  <TrendingUp size={16} color="#10B981" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
                  {totalGmvVnd.toLocaleString('vi-VN')} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
                  Từ {orders.length} đơn hàng trong hệ thống
                </div>
              </div>

              {/* Card 2: Đơn Chờ Báo Giá */}
              <div
                onClick={() => setActiveTab('orders')}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  padding: '18px',
                  border: urgentQueue.needQuote.length > 0 ? '2px solid #EF4444' : '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', display: 'flex', justifyContent: 'space-between' }}>
                  <span>CẦN BÁO GIÁ NGAY</span>
                  <AlertCircle size={16} color="#DC2626" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#DC2626', marginTop: '6px' }}>
                  {urgentQueue.needQuote.length} Đơn
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span>Bấm để xử lý ngay</span>
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* Card 3: Đơn Cần Đặt Mua Hàn Quốc */}
              <div
                onClick={() => setActiveTab('orders')}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  padding: '18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', display: 'flex', justifyContent: 'space-between' }}>
                  <span>CẦN MUA TẠI HÀN</span>
                  <CreditCard size={16} color="#2563EB" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563EB', marginTop: '6px' }}>
                  {urgentQueue.needPurchase.length} Đơn
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                  Đã cọc / Đã thanh toán
                </div>
              </div>

              {/* Card 4: Sản Phẩm Đang Bán */}
              <div
                onClick={() => setActiveTab('products')}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  padding: '18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', display: 'flex', justifyContent: 'space-between' }}>
                  <span>KHO HÀNG LIVE</span>
                  <ShoppingBag size={16} color="#059669" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
                  {products.length} Sản Phẩm
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                  Sâm Nấm, Mỹ phẩm, TPCN
                </div>
              </div>

              {/* Card 5: Hàng Chờ Duyệt */}
              <div
                onClick={() => setActiveTab('sourcing')}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  padding: '18px',
                  border: (pendingProducts?.length || 0) > 0 ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', display: 'flex', justifyContent: 'space-between' }}>
                  <span>HÀNG CHỜ DUYỆT</span>
                  <Zap size={16} color="#D97706" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D97706', marginTop: '6px' }}>
                  {pendingProducts?.length || 0} Sản Phẩm
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span>Bấm để duyệt lên web</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            </div>

            {/* Bảng Danh Sách Việc Cần Làm Hôm Nay (Urgent Action Queue) */}
            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#2563EB" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    Danh Sách Đơn Hàng Cần Xử Lý Gấp Hôm Nay
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Xem toàn bộ Kanban ➔
                </button>
              </div>

              {urgentQueue.needQuote.length === 0 && urgentQueue.needPurchase.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#059669', backgroundColor: '#ECFDF5', borderRadius: '10px' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Tuyệt vời! Không có đơn hàng nào bị tồn đọng.</div>
                  <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px' }}>Tất cả các đơn đã được báo giá và mua hàng đầy đủ.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...urgentQueue.needQuote, ...urgentQueue.needPurchase].map(order => (
                    <div
                      key={order.id}
                      onClick={() => setActiveTab('orders')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          backgroundColor: order.status === 'pending' ? '#FEE2E2' : '#EFF6FF',
                          color: order.status === 'pending' ? '#DC2626' : '#2563EB',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {order.status === 'pending' ? 'CẦN BÁO GIÁ' : 'CẦN MUA HÀN'}
                        </span>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>#{order.id}</span>
                          <span style={{ color: '#64748B', fontSize: '0.8rem', marginLeft: '8px' }}>{order.customerName || 'Khách'} ({order.customerPhone})</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                          {getOrderTotalVnd(order, krwRate, serviceFee).toLocaleString('vi-VN')} đ
                        </span>
                        <ChevronRight size={14} color="#94A3B8" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Currency Converter Widget */}
            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 800, fontSize: '0.9rem' }}>
                  <Calculator size={18} />
                  <span>Máy Tính Đổi Giá Nhanh (Won ➔ VNĐ)</span>
                </div>
                <p style={{ margin: '4px 0 12px 0', fontSize: '0.78rem', color: '#64748B' }}>
                  Tính theo tỷ giá hiện hành: <strong>1 KRW = {krwRate} VNĐ</strong> (Phí mua hộ {serviceFee}%)
                </p>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={calcWon}
                    onChange={(e) => setCalcWon(e.target.value)}
                    placeholder="Nhập giá Won..."
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '140px', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₩ =</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563EB' }}>
                    {calcVnd} VNĐ
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  ⚙️ Cài Đặt Tỷ Giá Won Mới ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: QUẢN LÝ ĐƠN HÀNG (ORDERS KANBAN)                         */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
                📦 Quản Lý Đơn Hàng & Phân Luồng Kanban
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                Phân luồng 5 bước xử lý: Báo giá ➔ Chờ cọc ➔ Đặt mua tại Hàn ➔ Vận chuyển về VN ➔ Hoàn tất.
              </p>
            </div>
            <AdminOrderManager />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: KHO SẢN PHẨM ĐANG BÁN (LIVE PRODUCT CATALOG)             */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AdminProductCatalog />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: KHO NẠP HÀNG & HÀNG CHỜ DUYỆT (SOURCING & PENDING)       */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sourcing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
                📥 Kho Nạp Hàng & Kiểm Duyệt Sản Phẩm Mới
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                Tiếp nhận sản phẩm cào từ Naver, KGC, Nonghyup, Olive Young & Extension. Kiểm duyệt chất lượng và giá trước khi xuất bản lên website.
              </p>
            </div>
            <AdminProductSourcing />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: CÀI ĐẶT & TỶ GIÁ (SETTINGS)                             */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
                ⚙️ Cài Đặt Hệ Thống & Tỷ Giá Won
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                Thiết lập tỷ giá chuyển đổi KRW/VND và phần trăm phí dịch vụ mua hộ.
              </p>
            </div>

            <form onSubmit={handleSaveRates} style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                  Tỷ Giá 1 KRW (Won Hàn Quốc) đổi sang VNĐ:
                </label>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="40"
                    value={krwRateInput}
                    onChange={(e) => setKrwRateInput(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '160px', fontSize: '0.95rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>VNĐ / 1 Won</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                  Phần Trăm Phí Dịch Vụ Mua Hộ & Bảo Hiểm (%):
                </label>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={serviceFeeInput}
                    onChange={(e) => setServiceFeeInput(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '160px', fontSize: '0.95rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>% trên giá gốc sản phẩm</span>
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="submit"
                  disabled={isSavingRates}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isSavingRates ? 'Đang lưu...' : '💾 Lưu Cấu Hình Tỷ Giá Ngay'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar-responsive {
            left: 0 !important;
          }
          .admin-main-wrapper {
            margin-left: 260px;
          }
        }
        @media (max-width: 1023px) {
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-main-wrapper {
            margin-left: 0;
            padding-top: 80px;
          }
          .admin-close-mobile-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
