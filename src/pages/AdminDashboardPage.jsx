import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductManager from '../components/AdminProductManager';
import AdminOrderManager from '../components/AdminOrderManager';
import { LogOut, RefreshCw, FileSpreadsheet, ShoppingBag } from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    isAdminAuthenticated, 
    logoutAdmin, 
    orders, 
    rates, 
    updateRates,
    publishToWeb,
    revertFromWeb
  } = useContext(AppContext);
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeMainTab, setActiveMainTab] = useState('orders'); // 'orders' | 'products'
  const [krwRateInput, setKrwRateInput] = useState(rates?.KRW?.rate || 19.5);
  const [rateUpdatedMsg, setRateUpdatedMsg] = useState(false);

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

  const handleUpdateRate = (e) => {
    e.preventDefault();
    const val = parseFloat(krwRateInput);
    if (!val || val <= 0) return;
    updateRates({ KRW: { ...rates.KRW, rate: val } });
    setRateUpdatedMsg(true);
    if (showToast) showToast('Đã cập nhật tỷ giá KRW thành công!', 'success');
    setTimeout(() => setRateUpdatedMsg(false), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', paddingBottom: '60px' }}>
      
      {/* Admin Header */}
      <header style={{ backgroundColor: '#1F2937', color: '#FFF', padding: '16px 0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
              ADMIN PORTAL
            </span>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', letterSpacing: '1px' }}>TAVY KOREA</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Action Buttons for Draft/Publish */}
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '16px' }}>
              <button 
                onClick={() => {
                  if (window.confirm('Khôi phục lại dữ liệu gốc (bản backup gần nhất đang chạy trên Website)? Các chỉnh sửa nháp sẽ bị xóa.')) {
                    revertFromWeb();
                    if (showToast) showToast('Đã khôi phục dữ liệu gần nhất!', 'info');
                  }
                }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.3)',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
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
                  backgroundColor: '#10B981', color: '#FFF', border: 'none',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Đồng bộ lên Website
              </button>
            </div>

            {/* Tỷ giá quick update in header */}
            <form onSubmit={handleUpdateRate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#D1D5DB', fontWeight: 600 }}>Tỷ Giá ₩:</span>
              <input
                type="number"
                step="0.1"
                value={krwRateInput}
                onChange={(e) => setKrwRateInput(e.target.value)}
                style={{ width: '60px', padding: '2px 6px', borderRadius: '4px', border: 'none', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}
              />
              <button type="submit" style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Lưu tỷ giá">
                <RefreshCw size={14} />
              </button>
            </form>

            <button
              onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#FCA5A5',
                border: '1px solid #EF4444',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '24px' }}>

        {/* Main Section Navigation Tabs */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveMainTab('orders')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeMainTab === 'orders' ? 'var(--purple-primary)' : '#FFF',
              color: activeMainTab === 'orders' ? '#FFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <ShoppingBag size={18} />
            <span>QUẢN LÝ ĐƠN HÀNG TRỌN GÓI ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('products')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeMainTab === 'products' ? 'var(--purple-primary)' : '#FFF',
              color: activeMainTab === 'products' ? '#FFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <FileSpreadsheet size={18} />
            <span>QUẢN LÝ DANH MỤC SẢN PHẨM</span>
          </button>
        </div>

        {activeMainTab === 'products' ? (
          <AdminProductManager />
        ) : (
          <AdminOrderManager />
        )}

      </div>
    </div>
  );
}
