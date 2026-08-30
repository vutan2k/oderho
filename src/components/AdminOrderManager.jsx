import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ORDER_STATUSES, getStatusConfig } from '../data/orderStatuses';
import { getOrderTotalVnd } from '../utils/priceCalculator';
import {
  Search, Edit3, Trash2,
  CheckCircle, AlertCircle,
  Phone, MapPin, Video, FileText, Plane,
  Sparkles, Check,
  CreditCard, LayoutGrid, List, Plus,
  X, ChevronRight, Clock, Box
} from 'lucide-react';

// 5 CỘT PHÂN LUỒNG KANBAN CHUẨN E-COMMERCE
const KANBAN_COLUMNS = [
  {
    id: 'quote_needed',
    title: '1. Cần Báo Giá',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    badgeColor: '#DC2626',
    statuses: ['pending']
  },
  {
    id: 'awaiting_deposit',
    title: '2. Chờ Cọc / Thanh Toán',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    badgeColor: '#D97706',
    statuses: ['quoted']
  },
  {
    id: 'need_purchase',
    title: '3. Cần Đặt Mua Tại Hàn',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    badgeColor: '#2563EB',
    statuses: ['deposit_paid', 'paid', 'purchasing_korea']
  },
  {
    id: 'shipping_flow',
    title: '4. Đang Vận Chuyển Về VN',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    badgeColor: '#7C3AED',
    statuses: ['korea_warehouse', 'shipping_vietnam', 'vietnam_warehouse']
  },
  {
    id: 'completed_flow',
    title: '5. Hoàn Tất / Đã Giao',
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    badgeColor: '#059669',
    statuses: ['completed']
  }
];

