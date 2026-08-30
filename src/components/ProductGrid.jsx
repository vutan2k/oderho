import React, { useState, useEffect, useMemo, memo } from 'react';
import { ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatVnd, formatKrw } from '../utils/priceCalculator';

function ProductGrid({ products, krwRate, onSelectProduct, onViewDetail }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 48;

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // Logic phân trang
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = useMemo(() => {
    return products?.slice(startIndex, startIndex + itemsPerPage) || [];
  }, [products, startIndex, itemsPerPage]);

  return (
    <div>
      <div className="product-grid-container">
        {currentProducts.map((product, pIdx) => {
          const won = Number(product.foreignPrice ?? product.priceKrw ?? product.priceWon ?? product.price) || 0;
          const calculatedVnd = Math.round(won * krwRate);
          const defaultImg = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={product.goodsNo || `grid-prod-${pIdx}`}
              className="product-card"
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
                backgroundColor: 'var(--bg-white, #FFF)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Product Image */}
              <div
                className="product-card-image-wrap"
                style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => onViewDetail && onViewDetail(product)}
              >
                <img
                  src={product.productImage || defaultImg}
                  alt={product.name || 'Sản phẩm Hàn Quốc'}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImg;
                  }}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <span
                  className="product-card-brand-badge"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {product.brand || 'Olive Young'}
                </span>
              </div>

              {/* Product Info */}
              <div
                className="product-card-body"
                style={{ padding: '12px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <h3
                    className="product-card-title"
                    onClick={() => onViewDetail && onViewDetail(product)}
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--text-dark)',
                      marginBottom: '4px',
                      lineHeight: '1.3',
                      height: '36px',
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
                  <p
                    className="product-card-subtitle"
                    style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '8px', minHeight: '1.2em' }}
                  >
                    {product.options ? `Quy cách: ${product.options}` : 'Hàng chính hãng nội địa Hàn'}
                  </p>
                </div>

                <div>
                  {/* 2 Dòng Giá Rõ Ràng: Giá tại Hàn & Giá về tay */}
                  <div
                    className="product-card-price-box"
                    style={{ marginBottom: '10px', background: 'var(--bg-subtle-purple, #F8F6FA)', padding: '8px 10px', borderRadius: '10px' }}
                  >
                    <div
                      className="product-card-price-krw-row"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted, #6B7280)', marginBottom: '2px' }}
                    >
                      <span>Giá Hàn:</span>
                      <strong style={{ color: 'var(--text-dark, #374151)', fontWeight: 700 }}>{formatKrw(product.foreignPrice)}</strong>
                    </div>
                    <div
                      className="product-card-price-vnd-row"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
                    >
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dark)' }}>Về tay:</span>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--text-dark)', fontWeight: 800 }}>{formatVnd(calculatedVnd)}</strong>
                    </div>
                  </div>

                  {/* Buttons Action: Xem Chi Tiết & Đặt Mua Ngay */}
                  <div
                    className="product-card-actions"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}
                  >
                    <button
                      className="product-card-btn-detail"
                      onClick={() => onViewDetail && onViewDetail(product)}
                      style={{
                        padding: '8px 0',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-white, #FFF)',
                        color: 'var(--text-dark)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className="btn-gold product-card-btn-cart"
                      onClick={(e) => onSelectProduct(product, e)}
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        padding: '8px 0',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingBag size={18} />
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
          marginTop: '32px',
          gap: '8px'
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: currentPage === 1 ? 'var(--bg-subtle-purple, #F3F4F6)' : 'var(--bg-white, #FFFFFF)',
              color: currentPage === 1 ? 'var(--text-muted, #9CA3AF)' : 'var(--text-dark)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <ChevronLeft size={16} />
            <span>Trước</span>
          </button>

          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', padding: '0 8px' }}>
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: currentPage === totalPages ? 'var(--bg-subtle-purple, #F3F4F6)' : 'var(--bg-white, #FFFFFF)',
              color: currentPage === totalPages ? 'var(--text-muted, #9CA3AF)' : 'var(--text-dark)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <span>Sau</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(ProductGrid);
