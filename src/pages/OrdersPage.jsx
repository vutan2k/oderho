import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  Package, ArrowLeft, ShoppingBag, 
  Copy, Check, CreditCard, ExternalLink
} from 'lucide-react';
import ProductDetailModal from '../components/ProductDetailModal';

export default function OrdersPage() {
  const { currentUser, orders, rates, oliveYoungCatalog, addToCart } = useContext(AppContext);
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [detailProduct, setDetailProduct] = useState(null);

  const krwRate = rates?.KRW?.rate || 19.5;

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

  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Các bước tiến trình thực tế (8 bước)
  const steps = [
    { key: 'pending', title: 'Chờ cọc' },
    { key: 'deposit_paid', title: 'Đã cọc 100%' },
    { key: 'purchased', title: 'Đang mua hộ' },
    { key: 'in_kr_warehouse', title: 'Kho Seoul' },
    { key: 'transit', title: 'Shipping' },
    { key: 'in_vn_warehouse', title: 'Kho VN' },
    { key: 'delivering', title: 'Đang giao' },
    { key: 'completed', title: 'Đã giao' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending':
      case 'quoted':
        return 0;
      case 'deposit_paid': return 1;
      case 'purchased': return 2;
      case 'in_kr_warehouse': return 3;
      case 'transit': return 4;
      case 'in_vn_warehouse': return 5;
      case 'delivering': return 6;
      case 'completed': return 7;
      default: return 0;
    }
  };

  const statusTabs = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'pending', label: 'Chờ cọc' },
    { id: 'deposit_paid', label: 'Đã cọc 100%' },
    { id: 'purchased', label: 'Đang mua hộ' },
    { id: 'transit', label: 'Shipping' },
    { id: 'completed', label: 'Hoàn thành' }
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
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '4px' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: activeTab === tab.id ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
              backgroundColor: activeTab === tab.id ? 'var(--purple-primary)' : '#FFF',
              color: activeTab === tab.id ? '#FFF' : '#374151',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredOrders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);
            const krwRate = rates?.KRW?.rate || 19.5;

            // Tính tổng hóa đơn 100% chuẩn xác (không bao giờ bằng 0đ)
            let displayTotal = 0;
            if (order.totalVnd && order.totalVnd > 0) {
              displayTotal = order.totalVnd;
            } else if (order.quote?.totalVnd && order.quote.totalVnd > 0) {
              displayTotal = order.quote.totalVnd;
            } else if (Array.isArray(order.items) && order.items.length > 0) {
              displayTotal = order.items.reduce((sum, item) => {
                const itemPrice = item.price || Math.round((item.foreignPrice || 0) * krwRate);
                return sum + itemPrice * (item.qty || 1);
              }, 0);
            } else {
              displayTotal = Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1));
            }

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                {/* Order Top Bar */}
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: order.paymentStatus !== 'paid' && order.status === 'pending' ? '#D97706' : '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {order.paymentStatus !== 'paid' && order.status === 'pending' ? '⚡ GIỎ HÀNG CHỜ CỌC 100%' : 'MÃ ĐƠN HÀNG HOÀN CHỈNH'}
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

                    <div style={{ textAlign: 'right', paddingLeft: '15px', borderLeft: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Tổng thanh toán:</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {formatVnd(displayTotal)}
                      </div>
                    </div>

                    {/* NÚT THANH TOÁN CỌC (HIỆN KHI ĐƠN CHƯA CỌC / CHỜ CỌC) */}
                    {(order.paymentStatus !== 'paid' && order.status !== 'completed' && order.status !== 'purchased') && (
                      <div style={{ paddingLeft: '15px', borderLeft: '1px solid #E5E7EB' }}>
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

                {/* Progress Bar 8 Bước */}
                <div style={{ padding: '30px 24px', backgroundColor: '#FDFBFF', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    
                    {/* Line nối */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '8%',
                      right: '8%',
                      height: '3px',
                      backgroundColor: '#E5E7EB',
                      zIndex: 1
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: 'var(--purple-primary)',
                        width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                        transition: 'width 0.4s ease'
                      }}></div>
                    </div>

                    {/* Step Circles */}
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={st.key} style={{ zIndex: 2, textAlign: 'center', flex: 1 }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--purple-primary)' : '#FFF',
                            color: isCompleted ? '#FFF' : '#9CA3AF',
                            border: isCompleted ? '2px solid var(--purple-primary)' : '2px solid #E5E7EB',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            marginBottom: '8px',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(122, 75, 158, 0.2)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {isCompleted ? <Check size={18} /> : idx + 1}
                          </div>
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCompleted ? 'var(--purple-primary)' : '#6B7280'
                          }}>
                            {st.title}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Tracking Code Bar & Info */}
                {(() => {
                  const showTracking = Boolean(order.trackingCode || (order.paymentStatus === 'paid' && order.status !== 'pending'));
                  return (
                    <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: showTracking ? '1.2fr 1fr' : '1fr', gap: '20px', alignItems: 'center' }}>
                      
                      {/* Chi tiết sản phẩm */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {order.items ? order.items.map((item, idx) => {
                          const itemPrice = item.price || Math.round((item.foreignPrice || 0) * krwRate);
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
                                {formatVnd(Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1)))}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                                {formatVnd(Math.round((order.foreignPrice || 0) * krwRate))} × {order.qty || 1}
                              </div>
                            </div>
                          </div>
                        )}
                        {order.adminNote && (
                          <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#D97706', backgroundColor: '#FEF3C7', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                              💬 Ghi chú từ Admin: {order.adminNote}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mã Vận Đơn Air (Chỉ hiện khi đã cọc 100% hoặc có mã vận thực) */}
                      {showTracking && (
                        <div style={{ backgroundColor: '#F9FAFB', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block' }}>MÃ VẬN ĐƠN (AIR HÀN - VIỆT)</span>
                            <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: 'var(--purple-primary)' }}>
                              {order.trackingCode || 'Đang cập nhật...'}
                            </strong>
                          </div>

                          {order.trackingCode && (
                            <button
                              onClick={() => handleCopyCode(order.trackingCode)}
                              style={{
                                backgroundColor: copiedCode === order.trackingCode ? '#10B981' : 'var(--purple-primary)',
                                color: '#FFF',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {copiedCode === order.trackingCode ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copiedCode === order.trackingCode ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })()}

              </div>
            );
          })}
        </div>
      )}

      {/* Popup Modal Chi Tiết Sản Phẩm */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          krwRate={krwRate}
          onClose={() => setDetailProduct(null)}
          hideAddToCart={true}
        />
      )}

    </div>
  );
}
