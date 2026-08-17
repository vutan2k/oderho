import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGrid({ products, krwRate, onSelectProduct, onViewDetail }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const formatVnd = (num) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  const formatKrw = (num) =>
    new Intl.NumberFormat('ko-KR').format(num) + ' ₩';

  // Logic phân trang
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products?.slice(startIndex, startIndex + itemsPerPage) || [];

  return (
    <div>
      <div style={{
        display: 'grid',
        // Dùng auto-fill để 1 sản phẩm không bị giãn to hết màn hình
        // minmax 200px để đảm bảo trên destop hiện tầm 4-5 cột
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '28px'
      }}>
        {currentProducts.map((product, pIdx) => {
          const calculatedVnd = Math.round((product.foreignPrice || 0) * krwRate);
          const defaultImg = 'https://image.oliveyoung.co.kr/uploads/images/goods/550/10/0000/0022/A00000022341401ko.jpg';

        return (
          <div
            key={product.goodsNo || `grid-prod-${pIdx}`}
            className="product-card"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: '#FFF',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Product Image */}
            <div
              style={{ position: 'relative', width: '100%', paddingTop: '90%', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => onViewDetail && onViewDetail(product)}
            >
              <img
                src={product.productImage || defaultImg}
                alt={product.name || 'Sản phẩm Hàn Quốc'}
                loading="lazy"
                onError={(e) => { e.target.src = defaultImg; }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover'
                }}
              />
              <span style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'var(--purple-primary)',
                color: '#FFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase'
              }}>
                {product.brand || 'Olive Young'}
              </span>
            </div>

            {/* Product Info */}
            <div style={{ padding: '20px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3
                  onClick={() => onViewDetail && onViewDetail(product)}
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    marginBottom: '8px',
                    lineHeight: '1.4',
                    height: '42px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    cursor: 'pointer'
                  }}
                  title={product.name}
                >
                  {product.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Quy cách: {product.options}
                </p>
              </div>

              <div>
                {/* Song song Won & VND */}
                <div style={{ marginBottom: '15px', background: '#F8F6FA', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Giá Hàn Quốc:</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>
                      {formatKrw(product.foreignPrice)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quy đổi VNĐ:</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--purple-primary)' }}>
                      {formatVnd(calculatedVnd)}
                    </strong>
                  </div>
                </div>

                {/* Buttons Action: Xem Chi Tiết & Đặt Mua Ngay */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => onViewDetail && onViewDetail(product)}
                    style={{
                      padding: '12px 0',
                      borderRadius: '30px',
                      border: '1px solid var(--purple-primary)',
                      backgroundColor: '#FFF',
                      color: 'var(--purple-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Xem chi tiết"
                  >
                    <Eye size={22} />
                  </button>

                  <button
                    onClick={(e) => onSelectProduct(product, e)}
                    className="btn-gold"
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      padding: '12px 0',
                      borderRadius: '30px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingBag size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '40px',
          gap: '12px'
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: currentPage === 1 ? '#F3F4F6' : '#FFF',
              color: currentPage === 1 ? '#9CA3AF' : 'var(--text-dark)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={18} /> Trước
          </button>

          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>
            Trang {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: currentPage === totalPages ? '#F3F4F6' : '#FFF',
              color: currentPage === totalPages ? '#9CA3AF' : 'var(--text-dark)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Sau <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
