import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #FAF8F5 0%, #F3EFF6 100%)',
      padding: '48px 0 36px 0',
      borderBottom: '1px solid var(--border-color)',
      position: 'relative'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* Headline & CTA */}
          <div style={{ flex: '1 1 480px', minWidth: '280px' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '2px',
              color: 'var(--purple-primary)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}>
              MUA HÀNG HÀN QUỐC TRỰC TIẾP TỪ STORE
            </span>

            <h1 style={{
              fontSize: '2.4rem',
              lineHeight: '1.25',
              fontWeight: 700,
              color: 'var(--text-dark)',
              marginBottom: '12px',
              fontFamily: 'var(--font-serif)'
            }}>
              Mỹ Phẩm & Sâm Nấm <br />
              <span className="font-serif-italic" style={{ color: 'var(--purple-primary)', fontWeight: 600 }}>Nội Địa Hàn Chính Hãng</span>
            </h1>

            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-muted)',
              maxWidth: '520px',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Phân phối và mua hộ trực tiếp từ Olive Young, hiệu thuốc và các cửa hàng uy tín tại Seoul. Giao tận tay tại Việt Nam.
            </p>

            <a
              href="#products"
              className="btn-gold"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 700
              }}
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Compact visual banner image */}
          <div style={{ flex: '1 1 340px', maxWidth: '420px', minWidth: '260px' }}>
            <div style={{
              width: '100%',
              height: '240px',
              borderRadius: '20px',
              backgroundImage: 'url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 8px 24px rgba(122, 75, 158, 0.12)',
              border: '4px solid #FFFFFF'
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}

