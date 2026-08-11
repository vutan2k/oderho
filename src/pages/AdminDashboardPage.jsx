import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  Package, Clock, LogOut, Search, Edit3, 
  Save, RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { orders, isAdminAuthenticated, logoutAdmin, updateOrderTracking, rates, updateRates } = useContext(AppContext);
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  
  // State form chỉnh sửa đơn
  const [newStatus, setNewStatus] = useState('');
  const [newTrackingCode, setNewTrackingCode] = useState('');
  const [newNote, setNewNote] = useState('');


  // State tỷ giá KRW
  const [krwRateInput, setKrwRateInput] = useState(rates?.KRW?.rate || 19.5);
  const [rateUpdatedMsg, setRateUpdatedMsg] = useState(false);

  if (!isAdminAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);


  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewTrackingCode(order.trackingCode || '');
    setNewNote(order.adminNote || '');
  };

  const handleSaveTracking = (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    updateOrderTracking(editingOrder.id, {
      status: newStatus,
      trackingCode: newTrackingCode,
      note: newNote
    });

    setEditingOrder(null);
  };

  const handleUpdateRate = (e) => {
    e.preventDefault();
    const updatedRates = {
      ...rates,
      KRW: { ...rates.KRW, rate: parseFloat(krwRateInput) }
    };
    updateRates(updatedRates);
    setRateUpdatedMsg(true);
    setTimeout(() => setRateUpdatedMsg(false), 3000);
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.productName && o.productName.toLowerCase().includes(q)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: '1. Chờ đặt cọc', color: '#F59E0B', bg: '#FEF3C7' };
      case 'quoted':
        return { label: '2. Đã nhận cọc', color: '#3B82F6', bg: '#DBEAFE' };
      case 'purchased':
        return { label: '3. Đã mua tại Hàn', color: '#8B5CF6', bg: '#EDE9FE' };
      case 'transit':
        return { label: '4. Đang về Việt Nam', color: '#EC4899', bg: '#FCE7F3' };
      case 'completed':
        return { label: '5. Đã giao thành công', color: '#10B981', bg: '#D1FAE5' };
      default:
        return { label: status, color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', paddingBottom: '60px' }}>
      
      {/* Admin Header */}
      <header style={{ backgroundColor: '#1F2937', color: '#FFF', padding: '16px 0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/tavy-logo.jpg" alt="TAVY Logo" style={{ height: '36px', borderRadius: '6px' }} />
            <span style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
              ADMIN PORTAL
            </span>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', letterSpacing: '1px' }}>TAVY KOREA</h1>
          </div>
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={16} /> Đăng xuất Admin
          </button>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '30px' }}>
        
        {/* Top Controls & Tỷ giá */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          
          {/* Thống kê đơn hàng */}
          <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', marginBottom: '14px' }}>TỔNG QUAN ĐƠN HÀNG</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {[
                { key: 'pending', label: 'Chờ cọc', count: orders.filter(o => o.status === 'pending').length, color: '#F59E0B' },
                { key: 'quoted', label: 'Đã cọc', count: orders.filter(o => o.status === 'quoted').length, color: '#3B82F6' },
                { key: 'purchased', label: 'Đã mua Hàn', count: orders.filter(o => o.status === 'purchased').length, color: '#8B5CF6' },
                { key: 'transit', label: 'Đang về VN', count: orders.filter(o => o.status === 'transit').length, color: '#EC4899' },
                { key: 'completed', label: 'Đã giao', count: orders.filter(o => o.status === 'completed').length, color: '#10B981' }
              ].map(st => (
                <div key={st.key} style={{ textAlign: 'center', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: st.color }}>{st.count}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cập nhật tỷ giá Won */}
          <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={16} /> TỶ GIÁ WON (KRW/VND)
            </h3>
            <form onSubmit={handleUpdateRate} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                step="0.1"
                value={krwRateInput}
                onChange={(e) => setKrwRateInput(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Lưu Tỷ Giá</button>
            </form>
            {rateUpdatedMsg && <p style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '6px', fontWeight: 600 }}>✓ Đã cập nhật tỷ giá thành công!</p>}
          </div>

        </div>

        {/* Toolbar Lọc & Tìm kiếm */}
        <div style={{ backgroundColor: '#FFF', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ cọc' },
              { id: 'quoted', label: 'Đã cọc' },
              { id: 'purchased', label: 'Đã mua Hàn' },
              { id: 'transit', label: 'Đang về VN' },
              { id: 'completed', label: 'Đã giao' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: filterStatus === tab.id ? '1px solid var(--purple-primary)' : '1px solid #E5E7EB',
                  backgroundColor: filterStatus === tab.id ? 'var(--purple-primary)' : '#FFF',
                  color: filterStatus === tab.id ? '#FFF' : '#374151',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
            />
          </div>

        </div>

        {/* Bảng Danh Sách Đơn Hàng */}
        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 16px' }}>MÃ ĐƠN HÀNG</th>
                <th style={{ padding: '14px 16px' }}>SẢN PHẨM</th>
                <th style={{ padding: '14px 16px' }}>KHÁCH HÀNG</th>
                <th style={{ padding: '14px 16px' }}>TỔNG TIỀN</th>
                <th style={{ padding: '14px 16px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '14px 16px' }}>MÃ VẬN ĐƠN (AIR)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const stInfo = getStatusInfo(order.status);
                  const krwRate = rates?.KRW?.rate || 19.5;
                  const estimatedVnd = Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1));
                  const displayTotal = order.quote ? order.quote.totalVnd : estimatedVnd;

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--purple-primary)' }}>
                        {order.id}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{order.productName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                          {order.brand} (x{order.qty || 1})
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#374151' }}>{order.customerName || 'Khách lẻ'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{order.userEmail || order.customerPhone}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>
                        {formatVnd(displayTotal)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          backgroundColor: stInfo.bg,
                          color: stInfo.color,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-block'
                        }}>
                          {stInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {order.trackingCode ? (
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#F3F4F6', padding: '3px 8px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                            {order.trackingCode}
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '0.78rem', italic: 'true' }}>Chưa có mã</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="btn-gold"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <Edit3 size={13} /> Cập nhật
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Cập Nhật Đơn Hàng */}
      {editingOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '480px',
            padding: '28px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Cập Nhật Đơn Hàng: <span style={{ color: 'var(--purple-primary)' }}>{editingOrder.id}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '20px' }}>
              Sản phẩm: {editingOrder.productName}
            </p>

            <form onSubmit={handleSaveTracking}>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  1. Trạng Thái Tiến Trình
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                >
                  <option value="pending">1. Chờ đặt cọc</option>
                  <option value="quoted">2. Đã nhận cọc (Xác nhận đơn)</option>
                  <option value="purchased">3. Đã mua hàng tại Hàn Quốc</option>
                  <option value="transit">4. Đang bay về Việt Nam (Đang vận chuyển)</option>
                  <option value="completed">5. Đã giao hàng thành công</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  2. Mã Vận Đơn Vận Chuyển Air Hàn - Việt
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: AIR-KR892103"
                  value={newTrackingCode}
                  onChange={(e) => setNewTrackingCode(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  3. Ghi Chú Dành Cho Khách Hàng (Tùy chọn)
                </label>
                <textarea
                  rows="3"
                  placeholder="Ví dụ: Đã mua xong tại Store Seoul, dự kiến về HN ngày 15/08."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#FFF', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn-gold"
                  style={{ padding: '10px 22px', fontSize: '0.85rem' }}
                >
                  <Save size={15} /> Lưu Cập Nhật
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
