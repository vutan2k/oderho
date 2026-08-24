import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  Package, ArrowLeft, ShoppingBag,
  Copy, Check, CreditCard, ExternalLink,
  Video, PackageCheck, FileText, Plane, ShieldCheck,
  Truck, Scale, Info, Play, X, Zap, MessageSquare
} from 'lucide-react';
import ProductDetailModal from '../components/ProductDetailModal';
import { ORDER_STEPS, getOrderStepIndex, getStatusConfig } from '../data/orderStatuses';

export default function OrdersPage() {
  const { currentUser, orders, rates, oliveYoungCatalog } = useContext(AppContext);
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeMediaModal, setActiveMediaModal] = useState(null); // { type: 'video' | 'image', url: string, title: string }

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;

  const handleProductClick = (item, order) => {
    const itemName = item?.name || order?.productName;
    const match = oliveYoungCatalog?.find(p => p.id === item?.productId || (itemName && p.name?.toLowerCase() === itemName.toLowerCase()));
    if (match) {
      setDetailProduct(match);
    } else {
      setDetailProduct({
        id: item?.productId || order?.id || 'temp-id',
        name: itemName || 'Sản phẩm Hàn Quốc',
        brand: item?.brand || order?.brand || 'Olive Young',
        productImage: item?.productImage || order?.productImage,
        images: item?.productImage ? [item.productImage] : (order?.productImage ? [order.productImage] : []),
        foreignPrice: item?.foreignPrice || order?.foreignPrice || 0,
        description: 'Sản phẩm mua hộ trực tiếp từ Hàn Quốc.',
        options: item?.options || order?.options || 'Tiêu chuẩn'
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
        <Package size={54} style={{ color: 'var(--purple-primary)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Bạn cần đăng nhập tài khoản để theo dõi lịch sử và tiến trình vận chuyển đơn hàng của mình.
        </p>
        <button className="btn-gold" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Lọc danh sách đơn của người dùng
  const userOrders = orders.filter(
    (o) =>
      (o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (o.customerPhone && currentUser.phone && o.customerPhone === currentUser.phone)
  );

  const filteredOrders = userOrders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const formatVnd = (n) => (n || n === 0) ? `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} VNĐ` : '0 VNĐ';

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const steps = ORDER_STEPS;
  const getStepIndex = getOrderStepIndex;

  const statusTabs = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'pending', label: 'Chờ cọc' },
    { id: 'deposit_paid', label: 'Đã cọc 100%' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'purchased', label: 'Mua hàng (POV)' },
    { id: 'packed_kr', label: 'Đóng kiện' },
    { id: 'in_transit_air', label: 'Đang bay' },
    { id: 'customs_cleared', label: 'Kho VN' },
    { id: 'completed', label: 'Hoàn tất' }
  ];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--purple-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'var(--font-serif)' }}>Theo Dõi Đơn Hàng Của Tôi</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Tài khoản: <strong>{currentUser.name || currentUser.email}</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '6px' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === tab.id ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
              backgroundColor: activeTab === tab.id ? 'var(--purple-primary)' : '#FFF',
              color: activeTab === tab.id ? '#FFF' : '#374151',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', border: '1px dashed #D1D5DB', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: 'var(--purple-primary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>Chưa tìm thấy đơn hàng nào</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Hãy chọn mua các sản phẩm Mỹ phẩm & Thực phẩm chức năng Hàn Quốc chất lượng!</p>
          <button className="btn-gold" onClick={() => navigate('/')}>
            Khám phá sản phẩm ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {filteredOrders.map((order) => {
            const currentStepIdx = getStepIndex(order);
            const statusCfg = getStatusConfig(order.status);
            const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;
            const isPaidOrAdvanced = order.paymentStatus === 'paid' || ['deposit_paid', 'confirmed', 'purchased', 'packed_kr', 'in_transit_air', 'customs_cleared', 'completed', 'in_kr_warehouse', 'transit', 'in_vn_warehouse', 'delivering'].includes(order.status);

            // Tính tổng thanh toán
            let displayTotal = 0;
            if (order.totalVnd && order.totalVnd > 0) {
              displayTotal = order.totalVnd;
            } else if (order.quote?.totalVnd && order.quote.totalVnd > 0) {
              displayTotal = order.quote.totalVnd;
            } else if (Array.isArray(order.items) && order.items.length > 0) {
              displayTotal = order.items.reduce((sum, item) => {
                const itemPrice = item.price || Math.round((item.foreignPrice || 0) * krwRate * serviceFeeMultiplier);
                return sum + itemPrice * (item.qty || 1);
              }, 0);
            } else {
              displayTotal = Math.round((order.foreignPrice || 0) * krwRate * serviceFeeMultiplier * (order.qty || 1));
            }

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  overflow: 'hidden'
                }}
              >
                {/* Order Top Bar */}
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: '#FAF9F6',
                  borderBottom: '1px solid #EAE6DF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.78rem',
                      color: isPaidOrAdvanced ? statusCfg.color || '#059669' : '#D97706',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isPaidOrAdvanced ? <><Check size={14}/> {statusCfg.label.toUpperCase()}</> : <><Zap size={14}/> GIỎ HÀNG CHỜ CỌC 100%</>}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--purple-primary)' }}>{order.id}</h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ngày đặt:</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', paddingLeft: '15px', borderLeft: '1px solid #EAE6DF' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Tổng thanh toán:</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {formatVnd(displayTotal)}
                      </div>
                    </div>

                    {/* NÚT THANH TOÁN CỌC (CHỈ HIỆN KHI ĐƠN CHƯA CỌC) */}
                    {!isPaidOrAdvanced && (
                      <div style={{ paddingLeft: '15px', borderLeft: '1px solid #EAE6DF' }}>
                        <button
                          onClick={() => navigate(`/payment/${order.id}`)}
                          style={{
                            backgroundColor: 'var(--purple-primary)',
                            color: '#FFF',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(122, 75, 158, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <CreditCard size={16} />
                          <span>Thanh toán cọc</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar 8 Bước Minh Bạch */}
                <div style={{ padding: '24px 20px', backgroundColor: '#FDFBFF', borderBottom: '1px solid #EAE6DF' }}>
                  <div className="order-timeline">
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div
                          key={st.key}
                          className="timeline-item"
                          data-completed={isCompleted}
                          data-current={isCurrent}
                        >
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--purple-primary)' : '#E5E7EB',
                            color: isCompleted ? '#FFF' : '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            transition: 'all 0.3s ease'
                          }}>
                            {isCompleted ? <Check size={16} /> : idx + 1}
                          </div>

                          <span style={{
                            fontWeight: isCurrent ? 800 : (isCompleted ? 700 : 500),
                            color: isCompleted ? 'var(--purple-primary)' : '#6B7280',
                            lineHeight: 1.3
                          }}>
                            {st.shortLabel || st.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PROOF HUB (BẰNG CHỨNG MUA HÀNG & ĐÓNG GÓI) */}
                {(order.povVideoUrl || order.receiptImageUrl || order.packingVideoUrl || order.packageWeightKg || order.flightCode || order.domesticTrackingCode) && (
                  <div style={{
                    padding: '18px 24px',
                    backgroundColor: '#F7F4EB',
                    borderBottom: '1px solid #EAE6DF',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={20} style={{ color: 'var(--purple-primary)' }} />
                      <strong style={{ fontSize: '0.88rem', color: '#1F2937' }}>
                        Minh bạch 100% từ TAVY Korea:
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {/* Nút xem Video POV Mua hàng */}
                      {order.povVideoUrl && (
                        <button
                          onClick={() => setActiveMediaModal({ type: 'video', url: order.povVideoUrl, title: 'Video POV Mua Hàng tại Hàn Quốc' })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid var(--purple-primary)',
                            color: 'var(--purple-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                          }}
                        >
                          <Video size={15} />
                          <span>Video POV Mua Hàng</span>
                        </button>
                      )}

                      {/* Nút xem Hóa đơn Store */}
                      {order.receiptImageUrl && (
                        <button
                          onClick={() => setActiveMediaModal({ type: 'image', url: order.receiptImageUrl, title: 'Hóa Đơn / Bill Mua Hàng tại Hàn Quốc' })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #4B5563',
                            color: '#374151',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                          }}
                        >
                          <FileText size={15} />
                          <span>Xem Bill Store</span>
                        </button>
                      )}

                      {/* Nút xem Video Đóng Gói */}
                      {order.packingVideoUrl && (
                        <button
                          onClick={() => setActiveMediaModal({ type: 'video', url: order.packingVideoUrl, title: 'Video Đóng Gói Kiện Hàng tại Kho Seoul' })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #DB2777',
                            color: '#DB2777',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                          }}
                        >
                          <PackageCheck size={15} />
                          <span>Video Đóng Kiện</span>
                        </button>
                      )}

                      {/* Thông tin Cân Nặng */}
                      {order.packageWeightKg && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#374151'
                        }}>
                          <Scale size={14} style={{ color: '#059669' }} />
                          <span>Cân nặng: <strong>{order.packageWeightKg} kg</strong></span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Chi tiết sản phẩm & Vận đơn */}
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: order.trackingCode || order.domesticTrackingCode ? '1.2fr 1fr' : '1fr', gap: '20px', alignItems: 'center' }}>

                  {/* Chi tiết sản phẩm */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {order.items ? order.items.map((item, idx) => {
                      const itemPrice = item.price || Math.round((item.foreignPrice || 0) * krwRate * serviceFeeMultiplier);
                      const itemTotal = itemPrice * (item.qty || 1);
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', borderBottom: idx < order.items.length - 1 ? '1px dashed #E5E7EB' : 'none', paddingBottom: idx < order.items.length - 1 ? '12px' : 0 }}>
                          <div
                            onClick={() => handleProductClick(item, order)}
                            style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, cursor: 'pointer' }}
                            title="Bấm để xem chi tiết sản phẩm"
                          >
                            <img src={item.productImage} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', transition: 'transform 0.2s ease' }} />
                            <div>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--purple-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{item.name}</span>
                                <ExternalLink size={14} style={{ opacity: 0.7 }} />
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {item.options ? `${item.options} | ` : ''}Số lượng: x{item.qty || 1}
                              </p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '130px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-primary)' }}>
                              {formatVnd(itemTotal)}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                              {formatVnd(itemPrice)} × {item.qty || 1}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div
                          onClick={() => handleProductClick(null, order)}
                          style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, cursor: 'pointer' }}
                          title="Bấm để xem chi tiết sản phẩm"
                        >
                          {order.productImage && (
                            <img src={order.productImage} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px' }} />
                          )}
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{order.productName}</span>
                              <ExternalLink size={14} style={{ opacity: 0.7 }} />
                            </h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              Thương hiệu: {order.brand} | Quy cách: {order.options} | Số lượng: x{order.qty || 1}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '130px' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-primary)' }}>
                            {formatVnd(Math.round((order.foreignPrice || 0) * krwRate * serviceFeeMultiplier * (order.qty || 1)))}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                            {formatVnd(Math.round((order.foreignPrice || 0) * krwRate * serviceFeeMultiplier))} × {order.qty || 1}
                          </div>
                        </div>
                      </div>
                    )}
                    {order.adminNote && (
                      <div style={{ marginTop: '8px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#D97706', backgroundColor: '#FEF3C7', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MessageSquare size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>Ghi chú từ Admin: {order.adminNote}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Thông tin Vận đơn Air & Nội Địa */}
                  {(order.trackingCode || order.domesticTrackingCode) && (
                    <div style={{ backgroundColor: '#FAF9F6', padding: '16px', borderRadius: '12px', border: '1px solid #EAE6DF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {order.trackingCode && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Plane size={13} style={{ color: '#0891B2' }} /> MÃ VẬN ĐƠN AIR (HÀN - VIỆT)
                            </span>
                            <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: 'var(--purple-primary)' }}>
                              {order.trackingCode}
                            </strong>
                          </div>
                          <button
                            onClick={() => handleCopyCode(order.trackingCode)}
                            style={{
                              backgroundColor: copiedCode === order.trackingCode ? '#10B981' : 'var(--purple-primary)',
                              color: '#FFF',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedCode === order.trackingCode ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copiedCode === order.trackingCode ? 'Đã chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                      )}

                      {order.domesticTrackingCode && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: order.trackingCode ? '1px dashed #E5E7EB' : 'none', paddingTop: order.trackingCode ? '10px' : 0 }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Truck size={13} style={{ color: '#059669' }} /> VẬN CHUYỂN NỘI ĐỊA ({order.domesticCarrier || 'ViettelPost'})
                            </span>
                            <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: '#059669' }}>
                              {order.domesticTrackingCode}
                            </strong>
                          </div>
                          <button
                            onClick={() => handleCopyCode(order.domesticTrackingCode)}
                            style={{
                              backgroundColor: copiedCode === order.domesticTrackingCode ? '#10B981' : '#059669',
                              color: '#FFF',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedCode === order.domesticTrackingCode ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copiedCode === order.domesticTrackingCode ? 'Đã chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Media Viewer Modal (Video POV / Bill Store / Packing Video) */}
      {activeMediaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #EAE6DF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF9F6'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                {activeMediaModal.title}
              </h3>
              <button
                onClick={() => setActiveMediaModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#000000' }}>
              {activeMediaModal.type === 'video' ? (
                <video
                  src={activeMediaModal.url}
                  controls
                  autoPlay
                  style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px' }}
                >
                  Trình duyệt không hỗ trợ xem video.
                </video>
              ) : (
                <img
                  src={activeMediaModal.url}
                  alt={activeMediaModal.title}
                  style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>

            <div style={{ padding: '12px 20px', textAlign: 'right', backgroundColor: '#FAF9F6', borderTop: '1px solid #EAE6DF' }}>
              <button
                onClick={() => setActiveMediaModal(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--purple-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal Chi Tiết Sản Phẩm */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          krwRate={krwRate * serviceFeeMultiplier}
          onClose={() => setDetailProduct(null)}
          hideAddToCart={true}
        />
      )}

    </div>
  );
}
