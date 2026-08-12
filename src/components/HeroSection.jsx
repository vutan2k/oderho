import React from 'react';
import { ArrowRight, ShieldCheck, Pill, CreditCard } from 'lucide-react';

export default function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #F9F6FA 0%, #EDE6F2 100%)',
      padding: '70px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="hero-grid">
          {/* Hero Content */}
          <div className="animate-fade-up">
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'var(--purple-dark)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px'
            }}>
              CHUYÊN MỸ PHẨM & THỰC PHẨM CHỨC NĂNG HÀN QUỐC
            </span>

            <h1 className="hero-title" style={{
              fontSize: '3.2rem',
              lineHeight: '1.2',
              fontWeight: 400,
              color: 'var(--text-dark)',
              marginBottom: '20px',
              fontFamily: 'var(--font-serif)'
            }}>
              Hàng Chuẩn Store Hàn, <br />
              <span className="font-serif-italic" style={{ color: 'var(--purple-primary)' }}>Giá Tốt Cho Người Việt</span>
            </h1>

            <p className="hero-desc" style={{
              fontSize: '1rem',
              color: '#333333',
              maxWidth: '500px',
              marginBottom: '32px',
              lineHeight: '1.7',
              fontWeight: 500
            }}>
              Cung cấp các sản phẩm Mỹ phẩm Olive Young, Hồng Sâm, Collagen & Các loại thuốc nội địa Hàn Quốc bán tại nhà thuốc.
            </p>

            <div style={{ marginBottom: '40px', display: 'flex', gap: '15px' }}>
              <a href="#products" className="btn-gold" style={{ display: 'inline-flex' }}>
                <span>XEM DANH MỤC SẢN PHẨM</span>
                <ArrowRight size={16} />
              </a>
            </div>

            {/* 3 Cam kết */}
            <div className="commitments-flex">
              {[
                { icon: <ShieldCheck size={18} />, label: '100% CHÍNH HÃNG HÀN' },
                { icon: <Pill size={18} />, label: 'CHUẨN HIỆU THUỐC HÀN' },
                { icon: <CreditCard size={18} />, label: 'THANH TOÁN VIETQR & BANK HÀN' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--purple-dark)' }}>{item.icon}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: 'var(--purple-dark)'
                  }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{
              width: '100%',
              height: '460px',
              borderRadius: '24px',
              backgroundImage: 'url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'var(--shadow-lg)',
              border: '8px solid #FFFFFF'
            }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
