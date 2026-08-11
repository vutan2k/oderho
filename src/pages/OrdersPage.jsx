import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Package, Clock, CheckCircle2, Truck, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const { currentUser, orders, rates } = useContext(AppContext);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
        <Package size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Bạn cần đăng nhập tài khoản để theo dõi lịch sử và trạng thái đơn hàng của mình.
        </p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Chuyển tới Đăng nhập
        </button>
      </div>
    );
  }

  // Filter orders for currentUser email or phone match
  const userOrders = orders.filter(
    (o) =>
      (o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (o.customerPhone && currentUser.phone && o.customerPhone === currentUser.phone)
  );

  const formatVnd = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span style={{ background: '#fff8e1', color: '#f57f17', padding: '4px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Đang chờ báo giá
          </span>
        );
      case 'quoted':
        return (
          <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Đã có báo giá
          </span>
        );
      case 'paid':
        return (
          <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Đã đặt cọc / Thanh toán
          </span>
        );
      case 'transit':
        return (
          <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={12} /> Đang bay về VN
          </span>
        );
      default:
        return (
          <span style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Quay lại cửa hàng
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>Quản lý Đơn hàng của tôi</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tài khoản: <strong>{currentUser.email}</strong></p>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <div style={{ background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '60px 20px', textAlign: 'center' }}>
          <ShoppingBag size={40} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Chưa có đơn hàng nào</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Bạn chưa gửi yêu cầu mua hộ nào. Hãy chọn sản phẩm ưa thích từ cửa hàng!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 16px' }}>Mã ĐH</th>
                  <th style={{ padding: '14px 16px' }}>Sản phẩm</th>
                  <th style={{ padding: '14px 16px' }}>Số lượng</th>
                  <th style={{ padding: '14px 16px' }}>Giá tạm tính / Báo giá</th>
                  <th style={{ padding: '14px 16px' }}>Trạng thái</th>
                  <th style={{ padding: '14px 16px' }}>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map((order) => {
                  const krwRate = rates?.KRW?.rate || 19.5;
                  const estimatedVnd = Math.round(order.foreignPrice * krwRate * order.qty);
                  const displayTotal = order.quote ? order.quote.totalVnd : estimatedVnd;

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent)' }}>
                        {order.id}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {order.productImage && (
                            <img src={order.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{order.productName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{order.brand} ({order.options})</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {order.qty}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {formatVnd(displayTotal)}
                        {!order.quote && <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-secondary)', display: 'block' }}>(Tạm tính)</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(order.status)}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
