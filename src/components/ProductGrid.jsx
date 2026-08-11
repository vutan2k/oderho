import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ProductGrid({ products, krwRate, onSelectProduct }) {
  const formatVnd = (num) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  const formatKrw = (num) =>
    new Intl.NumberFormat('ko-KR').format(num) + ' ₩';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '28px'
    }}>
      {products.map((product) => {
        const calculatedVnd = product.foreignPrice * krwRate;

        return (
          <div
            key={product.goodsNo}
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
            <div style={{ position: 'relative', width: '100%', paddingTop: '90%', overflow: 'hidden' }}>
              <img
                src={product.productImage}
                alt={product.name}
                loading="lazy"
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
                {product.brand}
              </span>
            </div>

            {/* Product Info */}
            <div style={{ padding: '20px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-dark)',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  height: '42px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }} title={product.name}>
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

                {/* Button Order */}
                <button
                  onClick={() => onSelectProduct(product)}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}
                >
                  <ShoppingBag size={15} />
                  <span>ĐẶT MUA NGAY</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
