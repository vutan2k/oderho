import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductManager from '../components/AdminProductManager';
import {
  LogOut, Search, Edit3,
  RefreshCw, FileSpreadsheet, ShoppingBag
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    isAdminAuthenticated, 
    logoutAdmin, 
    orders, 
    rates, 
    updateRates, 
    updateOrderStatus, 
    updateOrderQuote 
  } = useContext(AppContext);
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeMainTab, setActiveMainTab] = useState('orders'); // 'orders' | 'products'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [krwRateInput, setKrwRateInput] = useState(rates?.KRW?.rate || 19.5);
  const [rateUpdatedMsg, setRateUpdatedMsg] = useState(false);

  // Quote editing modal / inline state
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    rawVnd: 0,
    taxWebVnd: 0,
    serviceFeeVnd: 0,
    shippingWeightKg: 0.5,
    shippingWeightFeeVnd: 90000,
    note: ''
  });



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

  const handleOpenQuoteModal = (order) => {
    const krwRate = rates?.KRW?.rate || 19.5;
    const baseVnd = Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1));
    const taxVnd = Math.round(baseVnd * 0.05); // 5% thuế ước tính
    const serviceVnd = Math.round(baseVnd * 0.05); // 5% phí mua hộ

    setEditingOrderId(order.id);
    setQuoteForm({
      rawVnd: baseVnd,
      taxWebVnd: taxVnd,
      serviceFeeVnd: serviceVnd,
      shippingWeightKg: order.quote?.shippingWeightKg || 0.5,
      shippingWeightFeeVnd: order.quote?.shippingWeightFeeVnd || 90000,
      note: order.adminNote || 'Hàng sẵn có tại Korea Store.'
    });
  };

  const handleSaveQuote = (orderId) => {
    const totalCalculated = 
      Number(quoteForm.rawVnd) + 
      Number(quoteForm.taxWebVnd) + 
      Number(quoteForm.serviceFeeVnd) + 
      Number(quoteForm.shippingWeightFeeVnd);

    updateOrderQuote(orderId, {
      ...quoteForm,
      totalVnd: totalCalculated
    }, totalCalculated);

    setEditingOrderId(null);
    if (showToast) showToast(`Đã gửi báo giá đơn ${orderId} thành công!`, 'success');
  };



  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch = 
      (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(searchTerm)) ||
      (o.productName && o.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

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
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
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
            <span>QUẢN LÝ ĐƠN HÀNG ({orders.length})</span>
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
            <span>QUẢN LÝ SẢN PHẨM</span>
          </button>
        </div>

        {activeMainTab === 'products' ? (
          <AdminProductManager />
        ) : (
          <>
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
                    <th style={{ padding: '14px 16px' }}>Mã Đơn</th>
                    <th style={{ padding: '14px 16px' }}>Khách Hàng</th>
                    <th style={{ padding: '14px 16px' }}>Sản Phẩm Hàn Quốc</th>
                    <th style={{ padding: '14px 16px' }}>Tổng Thanh Toán</th>
                    <th style={{ padding: '14px 16px' }}>Trạng Thái</th>
                    <th style={{ padding: '14px 16px' }}>Mã Vận Đơn Air</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const isEditing = editingOrderId === order.id;

                    return (
                      <React.Fragment key={order.id}>
                        <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--purple-primary)' }}>
                            {order.id}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{order.customerName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{order.customerPhone}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{order.customerAddress}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{order.productName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                              Giá gốc: ₩{(order.foreignPrice || 0).toLocaleString('vi-VN')} | SL: x{order.qty}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>
                            {formatVnd(order.quote ? order.quote.totalVnd : Math.round((order.foreignPrice || 0) * (rates?.KRW?.rate || 19.5) * (order.qty || 1)))}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, { status: e.target.value })}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: '1px solid #D1D5DB'
                              }}
                            >
                              <option value="pending">Chờ cọc</option>
                              <option value="quoted">Đã cọc</option>
                              <option value="purchased">Đã mua tại Hàn</option>
                              <option value="transit">Đang về Việt Nam</option>
                              <option value="completed">Giao thành công</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <input
                              type="text"
                              placeholder="Nhập mã vận đơn..."
                              defaultValue={order.trackingCode || ''}
                              onBlur={(e) => updateOrderStatus(order.id, { trackingCode: e.target.value })}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #D1D5DB',
                                fontSize: '0.8rem',
                                width: '130px',
                                fontFamily: 'monospace'
                              }}
                            />
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleOpenQuoteModal(order)}
                              style={{
                                backgroundColor: 'var(--purple-primary)',
                                color: '#FFF',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Edit3 size={14} /> Sửa Báo Giá
                            </button>
                          </td>
                        </tr>

                        {/* Inline Form Sửa Báo Giá */}
                        {isEditing && (
                          <tr style={{ backgroundColor: '#FDFBFF' }}>
                            <td colSpan={7} style={{ padding: '20px', borderBottom: '2px solid var(--purple-primary)' }}>
                              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--purple-primary)' }}>
                                  BẢNG TÍNH GIÁ CHI TIẾT ĐƠN HÀNG {order.id}
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Tiền hàng gốc (VNĐ)</label>
                                    <input
                                      type="number"
                                      value={quoteForm.rawVnd}
                                      onChange={(e) => setQuoteForm({ ...quoteForm, rawVnd: Number(e.target.value) })}
                                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Thuế Web Hàn 5% (VNĐ)</label>
                                    <input
                                      type="number"
                                      value={quoteForm.taxWebVnd}
                                      onChange={(e) => setQuoteForm({ ...quoteForm, taxWebVnd: Number(e.target.value) })}
                                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Phí mua hộ 5% (VNĐ)</label>
                                    <input
                                      type="number"
                                      value={quoteForm.serviceFeeVnd}
                                      onChange={(e) => setQuoteForm({ ...quoteForm, serviceFeeVnd: Number(e.target.value) })}
                                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Cước Air Cân Nặng (VNĐ)</label>
                                    <input
                                      type="number"
                                      value={quoteForm.shippingWeightFeeVnd}
                                      onChange={(e) => setQuoteForm({ ...quoteForm, shippingWeightFeeVnd: Number(e.target.value) })}
                                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                    />
                                  </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--purple-primary)' }}>
                                      TỔNG BÁO GIÁ: {formatVnd(Number(quoteForm.rawVnd) + Number(quoteForm.taxWebVnd) + Number(quoteForm.serviceFeeVnd) + Number(quoteForm.shippingWeightFeeVnd))}
                                    </strong>
                                  </div>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                      onClick={() => setEditingOrderId(null)}
                                      className="btn-outline"
                                      style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                                    >
                                      Hủy
                                    </button>
                                    <button
                                      onClick={() => handleSaveQuote(order.id)}
                                      className="btn-gold"
                                      style={{ padding: '6px 20px', fontSize: '0.82rem' }}
                                    >
                                      Lưu Báo Giá
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
