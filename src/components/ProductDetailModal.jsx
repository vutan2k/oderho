import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Sparkles } from 'lucide-react';

// Chuẩn hóa URL ảnh HD sắc nét từ Olive Young
const getHighResUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/RS=\d+x\d+&?/gi, '')
    .replace(/QT=\d+&?/gi, 'QT=100&')
    .replace(/\?$/, '')
    .trim();
};

export default function ProductDetailModal({ product, krwRate, onClose, onOrderNow }) {
  const rawImages = product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : []);
  const images = Array.from(new Set(rawImages.map(getHighResUrl))).filter(Boolean);

  const [selectedImg, setSelectedImg] = useState(images[0] || '');
  const [zoomImg, setZoomImg] = useState(null); // Fullscreen HD Lightbox Zoom

  useEffect(() => {
    const imgs = Array.from(new Set((product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : [])).map(getHighResUrl))).filter(Boolean);
    setSelectedImg(imgs[0] || '');
  }, [product]);

  if (!product) return null;

  const calculatedVnd = Math.round((product.foreignPrice || 0) * krwRate);
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

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
        padding: '16px'
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

        {/* Bố cục Grid 2 Cột Cân Bằng (1fr 1.05fr) - Tập trung 100% vào HÌNH ẢNH */}
        <div style={{ padding: '32px 36px', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '32px', minWidth: 0 }}>
          
          {/* Cột Trái: Ảnh Chính Siêu Nét HD + Thư Viện Thumbs Ảnh Sản Phẩm */}
          <div style={{ minWidth: 0 }}>
            <div 
              onClick={() => setZoomImg(selectedImg || getHighResUrl(product.productImage))}
              style={{
                width: '100%',
                height: '400px',
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
                      width: '72px',
                      height: '72px',
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
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, paddingRight: '10px' }}>
            <div>
              {/* Thương hiệu */}
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {product.brand}
                </span>
              </div>

              {/* Tên sản phẩm */}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', lineHeight: '1.35', marginBottom: '10px', wordBreak: 'break-word' }}>
                {product.name}
              </h2>

              {/* Mô tả ngắn */}
              <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#4B5563', lineHeight: '1.5' }}>
                {product.description || 'Sản phẩm chính hãng nội địa Hàn Quốc nhập khẩu trực tiếp.'}
              </p>

              {/* KHU VỰC CHÍNH: BỘ SƯU TẬP LƯỚI ÁNH ĐÁNH GIÁ THỰC TẾ TỪ KHÁCH HÀNG */}
              <div style={{ background: '#FAF5FF', padding: '14px', borderRadius: '16px', border: '1px solid #E9D5FF' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--purple-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> 📸 Bộ Sưu Tập Ảnh Đánh Giá Thực Tế Khách Hàng ({images.length}+ Ảnh HD)
                </div>

                {/* Lưới Ảnh Thực Tế 3 Cột Sắc Nét */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px' }}>
                  {images.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setZoomImg(img)}
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

            {/* Nút Thêm Vào Giỏ Hàng */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6', marginTop: '12px' }}>
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
                  padding: '14px 24px',
                  borderRadius: '50px',
                  boxShadow: '0 10px 25px -5px rgba(122, 75, 158, 0.4)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <ShoppingBag size={18} />
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                  THÊM VÀO GIỎ ({formatVnd(calculatedVnd)})
                </span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* LIGHTBOX PHÓNG TO ẢNH HD FULL SCREEN */}
      {zoomImg && (
        <div 
          onClick={() => setZoomImg(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <button
            onClick={() => setZoomImg(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFF'
            }}
          >
            <X size={26} />
          </button>
          <img 
            src={zoomImg} 
            alt="HD Zoom" 
            style={{ maxWidth: '92vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
          />
        </div>
      )}
    </div>
  );
}
