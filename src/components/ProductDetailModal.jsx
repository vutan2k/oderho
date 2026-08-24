import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

// Chuẩn hóa URL ảnh HD sắc nét từ Olive Young
const getHighResUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/RS=\d+x\d+&?/gi, '')
    .replace(/QT=\d+&?/gi, 'QT=100&')
    .replace(/\?$/, '')
    .trim();
};

export default function ProductDetailModal({ product, krwRate, onClose, onOrderNow, hideAddToCart = false }) {
  const rawImages = product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : []);
  const images = Array.from(new Set(rawImages.map(getHighResUrl))).filter(Boolean);

  const [selectedImg, setSelectedImg] = useState(images[0] || '');
  const [zoomIndex, setZoomIndex] = useState(null); // Fullscreen HD Lightbox Index
  const [touchStartX, setTouchStartX] = useState(null);

  const reviewPhotos = Array.from(new Set([
    ...(product?.photoReviews || []),
    ...images
  ])).map(getHighResUrl).filter(Boolean);

  useEffect(() => {
    const imgs = Array.from(new Set((product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : [])).map(getHighResUrl))).filter(Boolean);
    setSelectedImg(imgs[0] || '');
  }, [product]);

  if (!product) return null;

  const calculatedVnd = Math.round((product.foreignPrice || 0) * krwRate);
  const formatVnd = (n) => (n || n === 0) ? `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} VNĐ` : '0 VNĐ';
  const formatKrw = (n) => `₩${(n || 0).toLocaleString('vi-VN')}`;

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || reviewPhotos.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX < -40) {
      // Vuốt sang trái -> Xem ảnh tiếp theo
      setZoomIndex((prev) => (prev === null ? 0 : (prev + 1) % reviewPhotos.length));
    } else if (deltaX > 40) {
      // Vuốt sang phải -> Xem ảnh trước đó
      setZoomIndex((prev) => (prev === null ? 0 : (prev - 1 + reviewPhotos.length) % reviewPhotos.length));
    }
    setTouchStartX(null);
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '1060px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <X size={20} color="#374151" />
        </button>

        {/* Bố cục Grid Cân Bằng (1fr 1.05fr trên PC, 1fr trên Mobile) */}
        <div className="product-modal-grid" style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '24px', minWidth: 0 }}>
          
          {/* Cột Trái: Ảnh Chính Siêu Nét HD + Thư Viện Thumbs Ảnh Sản Phẩm */}
          <div style={{ minWidth: 0 }}>
            <div 
              onClick={() => {
                const idx = reviewPhotos.indexOf(selectedImg || getHighResUrl(product.productImage));
                setZoomIndex(idx >= 0 ? idx : 0);
              }}
              style={{
                width: '100%',
                height: '360px',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E7EB',
                marginBottom: '14px',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <img
                src={selectedImg || getHighResUrl(product.productImage)}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <span style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                backgroundColor: 'var(--purple-primary)',
                color: '#FFF',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase'
              }}>
                {product.brand}
              </span>
            </div>

            {/* List Thumbs Ảnh Sản Phẩm Sắc Nét */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: selectedImg === img ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: selectedImg === img ? 1 : 0.7,
                      backgroundColor: '#FAFAFA'
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột Phải: Thương Hiệu, Tên & BỘ SƯU TẬP ÁNH ĐÁNH GIÁ THỰC TẾ KHÁCH HÀNG */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            <div>
              {/* Thương hiệu */}
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {product.brand}
                </span>
              </div>

              {/* Tên sản phẩm */}
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', lineHeight: '1.35', marginBottom: '10px', wordBreak: 'break-word' }}>
                {product.name}
              </h2>

              {/* Mô tả ngắn */}
              <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5' }}>
                {product.description || 'Sản phẩm chính hãng nội địa Hàn Quốc nhập khẩu trực tiếp.'}
              </p>

              {/* KHU VỰC HÌNH ẢNH THỰC TẾ (THIẾT KẾ TỐI GIẢN CAO CẤP) */}
              <div style={{ background: '#F9FAFB', padding: '14px', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hình ảnh thực tế ({reviewPhotos.length})
                </div>

                {/* Lưới Ảnh Thực Tế 3 Cột Sắc Nét */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '210px', overflowY: 'auto', paddingRight: '4px' }}>
                  {reviewPhotos.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setZoomIndex(idx)}
                      style={{
                        aspectRatio: '1 / 1',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: selectedImg === img ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
                        cursor: 'pointer',
                        backgroundColor: '#FFF',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                      }}
                    >
                      <img src={img} alt={`Review photo ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nút Thêm Vào Giỏ Hàng & Khối Giá Rõ Ràng */}
            {!hideAddToCart && onOrderNow && (
              <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6', marginTop: '12px' }}>
                <div style={{ background: '#F8F6FA', padding: '12px 16px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      1. Giá tại Hàn (Won gốc):
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 700 }}>
                      {formatKrw(product.foreignPrice)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed #E5E7EB' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontWeight: 700 }}>
                      2. Giá về tay (VNĐ):
                    </span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                      {formatVnd(calculatedVnd)}
                    </strong>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    if (onOrderNow) onOrderNow(product, e);
                    if (onClose) onClose();
                  }}
                  className="btn-gold"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '13px 24px',
                    borderRadius: '50px',
                    boxShadow: '0 8px 20px rgba(122, 75, 158, 0.35)',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  <ShoppingBag size={18} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    THÊM VÀO GIỎ HÀNG
                  </span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* LIGHTBOX PHÓNG TO ẢNH HD FULL SCREEN HỖ TRỢ VUỐT CẢM ỨNG 2 BÊN */}
      {zoomIndex !== null && reviewPhotos[zoomIndex] && (
        <div 
          onClick={() => setZoomIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            userSelect: 'none'
          }}
        >
          {/* Nút Đóng */}
          <button
            onClick={() => setZoomIndex(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFF',
              zIndex: 100002
            }}
          >
            <X size={26} />
          </button>

          {/* Counter Badge: 1 / 8 */}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: '#FFF',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.88rem',
            fontWeight: 700,
            letterSpacing: '1px',
            zIndex: 100002
          }}>
            {zoomIndex + 1} / {reviewPhotos.length}
          </div>

          {/* Nút Xem Ảnh Trước (Trái) */}
          {reviewPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomIndex((prev) => (prev === null ? 0 : (prev - 1 + reviewPhotos.length) % reviewPhotos.length));
              }}
              style={{
                position: 'absolute',
                left: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFF',
                zIndex: 100002,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <ChevronLeft size={30} />
            </button>
          )}

          {/* Ảnh HD Zoom */}
          <img 
            src={reviewPhotos[zoomIndex]} 
            alt={`HD Zoom ${zoomIndex}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              transition: 'all 0.2s ease'
            }} 
          />

          {/* Nút Xem Ảnh Tiếp theo (Phải) */}
          {reviewPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomIndex((prev) => (prev === null ? 0 : (prev + 1) % reviewPhotos.length));
              }}
              style={{
                position: 'absolute',
                right: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFF',
                zIndex: 100002,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <ChevronRight size={30} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
