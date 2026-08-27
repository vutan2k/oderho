import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductManager from '../components/AdminProductManager';
import AdminOrderManager from '../components/AdminOrderManager';
import AdminAiCopilotWidget from '../components/AdminAiCopilotWidget';
import { APP_VERSION } from '../data/appVersion';
import { getOrderTotalVnd } from '../utils/priceCalculator';
import {
  BarChart3,
  ShoppingBag,
  FileSpreadsheet,
  LogOut,
  RefreshCw,
  FileText,
  TrendingUp,
  Download,
  CreditCard,
  Calculator,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function AdminDashboardPage() {
  const {
    isAdminAuthenticated,
    logoutAdmin,
    orders,
    rates,
    updateRates,
    publishToWeb,
    products,
    pendingProducts
  } = useContext(AppContext);
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'products' | 'payments' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick Currency Converter state
  const [calcWon, setCalcWon] = useState('30000');

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
  const [isPublishing, setIsPublishing] = useState(false);
  const prevOrdersLengthRef = useRef(orders.length);

  useEffect(() => {
    if (rates?.KRW?.rate !== undefined) {
      setKrwRateInput(rates.KRW.rate);
    }
    if (rates?.serviceFeePercent !== undefined) {
      setServiceFeeInput(rates.serviceFeePercent);
    }
  }, [rates?.KRW?.rate, rates?.serviceFeePercent]);

  // Current time clocks (Seoul KST & Vietnam ICT)
  const [timeNow, setTimeNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seoulTimeStr = useMemo(() => {
    return timeNow.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [timeNow]);

  const vnTimeStr = useMemo(() => {
    return timeNow.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [timeNow]);

  // Audio notification on new order
  useEffect(() => {
    if (orders.length > prevOrdersLengthRef.current) {
      if (prevOrdersLengthRef.current > 0) {
        const newestOrder = orders[0];
        if (newestOrder && (newestOrder.status === 'pending' || newestOrder.status === 'paid')) {
          if (showToast) {
            showToast(`CÓ ĐƠN HÀNG MỚI! Khách ${newestOrder.customerName || 'Khách'} vừa gửi đơn ${newestOrder.id}.`, 'info');
          }
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
          } catch {}
        }
      }
    }
    prevOrdersLengthRef.current = orders.length;
  }, [orders, showToast]);

  // Action Queue (Việc cần làm ngay)
  const urgentQueue = useMemo(() => {
    const needQuote = orders.filter(o => o.status === 'pending');
    const needPurchase = orders.filter(o => o.status === 'deposit_paid' || o.status === 'paid');
    const needPack = orders.filter(o => o.status === 'purchased');
    const needFlight = orders.filter(o => o.status === 'packed_kr');
    const pendingProds = pendingProducts || [];

    return {
      needQuote,
      needPurchase,
      needPack,
      needFlight,
      pendingProds,
      totalUrgent: needQuote.length + needPurchase.length + needPack.length + needFlight.length + pendingProds.length
    };
  }, [orders, pendingProducts]);

  // Revenue KPI
  const estimatedRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (order.status === 'cancelled') return sum;
      return sum + getOrderTotalVnd(order, rates);
    }, 0);
  }, [orders, rates]);

  const receivedRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (order.status === 'paid' || order.status === 'completed' || order.status === 'purchased' || order.status === 'packed_kr' || order.status === 'shipping_vn') {
        return sum + getOrderTotalVnd(order, rates);
      }
      return sum;
    }, 0);
  }, [orders, rates]);

  const totalOrders = orders.length;
  const catalogCount = products?.length || 0;
  const unpaidOrders = useMemo(() => orders.filter(o => o.paymentStatus === 'unpaid' || o.status === 'on_hold'), [orders]);

  const monthlyStats = useMemo(() => {
    const stats = {};
    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      const date = new Date(order.createdAt);
      if (isNaN(date.getTime())) return;
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${month.toString().padStart(2, '0')}/${year}`;
      const value = getOrderTotalVnd(order, rates);

      if (!stats[key]) {
        stats[key] = { key, month, year, total: 0, received: 0, orderCount: 0 };
      }
      stats[key].total += value;
      if (order.status === 'paid' || order.status === 'completed') {
        stats[key].received += value;
      }
      stats[key].orderCount += 1;
    });

    return Object.values(stats).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [orders, rates]);

  const maxVal = useMemo(() => {
    const vals = monthlyStats.map(s => s.total);
    return vals.length > 0 ? Math.max(...vals, 1000000) : 1000000;
  }, [monthlyStats]);

  const handleUpdateKrw = async (e) => {
    e.preventDefault();
    const cleanStr = String(krwRateInput ?? '').replace(',', '.').trim();
    const val = parseFloat(cleanStr);
    const feeStr = String(serviceFeeInput ?? '').replace(',', '.').trim();
    const feeVal = parseFloat(feeStr);

    if (!val || val <= 0 || isNaN(feeVal) || feeVal < 0) {
      if (showToast) showToast('Vui lòng nhập tỷ giá và phí dịch vụ hợp lệ!', 'error');
      return;
    }

    try {
      setIsSavingRates(true);
      await updateRates({
        ...rates,
        KRW: { ...rates.KRW, rate: val },
        serviceFeePercent: feeVal
      });
      if (showToast) showToast(`Đã lưu Tỷ giá = ${val}đ và Phí dịch vụ = ${feeVal}%!`, 'success');
    } catch (err) {
      if (showToast) showToast(`Lỗi khi lưu tỷ giá: ${err?.message || err}`, 'error');
    } finally {
      setIsSavingRates(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã Đơn', 'Khách Hàng', 'SĐT', 'Ngày Đặt', 'Trạng Thái', 'Tổng Tiền (VND)', 'Mã Vận Đơn'];
    const rows = orders.map(order => {
      const value = getOrderTotalVnd(order, rates);
      const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN');
      return [
        order.id,
        order.customerName || 'Khách',
        order.customerPhone || '',
        dateStr,
        order.status,
        value,
        order.trackingCode || order.domesticTrackingCode || ''
      ];
    });

    const csvContent = "﻿" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_TAVY_KOREA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast('Đã xuất báo cáo CSV thành công!', 'success');
  };

  if (!isAdminAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: 'var(--bg-ivory)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'var(--bg-white)', padding: '36px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', maxWidth: '400px', width: '100%', border: '1px solid #E5E7EB' }}>
          <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '48px', margin: '0 auto 16px auto', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>Cổng Quản Trị TAVY Korea</h2>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '24px' }}>Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.</p>
          <button
            className="btn-gold"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}
            onClick={() => navigate('/admin/login')}
          >
            Đăng nhập Quản trị viên
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Bàn Làm Việc', icon: BarChart3, badge: urgentQueue.totalUrgent > 0 ? urgentQueue.totalUrgent : null, badgeColor: '#EF4444' },
    { id: 'orders', label: 'Quy Trình 8 Bước', icon: ShoppingBag, count: orders.length },
    { id: 'products', label: 'Kho Olive Young', icon: FileSpreadsheet, badge: (pendingProducts?.length || 0) > 0 ? pendingProducts.length : null, badgeColor: 'var(--gold-primary)' },
    { id: 'payments', label: 'Thanh Toán VietQR', icon: CreditCard, count: unpaidOrders.length },
    
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-ivory)', color: 'var(--bg-dark-accent)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9998, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--text-dark)',
          color: 'var(--bg-ivory)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: sidebarOpen ? 0 : '-260px',
          zIndex: 9999,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
          borderRight: '1px solid var(--bg-dark-accent)'
        }}
        className="admin-sidebar-responsive"
      >
        {/* Sidebar Brand Header */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--bg-dark-accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '32px', width: 'auto' }} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--bg-white)', letterSpacing: '0.5px' }}>TAVY KOREA</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>CỔNG QUẢN TRỊ 8 BƯỚC</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '4px', display: 'none' }}
            className="admin-close-mobile-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Seoul & VN Clocks */}
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--bg-dark-accent)', borderBottom: '1px solid var(--text-muted)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>Seoul (KST): <strong>{seoulTimeStr}</strong></span>
          </div>
          <div>
            <span>VN: <strong>{vnTimeStr}</strong></span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {navItems.map((item) => {
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
                  gap: '12px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--purple-primary)' : 'transparent',
                  color: isActive ? 'var(--bg-white)' : 'var(--text-light)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-dark-accent)';
                    e.currentTarget.style.color = 'var(--bg-ivory)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-light)';
                  }
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--bg-white)' : 'var(--text-light)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ backgroundColor: item.badgeColor || '#EF4444', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && !item.badge && (
                  <span style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--text-muted)', color: isActive ? '#FFF' : 'var(--text-light)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Editable Rate Form in Sidebar */}
        <div style={{ padding: '14px', backgroundColor: 'var(--bg-dark-accent)', margin: '0 12px 12px 12px', borderRadius: '10px', border: '1px solid var(--text-muted)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            Điều chỉnh Tỷ giá & Phí
          </div>
          <form onSubmit={handleUpdateKrw} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', flex: 1 }}>Tỷ giá VNĐ:</span>
              <input
                type="text"
                value={krwRateInput}
                onChange={(e) => setKrwRateInput(e.target.value)}
                style={{ width: '70px', padding: '6px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 700, textAlign: 'right', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-dark)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', flex: 1 }}>Phí DV (%):</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={serviceFeeInput}
                onChange={(e) => setServiceFeeInput(e.target.value)}
                style={{ width: '70px', padding: '6px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 700, textAlign: 'right', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-dark)' }}
              />
            </div>
            <button
              type="submit"
              disabled={isSavingRates}
              style={{
                backgroundColor: 'var(--purple-primary)',
                color: '#FFF',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: isSavingRates ? 'not-allowed' : 'pointer',
                opacity: isSavingRates ? 0.7 : 1,
                marginTop: '4px'
              }}
            >
              {isSavingRates ? 'Đang lưu...' : 'Lưu tỷ giá & phí'}
            </button>
          </form>
        </div>

        {/* Sidebar Footer / Logout */}
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--bg-dark-accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--bg-ivory)' }}>Admin TAVY</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>v{APP_VERSION}</div>
          </div>
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut size={14} />
            <span>Thoát</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main-wrapper">

        {/* TOPBAR */}
        <header
          style={{
            minHeight: '56px',
            backgroundColor: 'var(--bg-white)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            gap: '8px'
          }}
          className="admin-topbar-responsive"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
              className="admin-hamburger-btn"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
            <h1
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-dark)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={
                activeTab === 'overview' ? 'Bàn Làm Việc & Báo Cáo' :
                activeTab === 'orders' ? 'Quản Lý Đơn Hàng (8 Bước)' :
                activeTab === 'products' ? 'Kho Hàng & Cào Olive Young' :
                activeTab === 'payments' ? 'Xác Nhận VietQR' : 'Cấu Hình Hệ Thống'
              }
            >
              {activeTab === 'overview' && 'Bàn Làm Việc'}
              {activeTab === 'orders' && 'Quản Lý Đơn Hàng'}
              {activeTab === 'products' && 'Kho Hàng Olive Young'}
              {activeTab === 'payments' && 'Xác Nhận VietQR'}
              {activeTab === 'settings' && 'Cấu Hình Hệ Thống'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => window.open('/', '_blank')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-ivory)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Xem trang web khách hàng"
            >
              <ExternalLink size={13} />
              <span className="admin-btn-label">Web Khách</span>
            </button>

            <button
              onClick={async () => {
                if (window.confirm('Đồng bộ dữ liệu kho & giá lên Website chính thức?')) {
                  setIsPublishing(true);
                  try {
                    await publishToWeb();
                    if (showToast) showToast('Đã đồng bộ lên Website thành công!', 'success');
                  } finally {
                    setIsPublishing(false);
                  }
                }
              }}
              disabled={isPublishing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#10B981',
                color: 'var(--bg-white)',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
              }}
              title="Đồng bộ sản phẩm lên web khách"
            >
              {isPublishing ? <RefreshCw size={13} className="spin" /> : <RefreshCw size={13} />}
              <span>{isPublishing ? 'Đang lên...' : 'Lên Web'}</span>
            </button>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <div style={{ padding: '14px 12px', flex: 1, overflowY: 'auto' }} className="admin-content-padding">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>

              {/* SECTION: ACTION QUEUE (VIỆC CẦN LÀM GẤP) */}
              <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ backgroundColor: '#FEF2F2', color: '#EF4444', padding: '6px', borderRadius: '8px' }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                        Việc Cần Làm Ngay (Action Center)
                      </h2>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Các đơn hàng & sản phẩm đang chờ Admin thao tác xử lý
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: urgentQueue.totalUrgent > 0 ? '#EF4444' : '#10B981', backgroundColor: urgentQueue.totalUrgent > 0 ? '#FEF2F2' : '#ECFDF5', padding: '4px 10px', borderRadius: '20px' }}>
                    {urgentQueue.totalUrgent > 0 ? `${urgentQueue.totalUrgent} mục cần xử lý` : 'Đã xử lý hết việc'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>

                  {/* Task 1: Need Purchase Store */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: urgentQueue.needPurchase.length > 0 ? '#FFFBEB' : 'var(--bg-ivory)',
                      border: `1px solid ${urgentQueue.needPurchase.length > 0 ? 'var(--gold-primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: urgentQueue.needPurchase.length > 0 ? '#B45309' : 'var(--text-muted)' }}>
                        1. Đi Mua Store Hàn
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: urgentQueue.needPurchase.length > 0 ? '#D97706' : 'var(--text-light)' }}>
                        {urgentQueue.needPurchase.length}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                      Đơn đã cọc/thanh toán, cần quay Video POV mua hàng.
                    </p>
                  </div>

                  {/* Task 2: Need Pack KR */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: urgentQueue.needPack.length > 0 ? 'var(--bg-subtle-purple)' : 'var(--bg-ivory)',
                      border: `1px solid ${urgentQueue.needPack.length > 0 ? 'var(--purple-light)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: urgentQueue.needPack.length > 0 ? 'var(--purple-primary)' : 'var(--text-muted)' }}>
                        2. Đóng Kiện & Cân Kg
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: urgentQueue.needPack.length > 0 ? 'var(--purple-primary)' : 'var(--text-light)' }}>
                        {urgentQueue.needPack.length}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                      Đã mua xong, cần quay video bọc bubble & cân kg.
                    </p>
                  </div>

                  {/* Task 3: Need Flight */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: urgentQueue.needFlight.length > 0 ? '#F0F9FF' : 'var(--bg-ivory)',
                      border: `1px solid ${urgentQueue.needFlight.length > 0 ? '#BAE6FD' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: urgentQueue.needFlight.length > 0 ? '#0369A1' : 'var(--text-muted)' }}>
                        3. Gửi bay Incheon ➔ VN
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: urgentQueue.needFlight.length > 0 ? '#0284C7' : 'var(--text-light)' }}>
                        {urgentQueue.needFlight.length}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                      Kiện đã đóng, cần nhập mã vận đơn & ngày bay.
                    </p>
                  </div>

                  {/* Task 4: Pending Products to approve */}
                  <div
                    onClick={() => setActiveTab('products')}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: urgentQueue.pendingProds.length > 0 ? '#ECFDF5' : 'var(--bg-ivory)',
                      border: `1px solid ${urgentQueue.pendingProds.length > 0 ? '#A7F3D0' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: urgentQueue.pendingProds.length > 0 ? '#047857' : 'var(--text-muted)' }}>
                        4. Duyệt Hàng Olive Young
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: urgentQueue.pendingProds.length > 0 ? '#059669' : 'var(--text-light)' }}>
                        {urgentQueue.pendingProds.length}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                      Link sản phẩm vừa cào, cần duyệt đẩy lên Web.
                    </p>
                  </div>

                </div>
              </div>

              {/* KPI CARDS & QUICK CONVERTER GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>

                {/* Left 8 Cols: KPI Cards & Revenue Chart */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }} className="admin-grid-span8">

                  {/* 4 KPI Numbers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div style={{ backgroundColor: 'var(--bg-white)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tổng Doanh Thu</span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--purple-primary)', marginTop: '4px' }}>
                        {estimatedRevenue.toLocaleString('vi-VN')} ₫
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>Thực nhận: {receivedRevenue.toLocaleString('vi-VN')} ₫</span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-white)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tổng Đơn Hàng</span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-dark)', marginTop: '4px' }}>
                        {totalOrders}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Toàn bộ các kênh</span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-white)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sản Phẩm Web</span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-dark)', marginTop: '4px' }}>
                        {catalogCount}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Olive Young Store</span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-white)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chờ Thanh Toán</span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: unpaidOrders.length > 0 ? '#EF4444' : '#10B981', marginTop: '4px' }}>
                        {unpaidOrders.length}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VietQR & Woori</span>
                    </div>
                  </div>

                  {/* Revenue Statistics Chart */}
                  <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TrendingUp size={18} style={{ color: 'var(--purple-primary)' }} />
                          Biểu Đồ Tài Chính Theo Tháng
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>So sánh doanh thu dự kiến và thực thu</span>
                      </div>
                      <button
                        onClick={handleExportCSV}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-ivory)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Download size={14} /> Xuất Excel CSV
                      </button>
                    </div>

                    {monthlyStats.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                        Chưa có dữ liệu giao dịch tháng này.
                      </div>
                    ) : (
                      <div style={{ width: '100%', overflowX: 'auto' }}>
                        <div style={{ minWidth: '460px', padding: '6px 0' }}>
                          <svg viewBox="0 0 540 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
                            {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                              const y = 20 + ratio * 130;
                              const val = Math.round(maxVal * (1 - ratio));
                              return (
                                <g key={idx}>
                                  <line x1="50" y1={y} x2="520" y2={y} stroke="var(--bg-ivory)" strokeWidth="1" strokeDasharray="3 3" />
                                  <text x="42" y={y + 4} fill="var(--text-light)" fontSize="9" textAnchor="end" fontWeight="500">
                                    {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val.toLocaleString('vi-VN')}₫`}
                                  </text>
                                </g>
                              );
                            })}

                            {monthlyStats.map((stat, idx) => {
                              const barWidth = 28;
                              const groupGap = 65;
                              const startX = 75 + idx * groupGap;
                              const totalHeight = (stat.total / maxVal) * 130;
                              const receivedHeight = (stat.received / maxVal) * 130;
                              const totalY = 150 - totalHeight;
                              const receivedY = 150 - receivedHeight;

                              return (
                                <g key={stat.key}>
                                  <rect x={startX} y={totalY} width={barWidth} height={totalHeight} fill="var(--purple-light)" rx="4" />
                                  <rect x={startX + 5} y={receivedY} width={barWidth - 10} height={receivedHeight} fill="var(--purple-primary)" rx="3" />
                                  <text x={startX + barWidth / 2} y="172" fill="var(--text-muted)" fontSize="10" fontWeight="700" textAnchor="middle">
                                    {stat.key}
                                  </text>
                                </g>
                              );
                            })}
                            <line x1="50" y1="150" x2="520" y2="150" stroke="var(--border-color)" strokeWidth="1" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 4 Cols: Quick Calculator & Rate Controller */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }} className="admin-grid-span4">

                  {/* BỘ TÍNH TỶ GIÁ NHANH (QUICK CONVERTER) */}
                  <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <div style={{ backgroundColor: 'var(--bg-subtle-purple)', color: 'var(--purple-primary)', padding: '6px', borderRadius: '8px' }}>
                        <Calculator size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                          Tính Nhanh Giá Won ➔ VNĐ
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Áp dụng tỷ giá {krwRate}đ + {serviceFee}% phí dịch vụ
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Giá Store Hàn (Won ₩):</label>
                        <input
                          type="text"
                          value={calcWon}
                          onChange={(e) => setCalcWon(e.target.value)}
                          placeholder="VD: 25000"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: 'var(--text-dark)',
                            marginTop: '4px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle-purple)', borderRadius: '10px', border: '1px solid var(--purple-light)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--purple-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Giá Bán Khách Nhận (VNĐ):
                        </span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--purple-primary)', marginTop: '2px' }}>
                          {calcVnd} VNĐ
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${calcVnd} VNĐ`);
                          if (showToast) showToast('Đã sao chép giá VNĐ!', 'success');
                        }}
                        style={{
                          backgroundColor: 'var(--bg-ivory)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Sao chép giá báo khách
                      </button>
                    </div>
                  </div>

                  

                </div>
              </div>

              {/* RECENT ORDERS TABLE QUICK GLANCE */}
              <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: 'var(--purple-primary)' }} />
                    Đơn Hàng Mới Cập Nhật
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--purple-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Xem tất cả {orders.length} đơn <ChevronRight size={16} />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    Chưa có đơn hàng nào trong hệ thống.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-ivory)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                          <th style={{ padding: '10px 12px', fontWeight: 700 }}>Mã Đơn</th>
                          <th style={{ padding: '10px 12px', fontWeight: 700 }}>Khách Hàng</th>
                          <th style={{ padding: '10px 12px', fontWeight: 700 }}>Sản Phẩm</th>
                          <th style={{ padding: '10px 12px', fontWeight: 700 }}>Trạng Thái</th>
                          <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Tổng Tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} style={{ borderBottom: '1px solid var(--bg-ivory)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--purple-primary)' }}>{o.id}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--bg-dark-accent)' }}>{o.customerName || 'Khách'}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.customerPhone || ''}</div>
                            </td>
                            <td style={{ padding: '10px 12px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                              {o.productName || (o.items ? o.items.map(i => i.name).join(', ') : 'Đơn hàng')}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--bg-subtle-purple)', color: 'var(--purple-primary)', border: '1px solid var(--purple-light)' }}>
                                {o.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: 'var(--text-dark)' }}>
                              {((o.quote?.totalVnd || o.foreignPrice * krwRate) || 0).toLocaleString('vi-VN')} ₫
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS 8-STEPS */}
          {activeTab === 'orders' && (
            <AdminOrderManager />
          )}

          {/* TAB 3: PRODUCTS OLIVE YOUNG */}
          {activeTab === 'products' && (
            <AdminProductManager />
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#FFF', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold-primary)' }}>{orders.filter(o => o.paymentStatus === 'unpaid').length}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>Chờ thanh toán</div>
                </div>
                <div style={{ background: '#FFF', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981' }}>{orders.filter(o => o.paymentStatus === 'paid').length}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>Đã thanh toán</div>
                </div>
                <div style={{ background: '#FFF', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#EF4444' }}>{orders.filter(o => o.status === 'on_hold').length}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>Tạm dừng (on_hold)</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Danh sách cần xác nhận thanh toán</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px' }}>Mã đơn</th>
                        <th style={{ padding: '12px 16px' }}>Khách hàng</th>
                        <th style={{ padding: '12px 16px' }}>Ngân hàng</th>
                        <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--bg-ivory)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--purple-primary)' }}>{o.id}</td>
                          <td style={{ padding: '12px 16px' }}>{o.customerName || 'Khách'} ({o.customerPhone})</td>
                          <td style={{ padding: '12px 16px' }}>{o.bankName || 'VietQR'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: o.paymentStatus === 'paid' ? '#ECFDF5' : '#FEF3C7', color: o.paymentStatus === 'paid' ? '#059669' : '#D97706' }}>
                              {o.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ chuyển khoản'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {o.paymentStatus !== 'paid' ? (
                              <button
                                onClick={async () => {
                                  await updateDoc(doc(db, 'orders', o.id), {
                                    paymentStatus: 'paid',
                                    status: 'paid',
                                    paidAt: new Date().toISOString(),
                                    updatedAt: serverTimestamp()
                                  });
                                  if (showToast) showToast(`Đã duyệt thanh toán cho đơn ${o.id}!`, 'success');
                                }}
                                style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Xác nhận đã nhận tiền
                              </button>
                            ) : (
                              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.8rem' }}>✓ Đã hoàn tất</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar-responsive {
            left: 0 !important;
          }
          .admin-main-wrapper {
            margin-left: 260px;
          }
          .admin-hamburger-btn {
            display: none !important;
          }
          .admin-close-mobile-btn {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .admin-grid-span8 {
            grid-column: span 12 !important;
          }
          .admin-grid-span4 {
            grid-column: span 12 !important;
          }
          .admin-close-mobile-btn {
            display: block !important;
          }
        }
      `}</style>

      {/* 🤖 Embedded AI Admin Copilot Assistant */}
      <AdminAiCopilotWidget />

    </div>
  );
}
