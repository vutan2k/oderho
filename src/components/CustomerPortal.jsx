import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Calendar, Package, MapPin, Phone, User, Check, ExternalLink, HelpCircle } from 'lucide-react';

export default function CustomerPortal() {
  const { orders, rates, user, confirmPayment } = useContext(AppContext);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders for the current user
  const userOrders = orders.filter(
    (order) => order.customerName === user?.username || user?.username === 'Khách dùng thử'
  );

  const formatVnd = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending">Chờ báo giá</span>;
      case 'quoted':
        return <span className="badge badge-quoted">Đã báo giá</span>;
      case 'paid':
        return <span className="badge badge-paid">Đã đặt cọc</span>;
      case 'transit':
        return <span className="badge badge-transit">Đang về VN</span>;
      case 'completed':
        return <span className="badge badge-completed">Đã giao hàng</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getTimelineStep = (status) => {
    const steps = ['pending', 'quoted', 'paid', 'transit', 'completed'];
    return steps.indexOf(status);
  };

  const handleMockPayment = (orderId, amount) => {
    confirmPayment(orderId, amount);
    alert('Hệ thống đã ghi nhận yêu cầu xác nhận chuyển khoản của bạn. Admin sẽ kiểm tra và cập nhật trạng thái mua hàng!');
  };

  return (
    <div id="customer-dashboard" className="animate-fade-in" style={{ padding: '40px 0' }}>
      <div className="container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '5px' }}>Đơn hàng của tôi</h2>
            <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem' }}>
              Chào mừng quay lại, <strong>{user?.username}</strong>. Theo dõi tiến trình đơn hàng mua hộ của bạn tại đây.
            </p>
          </div>
          <div style={{
            background: 'var(--primary-rose-light)',
            color: 'var(--primary-rose-dark)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid rgba(183, 110, 121, 0.2)'
          }}>
            Tổng số đơn hàng: {userOrders.length}
          </div>
        </div>

        {userOrders.length === 0 ? (
          <div className="glass" style={{
            padding: '50px',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <Package size={48} style={{ color: 'var(--primary-rose)', marginBottom: '15px', opacity: 0.7 }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Bạn chưa có đơn hàng nào</h3>
            <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Hãy sử dụng form phía trên để gửi liên kết sản phẩm mỹ phẩm cần mua hộ.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => {
              const el = document.getElementById('order-form-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Gửi yêu cầu ngay
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {userOrders.map((order) => {
              const stepIndex = getTimelineStep(order.status);
              const isSelected = selectedOrder?.id === order.id;
              const rateInfo = rates[order.country];

              return (
                <div 
                  key={order.id} 
                  className="glass" 
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1.5px solid var(--primary-rose)' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                    overflow: 'hidden',
                    transition: 'all 0.3s'
                  }}
                >
                  {/* Order Summary Header */}
                  <div 
                    onClick={() => setSelectedOrder(isSelected ? null : order)}
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--primary-rose-light)' : 'transparent',
                      transition: 'background-color 0.2s',
                      gap: '15px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        backgroundColor: 'var(--white)'
                      }}>
                        <img 
                          src={order.productImage || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=100&q=80'} 
                          alt="sản phẩm" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--charcoal)', marginTop: '4px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.productName}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--charcoal-light)' }}>Ngày gửi</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--charcoal-light)' }}>Giá gốc web</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-rose-dark)' }}>
                          {order.foreignPrice} {rateInfo?.symbol} × {order.qty}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--charcoal-light)' }}>Ước tính VND</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                          {order.quote ? formatVnd(order.quote.totalVnd) : 'Chờ báo giá...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Body (Expands when clicked) */}
                  {isSelected && (
                    <div className="animate-fade-in" style={{
                      padding: '24px',
                      borderTop: '1px solid var(--border-color)',
                      backgroundColor: 'rgba(255,255,255,0.4)',
                    }}>
                      
                      {/* 1. Visual Timeline Progress */}
                      <div style={{ marginBottom: '35px' }}>
                        <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--charcoal-light)' }}>
                          Tiến trình đơn hàng
                        </h5>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          position: 'relative',
                          maxWidth: '700px',
                          margin: '0 auto',
                          padding: '0 20px'
                        }}>
                          {/* Gray line background */}
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '40px',
                            right: '40px',
                            height: '4px',
                            backgroundColor: '#E2E3E5',
                            zIndex: 1
                          }}></div>
                          
                          {/* Active line background */}
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '40px',
                            width: `${(stepIndex / 4) * 88}%`,
                            height: '4px',
                            backgroundColor: 'var(--primary-rose)',
                            zIndex: 1,
                            transition: 'width 0.4s ease'
                          }}></div>

                          {/* Timeline steps */}
                          {[
                            { label: 'Gửi yêu cầu', desc: 'Shop đã nhận' },
                            { label: 'Đã báo giá', desc: 'Chờ đặt cọc' },
                            { label: 'Đã đặt cọc', desc: 'Shop đã mua' },
                            { label: 'Đang về VN', desc: 'Hàng bay quốc tế' },
                            { label: 'Hoàn thành', desc: 'Đã giao hàng' }
                          ].map((step, idx) => {
                            const isActive = idx <= stepIndex;
                            const isCurrent = idx === stepIndex;
                            return (
                              <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 2,
                                width: '80px',
                                textAlign: 'center'
                              }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: isCurrent ? 'var(--primary-rose)' : isActive ? 'var(--primary-rose-dark)' : '#E2E3E5',
                                  color: 'var(--white)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '0.85rem',
                                  boxShadow: isCurrent ? '0 0 10px rgba(183, 110, 121, 0.6)' : 'none',
                                  border: '3px solid var(--white)'
                                }}>
                                  {idx < stepIndex ? <Check size={14} /> : idx + 1}
                                </div>
                                <p style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400, marginTop: '8px', color: isActive ? 'var(--charcoal)' : 'var(--charcoal-light)' }}>
                                  {step.label}
                                </p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--charcoal-light)', marginTop: '2px' }}>
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Left and Right Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginTop: '20px' }}>
                        
                        {/* Left: Product Info & Delivery address */}
                        <div>
                          <h5 style={{ fontSize: '0.9rem', color: 'var(--primary-rose-dark)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                            Thông tin sản phẩm & Vận chuyển
                          </h5>
                          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                            <img 
                              src={order.productImage} 
                              alt={order.productName} 
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} 
                            />
                            <div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--charcoal-light)' }}>{order.brand}</p>
                              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--charcoal)' }}>{order.productName}</h4>
                              <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-light)' }}>Tùy chọn: {order.options}</p>
                              <a 
                                href={order.productUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ fontSize: '0.75rem', color: 'var(--primary-rose)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px', fontWeight: 500 }}
                              >
                                Xem link gốc <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={14} style={{ color: 'var(--primary-rose)' }} />
                              <span>Người nhận: <strong>{order.customerName}</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={14} style={{ color: 'var(--primary-rose)' }} />
                              <span>Điện thoại: {order.customerPhone}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <MapPin size={14} style={{ color: 'var(--primary-rose)', marginTop: '3px' }} />
                              <span>Địa chỉ giao: {order.customerAddress}</span>
                            </div>
                            {order.customerNote && (
                              <div style={{ marginTop: '5px', padding: '8px', borderLeft: '3px solid var(--primary-rose)', backgroundColor: 'var(--cream-bg)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                Ghi chú: "{order.customerNote}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Invoice details / QR Code Payment */}
                        <div>
                          {order.quote ? (
                            <div>
                              <h5 style={{ fontSize: '0.9rem', color: 'var(--primary-rose-dark)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                                Chi tiết báo giá hóa đơn
                              </h5>
                              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(183,110,121,0.1)' }}>
                                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--charcoal-light)' }}>Giá gốc ({order.qty} sản phẩm):</span>
                                  <span>{formatVnd(order.quote.rawVnd)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--charcoal-light)' }}>Thuế web:</span>
                                  <span>{formatVnd(order.quote.taxWebVnd)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--charcoal-light)' }}>Phí mua hộ ({rates.serviceFeePercent}%):</span>
                                  <span>{formatVnd(order.quote.serviceFeeVnd)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--charcoal-light)' }}>Cước bay ({order.quote.shippingWeightKg}kg):</span>
                                  <span>{formatVnd(order.quote.shippingWeightFeeVnd)}</span>
                                </div>
                                {order.quote.note && (
                                  <div style={{ fontSize: '0.8rem', padding: '8px', backgroundColor: 'var(--primary-rose-light)', borderRadius: 'var(--radius-sm)', color: 'var(--primary-rose-dark)', margin: '4px 0' }}>
                                    💡 Ghi chú của shop: {order.quote.note}
                                  </div>
                                )}
                                <div style={{ borderTop: '1px dashed var(--border-color)', margin: '5px 0' }}></div>
                                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                                  <span>TỔNG CỘNG VỀ TAY:</span>
                                  <span style={{ color: 'var(--primary-rose-dark)' }}>{formatVnd(order.quote.totalVnd)}</span>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--charcoal-light)' }}>
                                  <span>Số tiền cọc tối thiểu (50%):</span>
                                  <span>{formatVnd(order.quote.depositNeededVnd)}</span>
                                </div>
                                
                                {order.paymentConfirmed ? (
                                  <div style={{
                                    marginTop: '12px',
                                    padding: '10px',
                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                    color: '#2E7D32',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontWeight: 600
                                  }}>
                                    <Check size={16} />
                                    <span>Đã đặt cọc thành công!</span>
                                  </div>
                                ) : null}
                              </div>

                              {/* VietQR Generation for Payment */}
                              {!order.paymentConfirmed && order.status === 'quoted' && (
                                <div style={{
                                  marginTop: '15px',
                                  padding: '15px',
                                  border: '1.5px solid var(--primary-rose)',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: 'var(--white)',
                                  textAlign: 'center'
                                }}>
                                  <h6 style={{ fontSize: '0.9rem', color: 'var(--primary-rose-dark)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    Quét mã VietQR chuyển khoản cọc
                                  </h6>
                                  
                                  {/* Real VietQR Dynamic Image */}
                                  <div style={{ margin: '15px auto', width: '150px', height: '150px', border: '1px solid #ddd', padding: '5px', borderRadius: '4px' }}>
                                    <img 
                                      src={`https://img.vietqr.io/image/vietcombank-1014522956-compact2.png?amount=${order.quote.depositNeededVnd}&addInfo=DEPOSIT%20${order.id}&accountName=BEAUTY%20CARGO`} 
                                      alt="Mã QR Chuyển khoản" 
                                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                    />
                                  </div>

                                  <div style={{ fontSize: '0.8rem', textAlign: 'left', backgroundColor: 'var(--cream-bg)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', color: 'var(--charcoal-light)' }}>
                                    <p>🏦 Ngân hàng: <strong>Vietcombank (VCB)</strong></p>
                                    <p>💳 Số tài khoản: <strong>1014522956</strong></p>
                                    <p>👤 Chủ tài khoản: <strong>BEAUTY CARGO SHOP</strong></p>
                                    <p>💰 Số tiền cọc: <strong style={{ color: 'var(--primary-rose-dark)' }}>{formatVnd(order.quote.depositNeededVnd)}</strong></p>
                                    <p>📝 Nội dung: <strong>DEPOSIT {order.id}</strong></p>
                                  </div>

                                  <button 
                                    className="btn btn-primary btn-sm" 
                                    style={{ width: '100%' }}
                                    onClick={() => handleMockPayment(order.id, order.quote.depositNeededVnd)}
                                  >
                                    Xác nhận đã chuyển khoản
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{
                              height: '100%',
                              minHeight: '200px',
                              border: '1.5px dashed var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: '20px',
                              textAlign: 'center',
                              color: 'var(--charcoal-light)',
                              fontSize: '0.85rem'
                            }}>
                              <HelpCircle size={32} style={{ color: 'var(--primary-rose)', marginBottom: '8px', opacity: 0.5 }} />
                              <p style={{ fontWeight: 600 }}>Chờ Báo Giá Chi Tiết</p>
                              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                Shop đang kiểm tra hàng và tính cước vận chuyển thực tế để gửi hóa đơn cho bạn.
                              </p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
