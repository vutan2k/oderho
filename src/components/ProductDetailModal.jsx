import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Star, Sparkles, Globe, Maximize2 } from 'lucide-react';

// Chuẩn hóa URL ảnh HD sắc nét từ Olive Young (bỏ nén RS=64x0, QT=85)
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
  const images = rawImages.map(getHighResUrl);

  const [selectedImg, setSelectedImg] = useState(images[0] || '');
  const [activeTab, setActiveTab] = useState('description');
  const [zoomImg, setZoomImg] = useState(null); // Lightbox HD Zoom

  useEffect(() => {
    const imgs = (product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : [])).map(getHighResUrl);
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
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

        {/* Bố cục Grid 2 Cột Cân Bằng (1fr 1fr) - Không lẹm viền */}
        <div style={{ padding: '32px 36px', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '32px', minWidth: 0 }}>
          
          {/* Cột Trái: Hiển Thị Ảnh Chính & Album Thumbs */}
          <div style={{ minWidth: 0 }}>
            {/* Khung Ảnh Chính HD */}
            <div style={{
              width: '100%',
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E7EB',
              marginBottom: '14px',
              position: 'relative'
            }}>
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

              {/* Nút Phóng To HD Lightbox */}
              <button
                onClick={() => setZoomImg(selectedImg || getHighResUrl(product.productImage))}
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1F2937',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                <Maximize2 size={14} /> Phóng To HD
              </button>
            </div>

            {/* List Album Ảnh Thumbs Sắc Nét */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    style={{
                      width: '70px',
                      height: '70px',
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

          {/* Cột Phải: Thông Tin Chi Tiết (Chuẩn Đẹp Không Che Khuyết) */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, paddingRight: '10px' }}>
            <div>
              {/* Thương hiệu & Số sao */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {product.brand}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#FEF3C7', padding: '5px 12px', borderRadius: '20px' }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E' }}>{product.rating || 4.9} (Store Hàn)</span>
                </div>
              </div>

              {/* Tên sản phẩm lớn */}
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', lineHeight: '1.35', marginBottom: '12px', wordBreak: 'break-word' }}>
                {product.name}
              </h2>

              {/* Xuất xứ & Quy cách */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Globe size={15} color="var(--purple-primary)" /> {product.origin || 'Store Olive Young Korea'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Sparkles size={15} color="var(--purple-primary)" /> Quy cách: {product.options}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', borderBottom: '2px solid #F3F4F6', marginBottom: '16px', gap: '8px', overflowX: 'auto' }}>
                {[
                  { id: 'description', label: 'Mô Tả Sản Phẩm' },
                  { id: 'usage', label: 'Hướng Dẫn Sử Dụng' },
                  { id: 'specs', label: 'Thông Số' },
                  { id: 'reviews', label: '📸 Album Ảnh Thực Tế' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '8px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '3px solid var(--purple-primary)' : '3px solid transparent',
                      color: activeTab === tab.id ? 'var(--purple-primary)' : '#6B7280',
                      fontWeight: activeTab === tab.id ? 800 : 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      marginBottom: '-2px'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Nội dung Tab */}
              <div style={{ minHeight: '180px', maxHeight: '240px', overflowY: 'auto', fontSize: '0.92rem', color: '#374151', lineHeight: '1.6', paddingRight: '4px' }}>
                {activeTab === 'description' && (
                  <p style={{ margin: 0 }}>{product.description || 'Sản phẩm chính hãng Hàn Quốc được nhập khẩu và phân phối trực tiếp.'}</p>
                )}
                {activeTab === 'usage' && (
                  <p style={{ margin: 0 }}>{product.usage || 'Sử dụng hàng ngày sau bước làm sạch mặt.'}</p>
                )}
                {activeTab === 'specs' && product.specifications && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '6px' }}><strong>Dung tích:</strong> {product.specifications.volume}</li>
                    <li style={{ marginBottom: '6px' }}><strong>Loại da:</strong> {product.specifications.skinType}</li>
                    <li style={{ marginBottom: '6px' }}><strong>Hạn sử dụng:</strong> {product.specifications.expiry}</li>
                    <li><strong>Thành phần:</strong> {product.specifications.ingredients}</li>
                  </ul>
                )}
                {activeTab === 'reviews' && (() => {
                  const rawPhotos = (product.images || [product.productImage]).map(getHighResUrl).filter(Boolean);
                  
                  const photoList = [];
                  for (let i = 0; i < 24; i++) {
                    const src = rawPhotos[i % rawPhotos.length] || getHighResUrl(product.productImage);
                    if (src) photoList.push({ id: `photo-${i}`, src });
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Bộ sưu tập ảnh chụp thực tế HD ({photoList.length}+ ảnh)</span>
                        <span style={{ color: '#F59E0B', fontSize: '0.8rem' }}>★ 4.9 HD</span>
                      </div>

                      {/* Lưới Ảnh Thực Tế Sắc Nét 3 Cột */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {photoList.map((item, idx) => (
                          <div 
                            key={item.id || idx}
                            onClick={() => setZoomImg(item.src)}
                            style={{
                              position: 'relative',
                              aspectRatio: '1 / 1',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: selectedImg === item.src ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
                              cursor: 'pointer',
                              backgroundColor: '#FAFAFA'
                            }}
                          >
                            <img src={item.src} alt={`Review photo ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Nút Đặt Mua: Hiển Thị Đẹp Cân Đối 100% Không Tràn */}
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
            style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
          />
        </div>
      )}
    </div>
  );
}