export default function AdminOrderManager({ isDark: isDarkProp } = {}) {
  const isDark = isDarkProp !== undefined
    ? isDarkProp
    : (typeof window !== 'undefined' && localStorage.getItem('tavy_admin_theme') === 'dark');

  const {
    orders,
    rates,
    updateOrderStatus,
    updateOrderQuote,
    updateOrderTracking,
    deleteOrder,
    createManualOrder
  } = useContext(AppContext);
  const showToast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [activeDrawerOrder, setActiveDrawerOrder] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form tạo đơn thủ công
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerNote: '',
    adminNote: 'Đơn hàng mua hộ trực tiếp theo yêu cầu.',
    status: 'deposit_paid',
    items: [{ name: '', foreignPrice: '', qty: 1 }]
  });

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFee = rates?.serviceFeePercent || 5;

  // Lọc danh sách đơn hàng theo từ khoá
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.trim().toLowerCase();
    return orders.filter(o =>
      (o.id && o.id.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.includes(term)) ||
      (o.customerAddress && o.customerAddress.toLowerCase().includes(term))
    );
  }, [orders, searchTerm]);

  // Phân chia đơn hàng vào 5 cột Kanban
  const kanbanData = useMemo(() => {
    const map = {};
    KANBAN_COLUMNS.forEach(col => {
      map[col.id] = filteredOrders.filter(o => col.statuses.includes(o.status));
    });
    return map;
  }, [filteredOrders]);

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
    if (showToast) showToast('Đã sao chép vào bộ nhớ tạm!', 'info');
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (showToast) {
        const cfg = getStatusConfig(newStatus);
        showToast(`Đã chuyển đơn #${orderId} sang "${cfg?.label || newStatus}"`, 'success');
      }
      if (activeDrawerOrder && activeDrawerOrder.id === orderId) {
        setActiveDrawerOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      if (showToast) showToast('Lỗi khi cập nhật trạng thái đơn!', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá vĩnh viễn đơn hàng #${orderId}?`)) {
      try {
        await deleteOrder(orderId);
        setActiveDrawerOrder(null);
        if (showToast) showToast(`Đã xoá đơn hàng #${orderId}`, 'info');
      } catch {
        if (showToast) showToast('Lỗi khi xoá đơn hàng!', 'error');
      }
    }
  };

  const handleSaveManualOrder = async (e) => {
    e.preventDefault();
    if (!manualForm.customerName.trim() || !manualForm.customerPhone.trim()) {
      if (showToast) showToast('Vui lòng nhập đầy đủ tên và SĐT khách!', 'error');
      return;
    }
    const validItems = manualForm.items.filter(i => i.name.trim());
    if (validItems.length === 0) {
      if (showToast) showToast('Vui lòng nhập ít nhất 1 sản phẩm!', 'error');
      return;
    }

    try {
      const orderPayload = {
        customerName: manualForm.customerName.trim(),
        customerPhone: manualForm.customerPhone.trim(),
        customerAddress: manualForm.customerAddress.trim() || 'Hà Nội, Việt Nam',
        customerNote: manualForm.customerNote.trim(),
        adminNote: manualForm.adminNote.trim(),
        status: manualForm.status,
        items: validItems.map(it => {
          const price = parseFloat(it.foreignPrice) || 0;
          return {
            name: it.name,
            foreignPrice: price,
            qty: parseInt(it.qty, 10) || 1,
            price: Math.round(price * krwRate * (1 + serviceFee / 100)),
            productImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80'
          };
        })
      };
      const totalWon = validItems.reduce((s, it) => s + (parseFloat(it.foreignPrice) || 0) * (parseInt(it.qty, 10) || 1), 0);
      const totalVnd = Math.round(totalWon * krwRate * (1 + serviceFee / 100));
      orderPayload.totalAmount = totalVnd;

      const created = await createManualOrder(orderPayload);
      setIsCreateModalOpen(false);
      if (showToast) showToast(`Đã tạo đơn hàng #${created?.id || ''} thành công!`, 'success');
      setManualForm({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerNote: '',
        adminNote: 'Đơn hàng mua hộ trực tiếp theo yêu cầu.',
        status: 'deposit_paid',
        items: [{ name: '', foreignPrice: '', qty: 1 }]
      });
    } catch {
      if (showToast) showToast('Lỗi khi tạo đơn hàng thủ công!', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 🔍 Thanh Tìm Kiếm & Chuyển Chế Độ Xem (Kanban vs Table) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: isDark ? '#1E293B' : '#FFF',
        padding: '12px 16px',
        borderRadius: '12px',
        border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {/* Search Box */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} color={isDark ? '#94A3B8' : '#64748B'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Tên khách, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              backgroundColor: isDark ? '#0F172A' : '#FFF',
              color: isDark ? '#F8FAFC' : '#0F172A',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {/* View Switcher & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', backgroundColor: isDark ? '#0F172A' : '#F1F5F9', padding: '3px', borderRadius: '8px', border: isDark ? '1px solid #334155' : 'none' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'kanban' ? (isDark ? '#334155' : '#FFF') : 'transparent',
                color: viewMode === 'kanban' ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#94A3B8' : '#64748B'),
                fontWeight: viewMode === 'kanban' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <LayoutGrid size={14} />
              <span>Kanban Phân Luồng</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? (isDark ? '#334155' : '#FFF') : 'transparent',
                color: viewMode === 'table' ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#94A3B8' : '#64748B'),
                fontWeight: viewMode === 'table' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <List size={14} />
              <span>Danh Sách Bảng</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563EB',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>+ Tạo Đơn Hàng</span>
          </button>
        </div>
      </div>

      {/* 📋 Giao diện Kanban Phân Luồng 5 Cột */}
      {viewMode === 'kanban' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          alignItems: 'flex-start',
          minHeight: '600px'
        }}>
          {KANBAN_COLUMNS.map(col => {
            const colOrders = kanbanData[col.id] || [];
            return (
              <div
                key={col.id}
                style={{
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderRadius: '12px',
                  border: isDark ? '1px solid #334155' : `1px solid ${col.borderColor}`,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${col.color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: col.color
                    }} />
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {col.title}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: col.badgeColor,
                    color: '#FFF',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '999px'
                  }}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Orders in Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {colOrders.length === 0 ? (
                    <div style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      color: isDark ? '#64748B' : '#94A3B8',
                      fontSize: '0.78rem',
                      fontStyle: 'italic'
                    }}>
                      Chưa có đơn trong mục này
                    </div>
                  ) : (
                    colOrders.map(order => {
                      const totalVnd = getOrderTotalVnd(order, krwRate, serviceFee);
                      const itemsCount = order.items?.length || 1;
                      const firstItem = order.items?.[0];

                      return (
                        <div
                          key={order.id}
                          onClick={() => setActiveDrawerOrder(order)}
                          style={{
                            backgroundColor: isDark ? '#0F172A' : '#FFF',
                            borderRadius: '10px',
                            padding: '12px',
                            border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                          }}
                        >
                          {/* Card Header: Order ID & Date */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#38BDF8' }}>
                              #{order.id}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                            </span>
                          </div>

                          {/* Customer Name & Phone */}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: isDark ? '#F8FAFC' : '#1E293B' }}>
                              {order.customerName || 'Khách Vãng Lai'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} />
                              <span>{order.customerPhone || 'Chưa có SĐT'}</span>
                            </div>
                          </div>

                          {/* Product Summary */}
                          {firstItem && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                              padding: '6px',
                              borderRadius: '6px',
                              border: isDark ? '1px solid #334155' : 'none'
                            }}>
                              <img
                                src={firstItem.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=100&q=80'}
                                alt=""
                                style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#E2E8F0' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {firstItem.name}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                                  {itemsCount > 1 ? `+ ${itemsCount - 1} sản phẩm khác` : `Số lượng: ${firstItem.quantity || firstItem.qty || 1}`}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Financial Total & Next Action */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '6px',
                            borderTop: isDark ? '1px dashed #334155' : '1px dashed #E2E8F0'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: isDark ? '#94A3B8' : '#64748B' }}>Tổng tiền:</div>
                              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isDark ? '#38BDF8' : '#0F172A' }}>
                                {totalVnd.toLocaleString('vi-VN')} đ
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDrawerOrder(order);
                              }}
                              style={{
                                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                                border: isDark ? '1px solid #334155' : 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: isDark ? '#E2E8F0' : '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <span>Chi tiết</span>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📊 Giao diện Danh Sách Bảng (Table View Mode) */}
      {viewMode === 'table' && (
        <div style={{
          backgroundColor: isDark ? '#1E293B' : '#FFF',
          borderRadius: '12px',
          border: isDark ? '1px solid #334155' : '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0', textAlign: 'left', color: isDark ? '#94A3B8' : '#64748B' }}>
                <th style={{ padding: '12px 16px' }}>Mã Đơn</th>
                <th style={{ padding: '12px 16px' }}>Khách Hàng</th>
                <th style={{ padding: '12px 16px' }}>Sản Phẩm</th>
                <th style={{ padding: '12px 16px' }}>Tổng Tiền (VNĐ)</th>
                <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
                <th style={{ padding: '12px 16px' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: isDark ? '#64748B' : '#94A3B8' }}>
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const totalVnd = getOrderTotalVnd(order, krwRate, serviceFee);
                  const statusCfg = getStatusConfig(order.status);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setActiveDrawerOrder(order)}
                      style={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#162032' : '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#38BDF8' }}>
                        #{order.id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#1E293B' }}>{order.customerName || 'Khách'}</div>
                        <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>{order.customerPhone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: isDark ? '#CBD5E1' : '#334155' }}>
                        {order.items?.[0]?.name || 'Sản phẩm mua hộ'} ({order.items?.length || 1} món)
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: isDark ? '#38BDF8' : '#0F172A' }}>
                        {totalVnd.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: isDark ? '#0F172A' : (statusCfg?.bgColor || '#F1F5F9'),
                          color: statusCfg?.color || '#334155',
                          border: isDark ? '1px solid #334155' : 'none',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {statusCfg?.label || order.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDrawerOrder(order);
                          }}
                          style={{
                            backgroundColor: '#2563EB',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Xử lý
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🚪 Slide-over Drawer Chi Tiết Đơn Hàng (Bên Phải) */}
      {activeDrawerOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(500px, 100vw)',
          height: '100vh',
          backgroundColor: isDark ? '#1E293B' : '#FFF',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
          borderLeft: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: isDark ? '#0F172A' : '#0F172A',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDark ? '1px solid #334155' : 'none'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>Đơn Hàng #{activeDrawerOrder.id}</span>
                <button
                  onClick={() => handleCopyText(activeDrawerOrder.id, 'drawer_id')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {copiedOrderId === 'drawer_id' ? <Check size={14} color="#10B981" /> : <FileText size={14} />}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                Tạo lúc: {activeDrawerOrder.createdAt ? new Date(activeDrawerOrder.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
              </div>
            </div>

            <button
              onClick={() => setActiveDrawerOrder(null)}
              style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 1. Trạng Thái Hiện Tại & Đổi Nhanh */}
            <div style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', padding: '14px', borderRadius: '10px', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '8px' }}>
                TIẾN ĐỘ XỬ LÝ ĐƠN HÀNG (9 BƯỚC)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {Object.values(ORDER_STATUSES).filter(st => ['pending', 'deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed', 'cancelled'].includes(st.id)).map((st) => {
                  const isCurrent = activeDrawerOrder.status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleQuickStatusChange(activeDrawerOrder.id, st.id)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: isCurrent ? '2px solid #38BDF8' : (isDark ? '1px solid #334155' : '1px solid #CBD5E1'),
                        backgroundColor: isCurrent ? (isDark ? '#1E3A8A' : '#EFF6FF') : (isDark ? '#1E293B' : '#FFF'),
                        color: isCurrent ? '#FFF' : (isDark ? '#E2E8F0' : '#334155'),
                        fontWeight: isCurrent ? 800 : 500,
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {st.shortLabel || st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Thông Tin Khách Hàng */}
            <div style={{ backgroundColor: isDark ? '#0F172A' : '#FFF', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '8px' }}>
                👤 THÔNG TIN NGƯỜI NHẬN
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                <div><strong>Họ tên:</strong> {activeDrawerOrder.customerName || 'Khách vãng lai'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>Điện thoại:</strong>
                  <a href={`tel:${activeDrawerOrder.customerPhone}`} style={{ color: '#38BDF8', textDecoration: 'none' }}>
                    {activeDrawerOrder.customerPhone}
                  </a>
                </div>
                <div><strong>Địa chỉ:</strong> {activeDrawerOrder.customerAddress || 'Chưa cập nhật'}</div>
                {activeDrawerOrder.customerNote && (
                  <div style={{ color: '#FBBF24', fontStyle: 'italic' }}>
                    <strong>Ghi chú của khách:</strong> "{activeDrawerOrder.customerNote}"
                  </div>
                )}
              </div>
            </div>

            {/* 2.5 Biên Lai Chuyển Tiền / Bill Quét Mã (Nếu Khách Đã Tải Lên) */}
            {activeDrawerOrder.depositProofImage && (
              <div style={{ backgroundColor: isDark ? '#1E293B' : '#ECFDF5', border: isDark ? '1px solid #10B981' : '1px solid #A7F3D0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#34D399' : '#065F46', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📸 BIÊN LAI CHUYỂN TIỀN KHÁCH ĐÃ GỬI</span>
                  {activeDrawerOrder.depositProofUploadedAt && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6B7280' }}>
                      {new Date(activeDrawerOrder.depositProofUploadedAt).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <a href={activeDrawerOrder.depositProofImage} target="_blank" rel="noopener noreferrer">
                    <img
                      src={activeDrawerOrder.depositProofImage}
                      alt="Biên lai cọc"
                      style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #D1D5DB', objectFit: 'contain', cursor: 'zoom-in' }}
                    />
                  </a>
                </div>
                {activeDrawerOrder.status !== 'deposit_paid' && activeDrawerOrder.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => handleQuickStatusChange(activeDrawerOrder.id, 'deposit_paid')}
                    style={{
                      width: '100%',
                      backgroundColor: '#10B981',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Duyệt Xác Nhận Đã Nhận Cọc 100%
                  </button>
                )}
              </div>
            )}

            {/* 3. Danh Sách Sản Phẩm Mua Hộ */}
            <div style={{ backgroundColor: isDark ? '#0F172A' : '#FFF', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '8px' }}>
                📦 SẢN PHẨM MUA HỘ ({activeDrawerOrder.items?.length || 1} MÓN)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(activeDrawerOrder.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=120&q=80'}
                      alt=""
                      style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: isDark ? '#F8FAFC' : '#1E293B' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                        Giá: {item.foreignPrice?.toLocaleString('vi-VN') || 0} ₩ x {item.quantity || item.qty || 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Tổng Kết Tài Chính */}
            <div style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', color: isDark ? '#E2E8F0' : '#1E293B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                <span>Tỷ giá áp dụng:</span>
                <strong>1 KRW = {krwRate} VNĐ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                <span>Phí dịch vụ mua hộ:</span>
                <strong>{serviceFee}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: isDark ? '1px dashed #334155' : '1px dashed #CBD5E1', fontSize: '1rem', fontWeight: 900, color: '#38BDF8' }}>
                <span>Tổng Tiền Về VN:</span>
                <span>{(activeDrawerOrder.exactPaymentAmount || getOrderTotalVnd(activeDrawerOrder, krwRate, serviceFee)).toLocaleString('vi-VN')} đ</span>
              </div>
              {activeDrawerOrder.exactPaymentAmount && (
                <div style={{ fontSize: '0.74rem', color: '#10B981', marginTop: '4px', textAlign: 'right', fontWeight: 600 }}>
                  ⚡ Số tiền độc nhất đối soát: {activeDrawerOrder.exactPaymentAmount.toLocaleString('vi-VN')} đ
                </div>
              )}
            </div>

            {/* Delete Order Action */}
            <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDeleteOrder(activeDrawerOrder.id)}
                style={{
                  backgroundColor: isDark ? '#450A0A' : '#FEE2E2',
                  color: '#EF4444',
                  border: isDark ? '1px solid #7F1D1D' : '1px solid #FECACA',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />
                <span>Xoá Đơn Hàng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 Modal Tạo Đơn Hàng Mới Thủ Công */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#1E293B' : '#FFF',
            color: isDark ? '#F8FAFC' : '#0F172A',
            border: isDark ? '1px solid #334155' : 'none',
            borderRadius: '16px',
            maxWidth: '550px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>+ Tạo Đơn Hàng Mua Hộ Mới</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: isDark ? '#94A3B8' : '#0F172A', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManualOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Tên Khách Hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={manualForm.customerName}
                  onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    marginTop: '4px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Số Điện Thoại *</label>
                <input
                  type="text"
                  required
                  placeholder="0912345678"
                  value={manualForm.customerPhone}
                  onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    marginTop: '4px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Tên Sản Phẩm Cần Mua *</label>
                <input
                  type="text"
                  required
                  placeholder="Cao Hồng Sâm KGC Everytime 30 gói"
                  value={manualForm.items[0].name}
                  onChange={(e) => {
                    const items = [...manualForm.items];
                    items[0].name = e.target.value;
                    setManualForm({ ...manualForm, items });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    marginTop: '4px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Giá Won (₩)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={manualForm.items[0].foreignPrice}
                    onChange={(e) => {
                      const items = [...manualForm.items];
                      items[0].foreignPrice = e.target.value;
                      setManualForm({ ...manualForm, items });
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      marginTop: '4px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Số Lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={manualForm.items[0].qty}
                    onChange={(e) => {
                      const items = [...manualForm.items];
                      items[0].qty = e.target.value;
                      setManualForm({ ...manualForm, items });
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      marginTop: '4px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFF',
                    color: isDark ? '#E2E8F0' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Tạo Đơn Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
