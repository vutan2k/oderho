import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Edit, Save, Check, RefreshCw, Settings, Search, Filter, AlertTriangle, ArrowRight, Scale, TrendingUp } from 'lucide-react';

export default function AdminPortal() {
  const { orders, rates, updateRates, updateOrderQuote, updateOrderStatus, confirmPayment } = useContext(AppContext);
  
  // Rate configuration states
  const [usdRate, setUsdRate] = useState(rates.USD.rate);
  const [krwRate, setKrwRate] = useState(rates.KRW.rate);
  const [jpyRate, setJpyRate] = useState(rates.JPY.rate);
  const [usdShip, setUsdShip] = useState(rates.USD.shippingFee);
  const [krwShip, setKrwShip] = useState(rates.KRW.shippingFee);
  const [jpyShip, setJpyShip] = useState(rates.JPY.shippingFee);
  const [serviceFee, setServiceFee] = useState(rates.serviceFeePercent);
  const [isRatesEditing, setIsRatesEditing] = useState(false);

  // Quote form state
  const [quotingOrderId, setQuotingOrderId] = useState(null);
  const [taxPercent, setTaxPercent] = useState('8');
  const [weight, setWeight] = useState('0.2');
  const [adminNote, setAdminNote] = useState('');

  // Search & Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatVnd = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateRates({
      USD: { ...rates.USD, rate: parseFloat(usdRate), shippingFee: parseFloat(usdShip) },
      KRW: { ...rates.KRW, rate: parseFloat(krwRate), shippingFee: parseFloat(krwShip) },
      JPY: { ...rates.JPY, rate: parseFloat(jpyRate), shippingFee: parseFloat(jpyShip) },
      serviceFeePercent: parseFloat(serviceFee),
    });
    setIsRatesEditing(false);
    alert('Cập nhật tỷ giá và biểu phí dịch vụ thành công!');
  };

  const handleSendQuote = (e) => {
    e.preventDefault();
    updateOrderQuote(quotingOrderId, {
      taxWebPercent: parseFloat(taxPercent) || 0,
      shippingWeightKg: parseFloat(weight) || 0,
      note: adminNote,
    });
    setQuotingOrderId(null);
    setTaxPercent('8');
    setWeight('0.2');
    setAdminNote('');
    alert('Đã gửi báo giá chính thức cho khách hàng!');
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ báo giá';
      case 'quoted': return 'Đang đợi khách cọc';
      case 'paid': return 'Đã cọc - Cần mua hàng';
      case 'transit': return 'Đang về Việt Nam';
      case 'completed': return 'Đã hoàn thành';
      default: return status;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
      <div className="container">
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '5px' }}>Cổng Quản Trị Hệ Thống</h2>
            <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem' }}>
              Quản lý đơn hàng mua hộ, cập nhật báo giá chi tiết, phê duyệt đặt cọc và thiết lập tỷ giá.
            </p>
          </div>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsRatesEditing(!isRatesEditing)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings size={16} />
            <span>{isRatesEditing ? 'Đóng cấu hình' : 'Thiết lập Tỷ giá & Phí'}</span>
          </button>
        </div>

        {/* Rates and Config Form */}
        {isRatesEditing && (
          <div className="glass animate-fade-in" style={{
            padding: '25px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '35px',
            border: '1.5px solid var(--primary-rose)',
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', color: 'var(--primary-rose-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={18} />
              Cấu hình Tỷ giá mua hộ và Phí dịch vụ
            </h3>
            
            <form onSubmit={handleSaveRates}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Exchange Rates */}
                <div style={{ backgroundColor: 'var(--white)', padding: '15px', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>1. Tỷ giá quy đổi (VND)</h4>
                  <div className="form-group">
                    <label className="form-label">Tỷ giá USD ($)</label>
                    <input type="number" className="form-control" value={usdRate} onChange={(e) => setUsdRate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tỷ giá Hàn KRW (₩)</label>
                    <input type="number" step="0.1" className="form-control" value={krwRate} onChange={(e) => setKrwRate(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tỷ giá Nhật JPY (¥)</label>
                    <input type="number" className="form-control" value={jpyRate} onChange={(e) => setJpyRate(e.target.value)} required />
                  </div>
                </div>

                {/* International Shipping Fees */}
                <div style={{ backgroundColor: 'var(--white)', padding: '15px', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>2. Cước bay quốc tế (VND/KG)</h4>
                  <div className="form-group">
                    <label className="form-label">Cước Mỹ - Việt</label>
                    <input type="number" className="form-control" value={usdShip} onChange={(e) => setUsdShip(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cước Hàn - Việt</label>
                    <input type="number" className="form-control" value={krwShip} onChange={(e) => setKrwShip(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cước Nhật - Việt</label>
                    <input type="number" className="form-control" value={jpyShip} onChange={(e) => setJpyShip(e.target.value)} required />
                  </div>
                </div>

                {/* General service fee */}
                <div style={{ backgroundColor: 'var(--white)', padding: '15px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>3. Phí dịch vụ mua hộ</h4>
                    <div className="form-group">
                      <label className="form-label">Phí dịch vụ toàn hệ thống (%)</label>
                      <div className="input-with-addon">
                        <input type="number" className="form-control" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} required />
                        <span className="input-addon">%</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsRatesEditing(false)}>Hủy</button>
                    <button type="submit" className="btn btn-primary btn-sm">Lưu cấu hình</button>
                  </div>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* Quoting Modal Form */}
        {quotingOrderId && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(44, 48, 46, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: '20px'
          }}>
            <div className="glass animate-fade-in" style={{
              width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-md)', padding: '30px'
            }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1.4rem' }}>Nhập Báo Giá Chi Tiết</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--charcoal-light)', marginBottom: '20px' }}>
                Đơn hàng: <strong style={{ color: 'var(--primary-rose)' }}>{quotingOrderId}</strong>. Vui lòng xác định thuế nội địa bang và cân nặng thực tế.
              </p>
              
              <form onSubmit={handleSendQuote}>
                <div className="form-group">
                  <label className="form-label">Thuế Web Mỹ / Phí mua nội địa nước ngoài (%)</label>
                  <div className="input-with-addon">
                    <input 
                      type="number" 
                      className="form-control" 
                      value={taxPercent} 
                      onChange={(e) => setTaxPercent(e.target.value)} 
                      min="0" step="0.5" required 
                    />
                    <span className="input-addon">%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cân nặng thực tế sản phẩm (KG)</label>
                  <div className="input-with-addon">
                    <input 
                      type="number" 
                      className="form-control" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)} 
                      min="0" step="0.01" required 
                    />
                    <span className="input-addon">KG</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú gửi Khách hàng</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Nhập thông tin giao hàng dự kiến hoặc thông tin chi tiết..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setQuotingOrderId(null)}>Hủy</button>
                  <button type="submit" className="btn btn-primary btn-sm">Gửi báo giá</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Orders List Workspace */}
        <div className="glass" style={{
          padding: '30px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)'
        }}>
          
          {/* List Headers, Search & Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Danh sách đơn hàng cần xử lý</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', width: '100%', maxWidth: '650px', justifyContent: 'flex-end' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm kiếm: Mã đơn, Khách hàng, Tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--charcoal-light)' }} />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                <Filter size={16} style={{ color: 'var(--charcoal-light)' }} />
                <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ báo giá (New)</option>
                  <option value="quoted">Chờ khách đặt cọc</option>
                  <option value="paid">Khách đã đặt cọc</option>
                  <option value="transit">Đang vận chuyển về VN</option>
                  <option value="completed">Đã giao hàng thành công</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table/Cards list */}
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--charcoal-light)' }}>
              Không có đơn hàng nào khớp với tìm kiếm hoặc bộ lọc hiện tại.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredOrders.map((order) => {
                const rateInfo = rates[order.country];
                
                return (
                  <div 
                    key={order.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--white)',
                      padding: '20px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--charcoal)' }}>{order.id}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--charcoal-light)' }}>
                            ({new Date(order.createdAt).toLocaleString('vi-VN')})
                          </span>
                          <span className={`badge ${
                            order.status === 'pending' ? 'badge-pending' :
                            order.status === 'quoted' ? 'badge-quoted' :
                            order.status === 'paid' ? 'badge-paid' :
                            order.status === 'transit' ? 'badge-transit' :
                            'badge-completed'
                          }`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                          <img 
                            src={order.productImage} 
                            alt={order.productName} 
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                          />
                          <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--charcoal-light)' }}>{order.brand}</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{order.productName}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-light)' }}>
                              Option: {order.options} | Số lượng: {order.qty} | Giá gốc: {order.foreignPrice} {rateInfo?.symbol}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Customer contact card */}
                      <div style={{ fontSize: '0.8rem', backgroundColor: 'var(--cream-bg)', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', minWidth: '220px' }}>
                        <p style={{ fontWeight: 600, borderBottom: '1px solid #ddd', paddingBottom: '3px', marginBottom: '5px' }}>Khách hàng:</p>
                        <p>👤 {order.customerName}</p>
                        <p>📞 {order.customerPhone}</p>
                        <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }} title={order.customerAddress}>
                          📍 {order.customerAddress}
                        </p>
                      </div>
                    </div>

                    {/* Pricing details and actions bar */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '15px',
                      marginTop: '15px',
                      gap: '15px'
                    }}
                    >
                      {/* Price breakdown */}
                      <div>
                        {order.quote ? (
                          <div style={{ fontSize: '0.85rem', display: 'flex', gap: '20px', color: 'var(--charcoal-light)' }}>
                            <p>Tổng tiền về tay: <strong style={{ color: 'var(--charcoal)' }}>{formatVnd(order.quote.totalVnd)}</strong></p>
                            <p>Cọc tối thiểu: <strong style={{ color: 'var(--charcoal)' }}>{formatVnd(order.quote.depositNeededVnd)}</strong></p>
                            <p>Cân nặng: <strong style={{ color: 'var(--charcoal)' }}>{order.quote.shippingWeightKg} kg</strong></p>
                            {order.paymentConfirmed && (
                              <p style={{ color: '#2E7D32', fontWeight: 600 }}>💵 Đã cọc thành công</p>
                            )}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-light)', fontStyle: 'italic' }}>
                            ⚠️ Đơn hàng mới chưa được tính giá chi tiết.
                          </p>
                        )}
                      </div>

                      {/* Action buttons based on status */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {order.status === 'pending' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setQuotingOrderId(order.id);
                              setTaxPercent(order.country === 'USD' ? '8' : '10');
                            }}
                          >
                            <span>Tính & Gửi Báo Giá</span>
                            <ArrowRight size={14} />
                          </button>
                        )}

                        {order.status === 'quoted' && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
                              onClick={() => {
                                if (window.confirm('Xác nhận khách hàng đã chuyển khoản cọc thành công?')) {
                                  confirmPayment(order.id, order.quote.depositNeededVnd);
                                }
                              }}
                            >
                              Xác nhận đã nhận cọc
                            </button>
                          </div>
                        )}

                        {order.status === 'paid' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              if (window.confirm('Xác nhận đơn hàng đã được đặt mua bên nước ngoài và đang bay về Việt Nam?')) {
                                updateOrderStatus(order.id, 'transit');
                              }
                            }}
                          >
                            Đã mua hàng & Đang chuyển về VN
                          </button>
                        )}

                        {order.status === 'transit' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ backgroundColor: '#2E7D32', color: 'white', border: 'none' }}
                            onClick={() => {
                              if (window.confirm('Xác nhận hàng đã về kho VN và giao hàng thành công cho khách?')) {
                                updateOrderStatus(order.id, 'completed');
                              }
                            }}
                          >
                            Hoàn thành giao hàng
                          </button>
                        )}

                        {order.status === 'completed' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 600 }}>
                            <Check size={16} />
                            <span>Đơn hàng đã khép lại</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
