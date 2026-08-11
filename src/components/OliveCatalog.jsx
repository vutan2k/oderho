import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OliveCatalog({ onSelectProduct }) {
  const { oliveYoungCatalog, rates } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState('skincare');

  const categories = [
    { id: 'skincare', name: 'Dưỡng da (Skincare)' },
    { id: 'makeup', name: 'Trang điểm (Makeup)' },
    { id: 'haircare', name: 'Chăm sóc tóc (Haircare)' },
    { id: 'bodycare', name: 'Chăm sóc cơ thể (Bodycare)' }
  ];

  const krwRate = rates?.KRW?.rate || 19.5;

  const formatVnd = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter(
    (product) => product.category === activeCategory
  ) : [];

  return (
    <div style={{ padding: '60px 0 40px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            color: 'var(--primary-rose)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '8px'
          }}>
            <ShoppingBag size={14} /> Olive Young Korea Hot Items
          </span>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
            Mỹ phẩm Olive Young <span className="text-rose font-serif-italic">Bán Chạy Nhất</span>
          </h2>
          <p style={{ color: 'var(--charcoal-light)', maxWidth: '600px', margin: '10px auto 0 auto', fontSize: '0.95rem' }}>
            Đặt mua nhanh các sản phẩm đang làm mưa làm gió tại Hàn Quốc. Nhấp nút mua nhanh để tự động tạo báo giá và điền thông tin đơn hàng tức thì.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                border: activeCategory === cat.id ? '1px solid var(--primary-rose)' : '1px solid var(--border-color)',
                backgroundColor: activeCategory === cat.id ? 'var(--primary-rose)' : 'var(--white)',
                color: activeCategory === cat.id ? 'var(--white)' : 'var(--charcoal)',
                fontWeight: activeCategory === cat.id ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeCategory === cat.id ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px'
        }}>
          {filteredProducts.map((product) => {
            const calculatedVnd = product.foreignPrice * krwRate;
            const detailUrl = `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${product.goodsNo}`;

            return (
              <div
                key={product.goodsNo}
                className="glass"
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--white)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'default',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Product Image Wrapper */}
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden' }}>
                  <img
                    src={product.productImage}
                    alt={product.name}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  {/* Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(183, 110, 121, 0.9)',
                    color: 'var(--white)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backdropFilter: 'blur(4px)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Olive Young
                  </span>
                </div>

                {/* Product Info */}
                <div style={{ padding: '20px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary-rose-dark)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {product.brand}
                    </span>
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--charcoal)',
                      margin: '5px 0 12px 0',
                      lineHeight: '1.4',
                      height: '40px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }} title={product.name}>
                      {product.name}
                    </h3>
                  </div>

                  <div>
                    {/* Prices */}
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--charcoal-light)',
                        textDecoration: 'line-through',
                        marginRight: '8px'
                      }}>
                        {new Intl.NumberFormat('ko-KR').format(product.foreignPrice * 1.15)} ₩
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--charcoal)' }}>
                        {new Intl.NumberFormat('ko-KR').format(product.foreignPrice)} ₩
                      </strong>
                      <p style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--primary-rose-dark)',
                        marginTop: '4px'
                      }}>
                        Tạm tính: {formatVnd(calculatedVnd)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{
                          flex: 1,
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          padding: '10px 0',
                          border: '1px solid var(--border-color)',
                          textDecoration: 'none',
                          color: 'var(--charcoal)',
                          display: 'block'
                        }}
                      >
                        Xem link gốc
                      </a>
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="btn btn-primary btn-sm"
                        style={{
                          flex: 1.5,
                          fontSize: '0.75rem',
                          padding: '10px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Mua ngay</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
