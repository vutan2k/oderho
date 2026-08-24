import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ORDER_STATUSES, ORDER_STEPS, getStatusConfig, getOrderStepIndex } from '../data/orderStatuses';
import CascadingAddressSelector from './CascadingAddressSelector';
import {
  Search, Edit3, Trash2,
  Truck, CheckCircle, PackageCheck, AlertCircle, Printer,
  Download, ShieldCheck, ChevronRight, X,
  Phone, MapPin, Video, FileText, Scale, Plane,
  ExternalLink, Sparkles, Filter, RefreshCw, Check,
  CreditCard, Play, LayoutGrid, List, Plus
} from 'lucide-react';

export default function AdminOrderManager() {
  const { orders, rates, updateOrderStatus, updateOrderQuote, updateOrderTracking, deleteOrder, createManualOrder } = useContext(AppContext);
  const showToast = useToast();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (giống Web 8 bước) | 'table' (bảng danh sách)
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Editing / Detail Modal State
  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [orderForm, setOrderForm] = useState({});

  // Quick Proof Update Mini-Modal
  const [quickProofOrder, setQuickProofOrder] = useState(null);
  const [quickProofForm, setQuickProofForm] = useState({});

  // Media Preview Lightbox Modal (Video / Bill Photo)
  const [activeMediaModal, setActiveMediaModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Manual Order Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerNote: '',
    adminNote: 'Đơn hàng mua hộ trực tiếp theo yêu cầu khách.',
    status: 'deposit_paid',
    paymentStatus: 'paid',
    items: [
      {
        name: '',
        foreignPrice: '',
        qty: 1,
        options: '',
        productImage: '',
        productUrl: ''
      }
    ],
    customTotalVnd: ''
  });

  const handleAddManualItem = () => {
    setManualForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { name: '', foreignPrice: '', qty: 1, options: '', productImage: '', productUrl: '' }
      ]
    }));
  };

  const handleRemoveManualItem = (idx) => {
    if (manualForm.items.length <= 1) return;
    setManualForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleManualItemChange = (idx, field, value) => {
    setManualForm(prev => {
      const updated = [...prev.items];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const calculateManualTotals = () => {
    const totalKrw = manualForm.items.reduce((sum, item) => {
      const p = parseFloat(String(item.foreignPrice || '').replace(/,/g, '')) || 0;
      const q = parseInt(item.qty) || 1;
      return sum + (p * q);
    }, 0);
    const serviceFeePercent = rates?.serviceFeePercent ?? 5;
    const calculatedVnd = Math.round(totalKrw * krwRate * (1 + serviceFeePercent / 100));
    const finalVnd = manualForm.customTotalVnd !== '' ? (parseFloat(String(manualForm.customTotalVnd).replace(/,/g, '')) || 0) : calculatedVnd;
    return { totalKrw, calculatedVnd, finalVnd };
  };

  const handleSaveManualOrder = async (e) => {
    e.preventDefault();
    if (!manualForm.customerName.trim()) {
      if (showToast) showToast('Vui lòng nhập tên khách hàng!', 'error');
      return;
    }
    if (!manualForm.customerPhone.trim()) {
      if (showToast) showToast('Vui lòng nhập số điện thoại khách!', 'error');
      return;
    }
    const validItems = manualForm.items.filter(i => i.name.trim());
    if (validItems.length === 0) {
      if (showToast) showToast('Vui lòng nhập ít nhất 1 sản phẩm!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { totalKrw, finalVnd } = calculateManualTotals();
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const serviceFeePercent = rates?.serviceFeePercent ?? 5;
      
      const formattedItems = validItems.map((item, idx) => {
        const fPrice = parseFloat(String(item.foreignPrice || '').replace(/,/g, '')) || 0;
        return {
          goodsNo: `MANUAL-${Date.now()}-${idx + 1}`,
          name: item.name.trim(),
          foreignPrice: fPrice,
          price: Math.round(fPrice * krwRate * (1 + serviceFeePercent / 100)),
          qty: parseInt(item.qty) || 1,
          options: item.options.trim() || 'Hàng mua hộ ngoài hệ thống',
          productImage: item.productImage.trim() || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80',
          productUrl: item.productUrl.trim() || ''
        };
      });

      const payload = {
        id: orderId,
        customerName: manualForm.customerName.trim(),
        customerPhone: manualForm.customerPhone.trim(),
        customerAddress: manualForm.customerAddress.trim() || 'Địa chỉ nhận hàng cập nhật sau',
        customerNote: manualForm.customerNote.trim(),
        adminNote: manualForm.adminNote.trim(),
        country: 'KRW',
        foreignPrice: totalKrw,
        totalAmountKrw: totalKrw,
        totalVnd: finalVnd,
        status: manualForm.status,
        paymentStatus: manualForm.paymentStatus,
        paymentMethod: 'manual',
        items: formattedItems,
        productName: formattedItems.map(i => i.name).join(' + '),
        productImage: formattedItems[0].productImage,
        qty: formattedItems.reduce((sum, i) => sum + i.qty, 0),
        quote: {
          rawVnd: Math.round(totalKrw * krwRate),
          serviceFeeVnd: Math.round(totalKrw * krwRate * (serviceFeePercent / 100)),
          totalVnd: finalVnd
        }
      };

      if (createManualOrder) {
        await createManualOrder(payload);
      }
      if (showToast) showToast(`Đã tạo đơn hàng ${orderId} thành công!`, 'success');
      setIsCreateModalOpen(false);
      setManualForm({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerNote: '',
        adminNote: 'Đơn hàng mua hộ trực tiếp theo yêu cầu khách.',
        status: 'deposit_paid',
        paymentStatus: 'paid',
        items: [{ name: '', foreignPrice: '', qty: 1, options: '', productImage: '', productUrl: '' }],
        customTotalVnd: ''
      });
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Lỗi khi tạo đơn hàng thủ công!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => (n || n === 0) ? `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} VNĐ` : '0 VNĐ';
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
        (o.trackingCode && o.trackingCode.toLowerCase().includes(term)) ||
        (o.domesticTrackingCode && o.domesticTrackingCode.toLowerCase().includes(term));
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

  const handleBulkStatusChange = async () => {
    setIsSaving(true);
    if (!bulkStatus) {
      if (showToast) showToast('Vui lòng chọn trạng thái cần đổi!', 'error');
      return;
    }
    if (selectedOrderIds.length === 0) {
      if (showToast) showToast('Chưa chọn đơn hàng nào!', 'error');
      return;
    }

    await Promise.all(selectedOrderIds.map(id => updateOrderStatus(id, bulkStatus)));

    if (showToast) showToast(`Đã cập nhật ${selectedOrderIds.length} đơn sang "${ORDER_STATUSES[bulkStatus]?.label || bulkStatus}"`, 'success');
    setSelectedOrderIds([]);
    setBulkStatus('');
    setIsSaving(false);
  };

  const handleOpenEditModal = (order, print = false) => {
    const fPrice = getOrderForeignPrice(order);
    const qty = getOrderQty(order);
    const baseVnd = order.quote ? order.quote.rawVnd : Math.round(fPrice * krwRate * qty);
    const taxVnd = order.quote ? order.quote.taxWebVnd : Math.round(baseVnd * 0.05);
    const serviceFeePercent = rates?.serviceFeePercent || 5;
    const serviceVnd = order.quote ? order.quote.serviceFeeVnd : Math.round(baseVnd * (serviceFeePercent / 100));
    const shipFeeVnd = order.quote ? order.quote.shippingWeightFeeVnd : 35000;

    setOrderForm({
      id: order.id,
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      productName: getOrderProductName(order),
      foreignPrice: fPrice,
      qty: qty,
      trackingCode: order.trackingCode || '',
      status: order.status || 'pending',
      adminNote: order.adminNote || 'Hàng mua trực tiếp tại Olive Young/Store Hàn Quốc, bảo hiểm 100%.',
      rawVnd: baseVnd,
      taxWebVnd: taxVnd,
      serviceFeeVnd: serviceVnd,
      shippingWeightFeeVnd: shipFeeVnd,
      // 8-Step Proof Hub Fields
      povVideoUrl: order.povVideoUrl || '',
      receiptImageUrl: order.receiptImageUrl || '',
      packingVideoUrl: order.packingVideoUrl || '',
      packageWeightKg: order.packageWeightKg || '',
      flightCode: order.flightCode || 'VN415 - ICN/HAN',
      domesticCarrier: order.domesticCarrier || 'ViettelPost',
      domesticTrackingCode: order.domesticTrackingCode || '',
    });
    setIsPrintMode(print);
    setActiveModalOrder(order);
  };

  const handleSaveOrderChanges = async () => {
    setIsSaving(true);
    if (!activeModalOrder) return;

    if (!orderForm.customerName || !orderForm.customerName.trim()) {
      if (showToast) showToast('Vui lòng nhập họ và tên khách hàng!', 'error');
      return;
    }

    const totalCalc =
      Number(orderForm.rawVnd) +
      Number(orderForm.taxWebVnd) +
      Number(orderForm.serviceFeeVnd) +
      Number(orderForm.shippingWeightFeeVnd);

    await updateOrderStatus(activeModalOrder.id, orderForm.status);
    await updateOrderTracking(activeModalOrder.id, {
      status: orderForm.status,
      trackingCode: orderForm.trackingCode,
      note: orderForm.adminNote,
      customerName: orderForm.customerName.trim(),
      customerPhone: orderForm.customerPhone,
      customerAddress: orderForm.customerAddress,
      povVideoUrl: orderForm.povVideoUrl,
      receiptImageUrl: orderForm.receiptImageUrl,
      packingVideoUrl: orderForm.packingVideoUrl,
      packageWeightKg: orderForm.packageWeightKg ? Number(orderForm.packageWeightKg) : null,
      flightCode: orderForm.flightCode,
      domesticCarrier: orderForm.domesticCarrier,
      domesticTrackingCode: orderForm.domesticTrackingCode
    });

    await updateOrderQuote(activeModalOrder.id, {
      rawVnd: Number(orderForm.rawVnd),
      taxWebVnd: Number(orderForm.taxWebVnd),
      serviceFeeVnd: Number(orderForm.serviceFeeVnd),
      shippingWeightFeeVnd: Number(orderForm.shippingWeightFeeVnd),
      note: orderForm.adminNote,
      totalVnd: totalCalc
    });

    if (showToast) showToast(`Đã lưu cập nhật đơn hàng ${activeModalOrder.id}!`, 'success');
    setActiveModalOrder(null);
    setIsSaving(false);
  };

  // Quick 1-Click Stepper Advance
  const handleQuickNextStatus = (order) => {
    const allStatuses = ['pending', 'deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed'];
    const currentIndex = allStatuses.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < allStatuses.length - 1) {
      const nextKey = allStatuses[currentIndex + 1];
      updateOrderStatus(order.id, nextKey);
      const nextCfg = getStatusConfig(nextKey);
      if (showToast) showToast(`🚀 Đã nâng tiến độ đơn ${order.id} ➔ ${nextCfg.shortLabel}`, 'success');
    }
  };

  // Quick Proof Modal Open
  const handleOpenQuickProof = (order) => {
    setQuickProofOrder(order);
    setQuickProofForm({
      povVideoUrl: order.povVideoUrl || '',
      receiptImageUrl: order.receiptImageUrl || '',
      packingVideoUrl: order.packingVideoUrl || '',
      packageWeightKg: order.packageWeightKg || '',
      flightCode: order.flightCode || 'VN415 - ICN/HAN',
      trackingCode: order.trackingCode || '',
      domesticTrackingCode: order.domesticTrackingCode || ''
    });
  };

  const handleSaveQuickProof = () => {
    if (!quickProofOrder) return;
    updateOrderTracking(quickProofOrder.id, {
      ...quickProofForm,
      packageWeightKg: quickProofForm.packageWeightKg ? Number(quickProofForm.packageWeightKg) : null
    });
    if (showToast) showToast(`Đã cập nhật bằng chứng minh bạch cho đơn ${quickProofOrder.id}!`, 'success');
    setQuickProofOrder(null);
  };

  // Export CSV of Orders
  const handleExportOrdersCSV = () => {
    const header = "MÃ ĐƠN HÀNG,TÊN KHÁCH HÀNG,SỐ ĐIỆN THOẠI,ĐỊA CHỈ GIAO,SẢN PHẨM,GIÁ WON,SL,TỔNG TIỀN VNĐ,TRẠNG THÁI,MÃ AIR,VẬN ĐƠN NỘI ĐỊA,CÂN NẶNG KG\n";
    const rows = filteredOrders.map(o => {
      const st = getStatusConfig(o.status).label;
      const fPrice = getOrderForeignPrice(o);
      const qty = getOrderQty(o);
      const oName = getOrderProductName(o);
      const total = o.quote ? o.quote.totalVnd : Math.round(fPrice * krwRate * qty);
      return `"${o.id}","${o.customerName || ''}","${o.customerPhone || ''}","${(o.customerAddress || '').replace(/"/g, '""')}","${(oName || '').replace(/"/g, '""')}",${fPrice || 0},${qty || 1},${total},"${st}","${o.trackingCode || ''}","${o.domesticTrackingCode || ''}","${o.packageWeightKg || ''}"`;
    }).join('\n');

    const blob = new Blob(["﻿" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TAVY_KOREA_DON_HANG_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    if (showToast) showToast('Đã tải tệp báo cáo danh sách đơn hàng (.CSV)', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* 📊 KPI COUNTERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { title: 'TỔNG ĐƠN HÀNG', count: orders.length, color: 'var(--purple-primary)', bg: '#F5F3FF', icon: ShieldCheck },
          { title: 'BƯỚC 1-2: CHỜ/ĐÃ CỌC', count: orders.filter((o) => ['pending', 'deposit_paid'].includes(o.status)).length, color: '#D97706', bg: '#FEF3C7', icon: AlertCircle },
          { title: 'BƯỚC 3-5: MUA & ĐÓNG GÓI', count: orders.filter((o) => ['confirmed', 'purchased', 'packed_kr'].includes(o.status)).length, color: '#7C3AED', bg: '#F3E8FF', icon: CheckCircle },
          { title: 'BƯỚC 6-7: BAY AIR & KHO VN', count: orders.filter((o) => ['in_transit_air', 'customs_cleared'].includes(o.status)).length, color: '#0891B2', bg: '#CFFAFE', icon: Truck },
          { title: 'BƯỚC 8: HOÀN TẤT', count: orders.filter((o) => o.status === 'completed').length, color: '#059669', bg: '#D1FAE5', icon: PackageCheck }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-white)',
                borderRadius: '14px',
                padding: '16px 18px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {kpi.title}
                </span>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: kpi.color, marginTop: '2px' }}>
                  {kpi.count}
                </div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔍 FILTER BAR & CONTROLS */}
      <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '16px', padding: '18px 20px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>

        {/* 8-Step Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px', borderBottom: '1px solid var(--bg-ivory)' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: filterStatus === 'all' ? '2px solid var(--purple-primary)' : '1px solid var(--border-color)',
              backgroundColor: filterStatus === 'all' ? 'var(--purple-primary)' : 'var(--bg-white)',
              color: filterStatus === 'all' ? 'var(--bg-white)' : 'var(--text-muted)',
              fontWeight: filterStatus === 'all' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Tất cả ({orders.length})
          </button>

          {['pending', 'deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed', 'cancelled'].map((stKey) => {
            const st = getStatusConfig(stKey);
            const cnt = orders.filter((o) => o.status === stKey).length;
            const isSelected = filterStatus === stKey;
            return (
              <button
                key={stKey}
                onClick={() => setFilterStatus(stKey)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '20px',
                  border: isSelected ? `2px solid ${st.borderColor}` : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? st.color : 'var(--bg-white)',
                  color: isSelected ? 'var(--bg-white)' : 'var(--text-muted)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{st.shortLabel}</span>
                <span style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-ivory)', color: isSelected ? 'var(--bg-white)' : 'var(--text-muted)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, View Mode Toggle & Bulk Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm Mã đơn (ORD-...), Tên khách, SĐT, Mã AWB Air, Vận đơn VN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle: Cards (Web-like) vs Table */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-ivory)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'cards' ? 'var(--bg-white)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--purple-primary)' : 'var(--text-muted)',
                  fontWeight: viewMode === 'cards' ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <LayoutGrid size={14} /> Giao Diện 8 Bước (Web)
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
                  backgroundColor: viewMode === 'table' ? 'var(--bg-white)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--purple-primary)' : 'var(--text-muted)',
                  fontWeight: viewMode === 'table' ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <List size={14} /> Dạng Bảng Gọn
              </button>
            </div>

            {selectedOrderIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-subtle-purple)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--purple-light)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
                  Chọn {selectedOrderIds.length} đơn
                </span>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  <option value="">-- Đổi trạng thái hàng loạt --</option>
                  {['pending', 'deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed', 'cancelled'].map((k) => (
                    <option key={k} value={k}>{ORDER_STATUSES[k]?.label || k}</option>
                  ))}
                </select>
                <button
                    disabled={isSaving}
                    onClick={handleBulkStatusChange}
                    style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Áp Dụng
                </button>
              </div>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                backgroundColor: 'var(--purple-primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(122, 75, 158, 0.3)'
              }}
            >
              <Plus size={16} /> Tạo Đơn Thủ Công
            </button>

            <button
              onClick={handleExportOrdersCSV}
              style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={15} /> Xuất CSV
            </button>
          </div>
        </div>

      </div>

      {/* ═══════════ VIEW MODE 1: GIAO DIỆN THẺ TIẾN TRÌNH 8 BƯỚC (GIỐNG HỆT WEB KHÁCH HÀNG) ═══════════ */}
      {viewMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ backgroundColor: '#FFF', border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShieldCheck size={48} style={{ color: 'var(--purple-primary)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>Không tìm thấy đơn hàng nào</h3>
              <p style={{ fontSize: '0.85rem' }}>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm phía trên.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const currentStepIdx = getOrderStepIndex(order);
              const statusCfg = getStatusConfig(order.status);
              const isPaid = order.paymentStatus === 'paid' || ['deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed'].includes(order.status);
              const totalVndVal = order.totalVnd || (order.quote ? order.quote.totalVnd : (Array.isArray(order.items) && order.items.length > 0 ? order.items.reduce((sum, item) => sum + (item.price || Math.round((item.foreignPrice || 0) * krwRate)) * (item.qty || 1), 0) : Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1))));

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: 'var(--bg-white)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    overflow: 'hidden'
                  }}
                >
                  {/* 1. Header Đơn Hàng (Chuẩn Web) */}
                  <div
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#FAF9F6',
                      borderBottom: '1px solid #EAE6DF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: statusCfg.color || 'var(--purple-primary)',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {statusCfg.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--purple-primary)', fontFamily: 'monospace' }}>
                          {order.id}
                        </h3>
                        <span style={{ fontSize: '0.72rem', backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7', color: isPaid ? '#15803D' : '#D97706', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                          {isPaid ? '● Đã cọc 100%' : '○ Chờ cọc'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Khách hàng:</span>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                          {order.customerName || 'Khách Vãng Lai'} ({order.customerPhone || 'Không có SĐT'})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                          {formatVnd(totalVndVal)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)' }}>
                        <button
                          onClick={() => handleOpenEditModal(order, false)}
                          style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={13} /> Sửa
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(order, true)}
                          title="In phiếu giao nhận"
                          style={{ backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Timeline Tiến Trình 8 Bước Minh Bạch (Y hệt Web Khách Hàng) */}
                  <div style={{ padding: '20px', backgroundColor: '#FDFBFF', borderBottom: '1px solid #EAE6DF' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '10px'
                      }}
                    >
                      {ORDER_STEPS.map((st, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div
                            key={st.key}
                            style={{
                              backgroundColor: isCurrent ? 'var(--bg-white)' : (isCompleted ? '#F9F6FC' : 'var(--bg-ivory)'),
                              borderRadius: '12px',
                              padding: '12px 8px',
                              border: isCurrent ? '2px solid var(--purple-primary)' : (isCompleted ? '1.5px solid var(--purple-light)' : '1px solid var(--border-color)'),
                              boxShadow: isCurrent ? '0 4px 12px rgba(122, 75, 158, 0.15)' : 'none',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                backgroundColor: isCompleted ? 'var(--purple-primary)' : 'var(--border-color)',
                                color: isCompleted ? 'var(--bg-white)' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                marginBottom: '6px'
                              }}
                            >
                              {isCompleted ? <Check size={15} /> : idx + 1}
                            </div>

                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: isCurrent ? 800 : (isCompleted ? 700 : 500),
                                color: isCompleted ? 'var(--purple-primary)' : 'var(--text-muted)',
                                lineHeight: 1.25
                              }}
                            >
                              {st.shortLabel || st.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Proof Hub (Bằng Chứng Mua Hàng & Đóng Gói Minh Bạch 100% - Y Hệt Web) */}
                  <div
                    style={{
                      padding: '14px 20px',
                      backgroundColor: '#F7F4EB',
                      borderBottom: '1px solid #EAE6DF',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} style={{ color: 'var(--purple-primary)' }} />
                      <strong style={{ fontSize: '0.84rem', color: 'var(--bg-dark-accent)' }}>
                        Minh bạch 100% từ TAVY Korea:
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      {/* POV Video */}
                      {order.povVideoUrl ? (
                        <button
                          onClick={() => setActiveMediaModal({ type: 'video', url: order.povVideoUrl, title: `Video POV Mua Hàng Store Hàn - Đơn ${order.id}` })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--purple-primary)', color: 'var(--purple-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Video size={13} /> Video POV Store
                        </button>
                      ) : null}

                      {/* Store Bill */}
                      {order.receiptImageUrl ? (
                        <button
                          onClick={() => setActiveMediaModal({ type: 'image', url: order.receiptImageUrl, title: `Hóa Đơn / Bill Mua Hàng - Đơn ${order.id}` })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <FileText size={13} /> Xem Bill Store
                        </button>
                      ) : null}

                      {/* Packing Video */}
                      {order.packingVideoUrl ? (
                        <button
                          onClick={() => setActiveMediaModal({ type: 'video', url: order.packingVideoUrl, title: `Video Đóng Kiện & Bọc Bubble - Đơn ${order.id}` })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-white)', border: '1px solid #DB2777', color: '#DB2777', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <PackageCheck size={13} /> Video Đóng Kiện
                        </button>
                      ) : null}

                      {/* Weight */}
                      {order.packageWeightKg ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
                          <Scale size={13} /> {order.packageWeightKg} kg
                        </span>
                      ) : null}

                      {/* Air AWB */}
                      {order.trackingCode ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-white)', border: '1px solid #BAE6FD', fontSize: '0.75rem', fontWeight: 700, color: '#0284C7', fontFamily: 'monospace' }}>
                          <Plane size={13} /> {order.trackingCode}
                        </span>
                      ) : null}

                      {/* Domestic Tracking */}
                      {order.domesticTrackingCode ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-white)', border: '1px solid #BBF7D0', fontSize: '0.75rem', fontWeight: 700, color: '#15803D', fontFamily: 'monospace' }}>
                          <Truck size={13} /> {order.domesticTrackingCode}
                        </span>
                      ) : null}

                      {/* Nút Admin Thêm/Sửa Bằng Chứng Nhanh */}
                      <button
                        onClick={() => handleOpenQuickProof(order)}
                        style={{
                          backgroundColor: 'var(--bg-subtle-purple)',
                          color: 'var(--purple-primary)',
                          border: '1px dashed var(--purple-primary)',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={12} /> Cập nhật Proof Hub
                      </button>
                    </div>
                  </div>

                  {/* 4. Chi Tiết Sản Phẩm & Điều Khiển Admin (1-Click) */}
                  <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
                    {/* Sản phẩm & Địa chỉ */}
                    <div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {getOrderImage(order) && (
                          <img
                            src={getOrderImage(order)}
                            alt=""
                            style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', flexShrink: 0 }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.88rem', lineHeight: 1.35 }}>
                            {getOrderProductName(order)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            Số lượng: <strong>x{getOrderQty(order)}</strong> | Giá Won: <strong>{formatWon(getOrderForeignPrice(order))}</strong>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <MapPin size={12} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                            <span>{order.customerAddress || 'Chưa nhập địa chỉ giao'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Điều khiển Admin 1-Click */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Trạng thái:
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            backgroundColor: statusCfg.bgColor,
                            color: statusCfg.color,
                            borderColor: statusCfg.borderColor,
                            borderWidth: '1.5px',
                            borderStyle: 'solid',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {['pending', 'deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed', 'cancelled'].map((k) => (
                            <option key={k} value={k}>{ORDER_STATUSES[k]?.label || k}</option>
                          ))}
                        </select>
                      </div>

                      {currentStepIdx < 7 && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleQuickNextStatus(order)}
                          style={{
                            backgroundColor: 'var(--purple-primary)',
                            color: 'var(--bg-white)',
                            border: 'none',
                            padding: '7px 16px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(122, 75, 158, 0.25)'
                          }}
                        >
                          <span>Thăng cấp ➔ Bước {currentStepIdx + 2}: {ORDER_STEPS[currentStepIdx + 1]?.shortLabel}</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════ VIEW MODE 2: BẢNG DANH SÁCH GỌN (TABLE VIEW) ═══════════ */}
      {viewMode === 'table' && (
        <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-ivory)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 14px', width: '36px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    />
                  </th>
                  <th style={{ padding: '12px 14px' }}>Mã Đơn / Ngày</th>
                  <th style={{ padding: '12px 14px' }}>Khách Hàng</th>
                  <th style={{ padding: '12px 14px', minWidth: '180px' }}>Sản Phẩm</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Tổng Tiền</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Tiến Độ 8 Bước</th>
                  <th style={{ padding: '12px 14px' }}>Bằng Chứng & Vận Đơn</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                      Chưa có đơn hàng nào khớp với tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const stCfg = getStatusConfig(order.status);
                    const isSelected = selectedOrderIds.includes(order.id);
                    const totalVndVal = order.totalVnd || (order.quote ? order.quote.totalVnd : (Array.isArray(order.items) && order.items.length > 0 ? order.items.reduce((sum, item) => sum + (item.price || Math.round((item.foreignPrice || 0) * krwRate)) * (item.qty || 1), 0) : Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1))));
                    const stepIndex = getOrderStepIndex(order);

                    return (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: '1px solid var(--bg-ivory)',
                          backgroundColor: isSelected ? 'var(--bg-subtle-purple)' : 'var(--bg-white)',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(order.id)}
                          />
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--purple-primary)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                            {order.id}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                            {order.customerName || 'Khách Mua Hàng'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={11} style={{ color: 'var(--text-light)' }} /> {order.customerPhone || 'Chưa có SĐT'}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {getOrderImage(order) && (
                              <img src={getOrderImage(order)} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', flexShrink: 0 }} />
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--bg-dark-accent)', fontSize: '0.8rem', lineHeight: 1.3, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getOrderProductName(order)}>
                                {getOrderProductName(order)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                SL: x{getOrderQty(order)} | {formatWon(getOrderForeignPrice(order))}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                            {formatVnd(totalVndVal)}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              style={{
                                backgroundColor: stCfg.bgColor,
                                color: stCfg.color,
                                borderColor: stCfg.borderColor,
                                borderWidth: '1.5px',
                                borderStyle: 'solid',
                                padding: '4px 8px',
                                borderRadius: '10px',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              {['pending', 'deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed', 'cancelled'].map((k) => (
                                <option key={k} value={k}>{ORDER_STATUSES[k]?.label || k}</option>
                              ))}
                            </select>

                            {stepIndex < 7 && order.status !== 'cancelled' && (
                              <button
                                onClick={() => handleQuickNextStatus(order)}
                                style={{ background: 'var(--bg-subtle-purple)', border: '1px solid var(--purple-light)', color: 'var(--purple-primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}
                              >
                                <span>Bước {stepIndex + 2}/8</span> <ChevronRight size={11} />
                              </button>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {order.povVideoUrl && <span style={{ fontSize: '0.65rem', backgroundColor: '#F3E8FF', color: 'var(--purple-primary)', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>POV Store</span>}
                            {order.packingVideoUrl && <span style={{ fontSize: '0.65rem', backgroundColor: '#FCE7F3', color: '#DB2777', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>Đóng Kiện</span>}
                            {order.packageWeightKg && <span style={{ fontSize: '0.65rem', backgroundColor: '#D1FAE5', color: '#047857', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>{order.packageWeightKg}kg</span>}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenEditModal(order, false)}
                              style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(order, true)}
                              style={{ backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '5px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              <Printer size={12} />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Xóa vĩnh viễn đơn ${order.id}?`)) {
                                  await deleteOrder(order.id);
                                  if (showToast) showToast(`Đã xóa đơn hàng ${order.id}!`, 'success');
                                }
                              }}
                              style={{ backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '5px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              <Trash2 size={12} />
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
      )}

      {/* ═══════════ MODAL XEM BẰNG CHỨNG (VIDEO POV / BILL ẢNH LIGHTBOX) ═══════════ */}
      {activeMediaModal && (
        <div
          onClick={() => setActiveMediaModal(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-white)', borderRadius: '18px', width: '100%', maxWidth: '640px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-ivory)' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>{activeMediaModal.title}</strong>
              <button onClick={() => setActiveMediaModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', minHeight: '300px' }}>
              {activeMediaModal.type === 'video' ? (
                <video src={activeMediaModal.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}>
                  Trình duyệt không hỗ trợ xem trực tiếp video. <a href={activeMediaModal.url} target="_blank" rel="noreferrer" style={{ color: '#38BDF8' }}>Bấm vào đây để mở link</a>
                </video>
              ) : (
                <img src={activeMediaModal.url} alt="Bằng chứng" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL CẬP NHẬT BẰNG CHỨNG PROOF NHANH (1-CLICK) ═══════════ */}
      {quickProofOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }} onClick={() => setQuickProofOrder(null)}>
          <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '18px', width: '100%', maxWidth: '560px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'var(--bg-subtle-purple)', color: 'var(--purple-primary)', padding: '3px 8px', borderRadius: '6px' }}>
                  PROOF HUB 8 BƯỚC
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Cập Nhật Bằng Chứng: {quickProofOrder.id}
                </h3>
              </div>
              <button onClick={() => setQuickProofOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Video size={13} style={{ color: '#7C3AED' }} /> Link Video POV Mua Hàng Store Hàn (Bước 4)
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/... hoặc link video"
                  value={quickProofForm.povVideoUrl}
                  onChange={(e) => setQuickProofForm({ ...quickProofForm, povVideoUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={13} style={{ color: 'var(--text-muted)' }} /> Link Ảnh Hóa Đơn / Bill Store (Bước 4)
                </label>
                <input
                  type="text"
                  placeholder="https://... link ảnh bill mua hàng"
                  value={quickProofForm.receiptImageUrl}
                  onChange={(e) => setQuickProofForm({ ...quickProofForm, receiptImageUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PackageCheck size={13} style={{ color: '#DB2777' }} /> Link Video Đóng Kiện & Bọc Bubble (Bước 5)
                </label>
                <input
                  type="text"
                  placeholder="https://... link video đóng gói tại kho Seoul"
                  value={quickProofForm.packingVideoUrl}
                  onChange={(e) => setQuickProofForm({ ...quickProofForm, packingVideoUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Scale size={13} style={{ color: '#059669' }} /> Cân Nặng Thực Tế (kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="VD: 1.25"
                    value={quickProofForm.packageWeightKg}
                    onChange={(e) => setQuickProofForm({ ...quickProofForm, packageWeightKg: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plane size={13} style={{ color: '#0284C7' }} /> Mã Vận Đơn Air (AWB)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: AWB-78921"
                    value={quickProofForm.trackingCode}
                    onChange={(e) => setQuickProofForm({ ...quickProofForm, trackingCode: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={13} style={{ color: '#059669' }} /> Mã Vận Đơn Nội Địa Giao Đến Khách
                </label>
                <input
                  type="text"
                  placeholder="VD: VTP-928172918"
                  value={quickProofForm.domesticTrackingCode}
                  onChange={(e) => setQuickProofForm({ ...quickProofForm, domesticTrackingCode: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setQuickProofOrder(null)}
                  style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveQuickProof}
                  style={{ padding: '8px 18px', borderRadius: '8px', backgroundColor: 'var(--purple-primary)', color: 'var(--bg-white)', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Lưu Bằng Chứng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL SỬA ĐƠN HÀNG CHI TIẾT & IN HÓA ĐƠN ═══════════ */}
      {activeModalOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px', zIndex: 99999, overflowY: 'auto' }} onClick={() => setActiveModalOrder(null)}>
          <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '20px', width: '100%', maxWidth: '840px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>

            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: 'var(--bg-subtle-purple)', color: 'var(--purple-primary)', padding: '3px 8px', borderRadius: '6px' }}>
                  {isPrintMode ? '🖨️ IN PHIẾU GIAO NHẬN' : '✏️ QUẢN TRỊ TOÀN DIỆN ĐƠN HÀNG'}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: 800 }}>
                  ĐƠN HÀNG: {activeModalOrder.id}
                </h3>
              </div>
              <button onClick={() => setActiveModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Print View vs Edit Form View */}
            {isPrintMode ? (
              <div id="printable-invoice" style={{ backgroundColor: 'var(--bg-ivory)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--text-dark)', paddingBottom: '12px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--purple-primary)' }}>TAVY KOREA</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dịch Vụ Mua Hộ Mỹ Phẩm & Thực Phẩm Chức Năng Chuẩn Hàn</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-dark)' }}>PHIẾU GIAO HÀNG</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KHÁCH HÀNG NHẬN:</strong>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, marginTop: '2px' }}>{orderForm.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SĐT: {orderForm.customerPhone}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Đ/C: {orderForm.customerAddress}</div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>THÔNG TIN GIAO VẬN:</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Trạng thái: <strong>{getStatusConfig(orderForm.status).label}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mã AWB: <strong>{orderForm.trackingCode || '-'}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vận đơn VN: <strong>{orderForm.domesticTrackingCode || '-'}</strong></div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-dark)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Sản phẩm</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Giá Won</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>SL</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Thành tiền VNĐ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{orderForm.productName}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>{formatWon(orderForm.foreignPrice)}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>x{orderForm.qty}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 700 }}>{formatVnd(orderForm.rawVnd)}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-subtle-purple)', fontWeight: 900, fontSize: '0.95rem' }}>
                      <td colSpan={3} style={{ padding: '10px', textAlign: 'right', color: 'var(--purple-primary)' }}>TỔNG THANH TOÁN:</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--purple-primary)' }}>
                        {formatVnd(Number(orderForm.rawVnd) + Number(orderForm.taxWebVnd) + Number(orderForm.serviceFeeVnd) + Number(orderForm.shippingWeightFeeVnd))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Khách hàng */}
                <div style={{ backgroundColor: 'var(--bg-ivory)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    1. THÔNG TIN KHÁCH HÀNG & GIAO HÀNG
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Họ & Tên Khách Hàng</label>
                      <input
                        type="text"
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>Số Điện Thoại</label>
                      <input
                        type="text"
                        value={orderForm.customerPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value.replace(/[^0-9]/g, '') })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                  <CascadingAddressSelector
                    initialAddress={orderForm.customerAddress}
                    onChange={(addrInfo) => setOrderForm(prev => ({ ...prev, customerAddress: addrInfo.fullAddress }))}
                    required={false}
                  />
                </div>

                {/* Proof Hub */}
                <div style={{ backgroundColor: 'var(--bg-subtle-purple)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--purple-light)' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: 'var(--purple-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> 2. BẰNG CHỨNG MINH BẠCH 8 BƯỚC
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Video POV Store (Bước 4)</label>
                      <input
                        type="text"
                        value={orderForm.povVideoUrl}
                        onChange={(e) => setOrderForm({ ...orderForm, povVideoUrl: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Video Đóng Kiện (Bước 5)</label>
                      <input
                        type="text"
                        value={orderForm.packingVideoUrl}
                        onChange={(e) => setOrderForm({ ...orderForm, packingVideoUrl: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cân nặng (kg)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={orderForm.packageWeightKg}
                        onChange={(e) => setOrderForm({ ...orderForm, packageWeightKg: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mã AWB Air</label>
                      <input
                        type="text"
                        value={orderForm.trackingCode}
                        onChange={(e) => setOrderForm({ ...orderForm, trackingCode: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Vận đơn VN</label>
                      <input
                        type="text"
                        value={orderForm.domesticTrackingCode}
                        onChange={(e) => setOrderForm({ ...orderForm, domesticTrackingCode: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Trạng thái 8 bước */}
                <div style={{ backgroundColor: 'var(--bg-ivory)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Trạng thái quy trình 8 bước
                  </label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 800 }}
                  >
                    {['pending', 'deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed', 'cancelled'].map((k) => (
                      <option key={k} value={k}>{ORDER_STATUSES[k]?.label || k}</option>
                    ))}
                  </select>
                </div>

              </div>
            )}

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveModalOrder(null)}
                style={{ padding: '9px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Đóng
              </button>
              {!isPrintMode && (
                <button
                  disabled={isSaving}
                  onClick={handleSaveOrderChanges}
                  style={{ padding: '9px 22px', borderRadius: '8px', backgroundColor: 'var(--purple-primary)', color: 'var(--bg-white)', border: 'none', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Lưu Tất Cả Thay Đổi
                </button>
              )}
            </div>

          </div>
        </div>
      )}


      {/* ═══════════ MODAL: TẠO ĐƠN HÀNG THỦ CÔNG (MANUAL ORDER CREATION) ═══════════ */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-white)', borderRadius: '18px',
            width: '850px', maxWidth: '100%', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid var(--border-color)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px', backgroundColor: 'var(--bg-ivory)',
              borderBottom: '1px solid var(--border-color)', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={20} style={{ color: 'var(--purple-primary)' }} />
                  Tạo Đơn Hàng Mua Hộ Ngoài Hệ Thống
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Nhập thông tin khách hàng và danh sách sản phẩm cần mua hộ trực tiếp tại Store Hàn Quốc.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveManualOrder} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* KHỐI 1: THÔNG TIN KHÁCH HÀNG */}
              <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} style={{ color: 'var(--purple-primary)' }} />
                  1. Thông Tin Khách Hàng
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Tên khách hàng (*):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={manualForm.customerName}
                      onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Số điện thoại (*):
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0988888888"
                      value={manualForm.customerPhone}
                      onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Địa chỉ nhận hàng tại Việt Nam:
                  </label>
                  <input
                    type="text"
                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành..."
                    value={manualForm.customerAddress}
                    onChange={(e) => setManualForm({ ...manualForm, customerAddress: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* KHỐI 2: DANH SÁCH SẢN PHẨM NGOÀI HỆ THỐNG */}
              <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} style={{ color: 'var(--purple-primary)' }} />
                    2. Danh Sách Món Hàng Cần Mua Hộ ({manualForm.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddManualItem}
                    style={{
                      backgroundColor: 'var(--bg-subtle-purple)', color: 'var(--purple-primary)',
                      border: '1px solid var(--purple-light)', padding: '5px 12px',
                      borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    + Thêm Món
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {manualForm.items.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
                          Sản phẩm #{idx + 1}
                        </span>
                        {manualForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveManualItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            Xóa món này
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>
                            Tên sản phẩm (*):
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Kem Dưỡng Phục Hồi Aestura Atobarrier 365 Cream 80ml"
                            value={item.name}
                            onChange={(e) => handleManualItemChange(idx, 'name', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>
                            Giá gốc Store Hàn (Won ₩):
                          </label>
                          <input
                            type="number"
                            placeholder="VD: 31000"
                            value={item.foreignPrice}
                            onChange={(e) => handleManualItemChange(idx, 'foreignPrice', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>
                            Số lượng:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleManualItemChange(idx, 'qty', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>
                            Phân loại / Màu sắc / Size:
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Tuýp 80ml, Màu #01"
                            value={item.options}
                            onChange={(e) => handleManualItemChange(idx, 'options', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>
                            URL Ảnh sản phẩm (tùy chọn):
                          </label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={item.productImage}
                            onChange={(e) => handleManualItemChange(idx, 'productImage', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KHỐI 3: TỔNG KẾT TIỀN & TRẠNG THÁI KHỞI TẠO */}
              <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={16} style={{ color: 'var(--purple-primary)' }} />
                  3. Tổng Kết Tiền & Trạng Thái
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TỔNG TIỀN GỐC WON:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-dark)', marginTop: '2px' }}>
                      ₩{calculateManualTotals().totalKrw.toLocaleString('vi-VN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '2px' }}>
                      Tỷ giá: {krwRate}đ + {rates?.serviceFeePercent ?? 5}% Phí DV
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TỔNG VNĐ QUY ĐỔI GỢI Ý:</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--purple-primary)', marginTop: '2px' }}>
                      {formatVnd(calculateManualTotals().calculatedVnd)}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Tuỳ chỉnh Tổng VNĐ chốt với khách:
                    </label>
                    <input
                      type="number"
                      placeholder={`Mặc định: ${calculateManualTotals().calculatedVnd}`}
                      value={manualForm.customTotalVnd}
                      onChange={(e) => setManualForm({ ...manualForm, customTotalVnd: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--purple-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Trạng thái đơn hàng khởi tạo:
                    </label>
                    <select
                      value={manualForm.status}
                      onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      {['deposit_paid', 'pending', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed'].map((k) => (
                        <option key={k} value={k}>{ORDER_STATUSES[k]?.label || k}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Tình trạng thanh toán:
                    </label>
                    <select
                      value={manualForm.paymentStatus}
                      onChange={(e) => setManualForm({ ...manualForm, paymentStatus: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      <option value="paid">Đã thanh toán / Đã cọc 100%</option>
                      <option value="unpaid">Chưa thanh toán</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: 'var(--purple-primary)', color: '#FFFFFF', border: 'none', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(122, 75, 158, 0.3)' }}
                >
                  {isSaving ? 'Đang Lưu Đơn...' : '✓ Tạo & Đồng Bộ Lên Hệ Thống'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
