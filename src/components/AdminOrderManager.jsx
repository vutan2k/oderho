import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ORDER_STATUSES, getStatusConfig } from '../data/orderStatuses';
import CascadingAddressSelector from './CascadingAddressSelector';
import {
  Search, Edit3,
  Truck, CheckCircle, PackageCheck, AlertCircle, Printer,
  Download, ShieldCheck, X,
  Phone, MapPin, CheckCircle2, Trash2
} from 'lucide-react';

export default function AdminOrderManager() {
  const { orders, rates, updateOrderStatus, updateOrderQuote, updateOrderTracking, deleteOrder } = useContext(AppContext);
  const showToast = useToast();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Editing / Detail Modal State
  const [activeModalOrder, setActiveModalOrder] = useState(null); // Full order object
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [orderForm, setOrderForm] = useState({});

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
  const formatWon = (n) => `₩${(n || 0).toLocaleString('vi-VN')}`;

  const getOrderProductName = (o) => o.items ? `[${o.items.length} món] ` + o.items.map(i => i.name).join(' + ') : (o.productName || '');
  const getOrderForeignPrice = (o) => o.items ? o.items.reduce((sum, i) => sum + (i.foreignPrice * i.qty), 0) : (o.foreignPrice || 0);
  const getOrderQty = (o) => o.items ? o.items.reduce((sum, i) => sum + i.qty, 0) : (o.qty || 1);
  const getOrderImage = (o) => o.items && o.items.length > 0 ? o.items[0].productImage : (o.productImage || '');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const term = searchTerm.toLowerCase().trim();
      const oName = getOrderProductName(o);
      const matchSearch =
        !term ||
        (o.id && o.id.toLowerCase().includes(term)) ||
        (o.customerName && o.customerName.toLowerCase().includes(term)) ||
        (o.customerPhone && o.customerPhone.includes(term)) ||
        (oName.toLowerCase().includes(term)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(term));
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus) {
      if (showToast) showToast('Vui lòng chọn trạng thái cần đổi!', 'error');
      return;
    }
    if (selectedOrderIds.length === 0) {
      if (showToast) showToast('Chưa chọn đơn hàng nào!', 'error');
      return;
    }

    selectedOrderIds.forEach((id) => {
      updateOrderStatus(id, bulkStatus);
    });

    const statusObj = getStatusConfig(bulkStatus);
    if (showToast) showToast(`Đã cập nhật ${selectedOrderIds.length} đơn sang "${statusObj.label}" thành công!`, 'success');
    setSelectedOrderIds([]);
    setBulkStatus('');
  };

  // Open Edit / Báo giá / Invoice Modal
  const handleOpenEditModal = (order, print = false) => {
    const fPrice = getOrderForeignPrice(order);
    const qty = getOrderQty(order);
    const baseVnd = Math.round(fPrice * krwRate * qty);
    const taxVnd = order.quote?.taxWebVnd || Math.round(baseVnd * 0.05);
    const serviceVnd = order.quote?.serviceFeeVnd || Math.round(baseVnd * 0.05);
    const shipFeeVnd = order.quote?.shippingWeightFeeVnd || 90000;

    setOrderForm({
      ...order,
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      productName: getOrderProductName(order),
      foreignPrice: fPrice,
      qty: qty,
      trackingCode: order.trackingCode || '',
      status: order.status || 'pending',
      adminNote: order.adminNote || 'Hàng sẵn có tại Korea Store, chuẩn bị đóng gói vận chuyển Air.',
      rawVnd: baseVnd,
      taxWebVnd: taxVnd,
      serviceFeeVnd: serviceVnd,
      shippingWeightFeeVnd: shipFeeVnd,
    });
    setIsPrintMode(print);
    setActiveModalOrder(order);
  };

  const handleSaveOrderChanges = () => {
    if (!activeModalOrder) return;
    const totalCalc =
      Number(orderForm.rawVnd) +
      Number(orderForm.taxWebVnd) +
      Number(orderForm.serviceFeeVnd) +
      Number(orderForm.shippingWeightFeeVnd);

    // Save Status & Tracking
    updateOrderStatus(activeModalOrder.id, orderForm.status);
    updateOrderTracking(activeModalOrder.id, {
      status: orderForm.status,
      trackingCode: orderForm.trackingCode,
      note: orderForm.adminNote
    });

    // Save Quote
    updateOrderQuote(activeModalOrder.id, {
      rawVnd: Number(orderForm.rawVnd),
      taxWebVnd: Number(orderForm.taxWebVnd),
      serviceFeeVnd: Number(orderForm.serviceFeeVnd),
      shippingWeightFeeVnd: Number(orderForm.shippingWeightFeeVnd),
      note: orderForm.adminNote,
      totalVnd: totalCalc
    });

    if (showToast) showToast(`Đã lưu cập nhật toàn bộ đơn hàng ${activeModalOrder.id} thành công!`, 'success');
    setActiveModalOrder(null);
  };

  // Quick 1-Click Stepper Advance (Reserved for fast stepper button)
  const _handleQuickNextStatus = (order) => {
    const allStatuses = Object.keys(ORDER_STATUSES).filter(k => k !== 'cancelled');
    const currentIndex = allStatuses.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < allStatuses.length - 1) {
      const nextKey = allStatuses[currentIndex + 1];
      updateOrderStatus(order.id, nextKey);
      const nextCfg = getStatusConfig(nextKey);
      if (showToast) showToast(`Đã chuyển đơn ${order.id} sang "${nextCfg.shortLabel}"`, 'info');
    }
  };

  // Export CSV of Orders
  const handleExportOrdersCSV = () => {
    const header = "MÃ ĐƠN HÀNG,TÊN KHÁCH HÀNG,SỐ ĐIỆN THOẠI,ĐỊA CHỈ GIAO,SẢN PHẨM,GIÁ WON,SL,TỔNG TIỀN VNĐ,TRẠNG THÁI,MÃ VẬN ĐƠN AIR\n";
    const rows = filteredOrders.map(o => {
      const st = getStatusConfig(o.status).label;
      const fPrice = getOrderForeignPrice(o);
      const qty = getOrderQty(o);
      const oName = getOrderProductName(o);
      const total = o.quote ? o.quote.totalVnd : Math.round(fPrice * krwRate * qty);
      return `"${o.id}","${o.customerName || ''}","${o.customerPhone || ''}","${(o.customerAddress || '').replace(/"/g, '""')}","${(oName || '').replace(/"/g, '""')}",${fPrice || 0},${qty || 1},${total},"${st}","${o.trackingCode || ''}"`;
    }).join('\n');

    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TAVY_KOREA_DON_HANG_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    if (showToast) showToast('Đã tải tệp báo cáo danh sách đơn hàng (.CSV)', 'success');
  };

  return (
    <div>
      {/* 📊 KPI COUNTERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { title: 'TỔNG ĐƠN HÀNG', count: orders.length, color: 'var(--purple-primary)', bg: '#F5F3FF', icon: ShieldCheck },
          { title: 'ĐÃ ĐẶT HÀNG / CHỜ CỌC', count: orders.filter((o) => o.status === 'pending').length, color: '#3B82F6', bg: '#EFF6FF', icon: AlertCircle },
          { title: 'ĐÃ CỌC / CHẤP NHẬN', count: orders.filter((o) => ['deposit_paid', 'accepted'].includes(o.status)).length, color: '#D97706', bg: '#FEF3C7', icon: CheckCircle },
          { title: 'ĐANG XỬ LÝ & VẬN CHUYỂN', count: orders.filter((o) => ['purchasing', 'customs_kr', 'customs_vn', 'delivering'].includes(o.status)).length, color: '#0891B2', bg: '#CFFAFE', icon: Truck },
          { title: 'HOÀN THÀNH', count: orders.filter((o) => o.status === 'completed').length, color: '#059669', bg: '#D1FAE5', icon: PackageCheck }
        ].map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div key={idx} style={{ backgroundColor: '#FFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.5px' }}>{kpi.title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color, marginTop: '4px' }}>{kpi.count}</div>
              </div>
              <div style={{ backgroundColor: kpi.bg, color: kpi.color, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🛠️ TOOLBAR & BULK ACTIONS */}
      <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filterStatus === 'all' ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
              backgroundColor: filterStatus === 'all' ? 'var(--purple-primary)' : '#FFF',
              color: filterStatus === 'all' ? '#FFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Tất cả ({orders.length})
          </button>
          {Object.keys(ORDER_STATUSES).map((stKey) => {
            const st = ORDER_STATUSES[stKey];
            const cnt = orders.filter((o) => o.status === stKey).length;
            const isSelected = filterStatus === stKey;
            return (
              <button
                key={stKey}
                onClick={() => setFilterStatus(stKey)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? `2px solid ${st.borderColor}` : '1px solid #E5E7EB',
                  backgroundColor: isSelected ? st.color : '#FFF',
                  color: isSelected ? '#FFF' : '#374151',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{st.shortLabel}</span>
                <span style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#F3F4F6', color: isSelected ? '#FFF' : '#6B7280', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Bulk Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Tên khách, SĐT, Sản phẩm, Mã vận đơn Air..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
            />
          </div>

          {/* Bulk Operations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {selectedOrderIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F5F3FF', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--purple-primary)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--purple-primary)' }}>
                  Đã chọn {selectedOrderIds.length} đơn
                </span>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  <option value="">-- Đổi trạng thái hàng loạt --</option>
                  {Object.keys(ORDER_STATUSES).map((k) => (
                    <option key={k} value={k}>{ORDER_STATUSES[k].label}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkStatusChange}
                  style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Áp Dụng
                </button>
              </div>
            )}

            <button
              onClick={handleExportOrdersCSV}
              style={{ backgroundColor: '#FFF', color: '#374151', border: '1px solid #D1D5DB', padding: '9px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={16} /> Xuất Báo Cáo CSV
            </button>
          </div>

        </div>

      </div>

      {/* 📋 MAIN ORDERS TABLE */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB', color: '#4B5563', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px', width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                  />
                </th>
                <th style={{ padding: '14px 16px' }}>Mã Đơn & Ngày</th>
                <th style={{ padding: '14px 16px' }}>Khách Hàng (Nhận Hàng)</th>
                <th style={{ padding: '14px 16px', minWidth: '220px' }}>Sản Phẩm Mua Hộ</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Tổng Thanh Toán</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Trạng Thái Đơn Hàng</th>
                <th style={{ padding: '14px 16px' }}>Mã Vận Đơn Air</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    Chưa có đơn hàng nào khớp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const stCfg = getStatusConfig(order.status);
                  const isSelected = selectedOrderIds.includes(order.id);
                  const totalVndVal = order.quote ? order.quote.totalVnd : Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1));

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: isSelected ? '#F5F3FF' : '#FFF',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(order.id)}
                        />
                      </td>

                      {/* Mã đơn */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--purple-primary)', fontSize: '0.92rem', fontFamily: 'monospace' }}>
                          {order.id}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{order.customerName || 'Khách vãng lai'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {order.customerPhone || 'Chưa có SĐT'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.customerAddress}>
                          <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />
                          {order.customerAddress || 'Chưa cập nhật địa chỉ'}
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {getOrderImage(order) ? (
                            <img 
                              src={getOrderImage(order)} 
                              alt="product" 
                              style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }} 
                            />
                          ) : (
                            <div style={{ width: '42px', height: '42px', borderRadius: '6px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.7rem', fontWeight: 700 }}>
                              No Pic
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: '#111827', lineHeight: 1.3, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {getOrderProductName(order) || 'Sản phẩm mua hộ Hàn Quốc'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--purple-primary)', fontWeight: 600, marginTop: '4px' }}>
                              Giá Won: {formatWon(getOrderForeignPrice(order))} | Số lượng: x{getOrderQty(order)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tổng VND */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.98rem' }}>
                          {formatVnd(totalVndVal)}
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                          {order.status === 'pending' ? (
                            <span style={{ color: '#D97706', fontWeight: 600 }}>
                              Cọc 70%: {formatVnd(Math.round(totalVndVal * 0.7))}
                            </span>
                          ) : order.status === 'deposit_paid' ? (
                            <span style={{ color: '#059669', fontWeight: 700, backgroundColor: '#D1FAE5', padding: '2px 6px', borderRadius: '4px' }}>
                              Đã cọc thành công
                            </span>
                          ) : order.status === 'completed' ? (
                            <span style={{ color: '#10B981', fontWeight: 700, backgroundColor: '#E0F2FE', padding: '2px 6px', borderRadius: '4px' }}>
                              Đã tất toán 100%
                            </span>
                          ) : (
                            <span style={{ color: '#6B7280', fontWeight: 500 }}>
                              Cọc 70%: {formatVnd(Math.round(totalVndVal * 0.7))}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Trạng thái Dropdown + Quick Advance */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '20px',
                              border: `1.5px solid ${stCfg.borderColor}`,
                              backgroundColor: stCfg.bgColor,
                              color: stCfg.color,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            {Object.keys(ORDER_STATUSES).map((k) => (
                              <option key={k} value={k}>{ORDER_STATUSES[k].label}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Mã vận đơn Air */}
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="text"
                          placeholder="Mã vận đơn..."
                          defaultValue={order.trackingCode || ''}
                          onBlur={(e) => updateOrderTracking(order.id, { trackingCode: e.target.value })}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.8rem',
                            width: '130px',
                            fontFamily: 'monospace',
                            fontWeight: 700
                          }}
                        />
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleOpenEditModal(order, false)}
                            style={{
                              backgroundColor: 'var(--purple-primary)',
                              color: '#FFF',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Edit3 size={13} /> Sửa Đơn
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(order, true)}
                            title="Xem & In hóa đơn"
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: '1px solid #D1D5DB',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Printer size={13} />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn XÓA ĐƠN HÀNG ${order.id} này? Hành động này không thể hoàn tác.`)) {
                                deleteOrder(order.id);
                                if (showToast) showToast(`Đã xóa đơn hàng ${order.id} thành công!`, 'success');
                              }
                            }}
                            title="Xóa Đơn Hàng"
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#EF4444',
                              border: '1px solid #FCA5A5',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ MODAL SỬA ĐƠN HÀNG & IN HÓA ĐƠN ═══════════ */}
      {activeModalOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px', zIndex: 99999, overflowY: 'auto' }} onClick={() => setActiveModalOrder(null)}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', width: '100%', maxWidth: '780px', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#F5F3FF', color: 'var(--purple-primary)', padding: '4px 10px', borderRadius: '12px' }}>
                  {isPrintMode ? '🖨️ IN HÓA ĐƠN GIAO NHẬN' : '✏️ CHỈNH SỬA & BÁO GIÁ ĐƠN HÀNG'}
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', color: '#111827', fontWeight: 800 }}>
                  MÃ ĐƠN HÀNG: {activeModalOrder.id}
                </h3>
              </div>
              <button onClick={() => setActiveModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <X size={24} />
              </button>
            </div>

            {/* Print View vs Edit Form View */}
            {isPrintMode ? (
              <div id="printable-invoice" style={{ backgroundColor: '#FAFAFA', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #111827', paddingBottom: '12px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--purple-primary)' }}>TAVY KOREA</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#4B5563' }}>Dịch Vụ Mua Hộ Mỹ Phẩm & Thực Phẩm Chức Năng Hàn Quốc</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>HÓA ĐƠN BÁN HÀNG</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#6B7280' }}>Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#374151' }}>THÔNG TIN KHÁCH HÀNG:</strong>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>{orderForm.customerName}</div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>SĐT: {orderForm.customerPhone}</div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>Địa chỉ: {orderForm.customerAddress}</div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#374151' }}>THÔNG TIN ĐƠN HÀNG:</strong>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '4px' }}>Trạng thái: <strong>{getStatusConfig(orderForm.status).label}</strong></div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>Mã Vận Đơn Air: <strong>{orderForm.trackingCode || 'Đang cập nhật'}</strong></div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#E5E7EB', color: '#111827' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Sản phẩm</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Giá Won</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>SL</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Thành tiền VNĐ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', fontWeight: 600 }}>{orderForm.productName}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', textAlign: 'right' }}>{formatWon(orderForm.foreignPrice)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', textAlign: 'center' }}>x{orderForm.qty}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 700 }}>{formatVnd(orderForm.rawVnd)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '6px 12px', textAlign: 'right', color: '#6B7280' }}>Thuế Web Hàn (5%):</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{formatVnd(orderForm.taxWebVnd)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '6px 12px', textAlign: 'right', color: '#6B7280' }}>Phí dịch vụ mua hộ (5%):</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{formatVnd(orderForm.serviceFeeVnd)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '6px 12px', textAlign: 'right', color: '#6B7280' }}>Cước Air cân nặng:</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{formatVnd(orderForm.shippingWeightFeeVnd)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#F5F3FF', fontWeight: 800, fontSize: '1rem' }}>
                      <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--purple-primary)' }}>TỔNG THANH TOÁN:</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--purple-primary)' }}>
                        {formatVnd(Number(orderForm.rawVnd) + Number(orderForm.taxWebVnd) + Number(orderForm.serviceFeeVnd) + Number(orderForm.shippingWeightFeeVnd))}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #D1D5DB' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Người Lập Hóa Đơn</div>
                    <div style={{ marginTop: '40px', fontWeight: 700, fontSize: '0.85rem' }}>TAVY Korea Admin</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Xác Nhận Khách Hàng</div>
                    <div style={{ marginTop: '40px', fontWeight: 700, fontSize: '0.85rem' }}>{orderForm.customerName}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Form Chỉnh Sửa Thông Tin Khách Hàng & Đơn Hàng */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    1. THÔNG TIN KHÁCH HÀNG & GIAO HÀNG
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Họ & Tên Khách Hàng</label>
                      <input
                        type="text"
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Số Điện Thoại</label>
                      <input
                        type="text"
                        value={orderForm.customerPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <CascadingAddressSelector
                      initialAddress={orderForm.customerAddress}
                      onChange={(addrInfo) => setOrderForm(prev => ({ ...prev, customerAddress: addrInfo.fullAddress }))}
                      required={false}
                    />
                  </div>
                </div>

                {/* Form Chi Tiết Báo Giá */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    2. BẢNG TÍNH GIÁ CHI TIẾT & PHÍ VẬN CHUYỂN
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Tiền hàng gốc (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.rawVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, rawVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Thuế Web Hàn 5% (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.taxWebVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, taxWebVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Phí dịch vụ 5% (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.serviceFeeVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, serviceFeeVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Cước Air Cân Nặng (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.shippingWeightFeeVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, shippingWeightFeeVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>TỔNG BÁO GIÁ ĐƠN:</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
                        {formatVnd(Number(orderForm.rawVnd) + Number(orderForm.taxWebVnd) + Number(orderForm.serviceFeeVnd) + Number(orderForm.shippingWeightFeeVnd))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.82rem', color: '#059669' }}>CỌC ĐÃ DUYỆT (50%):</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                        {formatVnd(Math.round((Number(orderForm.rawVnd) + Number(orderForm.taxWebVnd) + Number(orderForm.serviceFeeVnd) + Number(orderForm.shippingWeightFeeVnd)) * 0.5))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Trạng Thái & Ghi Chú Admin */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    3. TRẠNG THÁI & GHI CHÚ QUẢN TRỊ
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Cập nhật trạng thái</label>
                      <select
                        value={orderForm.status}
                        onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', fontWeight: 700 }}
                      >
                        {Object.keys(ORDER_STATUSES).map((k) => (
                          <option key={k} value={k}>{ORDER_STATUSES[k].label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Mã vận đơn Air Cargo</label>
                      <input
                        type="text"
                        value={orderForm.trackingCode}
                        onChange={(e) => setOrderForm({ ...orderForm, trackingCode: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Ghi chú gửi khách hàng</label>
                    <textarea
                      rows={2}
                      value={orderForm.adminNote}
                      onChange={(e) => setOrderForm({ ...orderForm, adminNote: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
              {isPrintMode ? (
                <>
                  <button onClick={() => setIsPrintMode(false)} style={{ backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                    Quay Lại Chỉnh Sửa
                  </button>
                  <button onClick={() => window.print()} style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={16} /> Thực Hiện In Hóa Đơn
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setActiveModalOrder(null)} style={{ backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                    Hủy Bỏ
                  </button>
                  <button onClick={handleSaveOrderChanges} style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '10px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Lưu Cập Nhật Đơn Hàng
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
