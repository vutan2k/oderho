import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const BANNER_IMAGES = [
  {
    url: '/banner/banner-1.jpg',
    alt: 'Store Olive Young Hàn Quốc chính hãng'
  },
  {
    url: '/banner/banner-2.jpg',
    alt: 'Kệ sản phẩm mỹ phẩm nội địa Hàn Quốc tại Store'
  },
  {
    url: '/banner/banner-3.jpg',
    alt: 'Kiện hàng đóng gói thực tế gửi từ Seoul về Việt Nam'
  }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  // Tự động chuyển ảnh sau mỗi 3.5 giây (tạm dừng khi rê chuột)
  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (diff > 35) {
      handlePrev();
    } else if (diff < -35) {
      handleNext();
    }
    setTouchStartX(null);
  };

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
          <div style={{ flex: '1 1 440px', minWidth: '280px' }}>
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

          {/* Interactive Visual Banner Slider (Mở rộng thêm 20%) */}
          <div 
            style={{ flex: '1 1 420px', maxWidth: '530px', minWidth: '280px', position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                width: '100%',
                height: '315px',
                borderRadius: '22px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 12px 36px rgba(122, 75, 158, 0.16)',
                border: '4px solid #FFFFFF',
                backgroundColor: '#F3F4F6'
              }}
            >
              {BANNER_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url("${img.url}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: idx === currentIndex ? 1 : 0,
                    transform: idx === currentIndex ? 'scale(1)' : 'scale(1.04)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    pointerEvents: idx === currentIndex ? 'auto' : 'none'
                  }}
                  title={img.alt}
                />
              ))}

              {/* Dãy chấm nhỏ hiển thị tổng số ảnh & ảnh đang chọn */}
              <div style={{
                position: 'absolute',
                bottom: '14px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.38)',
                backdropFilter: 'blur(4px)',
                zIndex: 2
              }}>
                {BANNER_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Chuyển đến ảnh ${idx + 1}`}
                    style={{
                      width: idx === currentIndex ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '4px',
                      backgroundColor: idx === currentIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

