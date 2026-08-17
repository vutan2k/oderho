import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Star, Sparkles, Globe } from 'lucide-react';

export default function ProductDetailModal({ product, krwRate, onClose, onOrderNow }) {
  const images = product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : []);
  const [selectedImg, setSelectedImg] = useState(images[0] || '');
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const imgs = product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : []);
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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={22} color="#4B5563" />
        </button>

        <div style={{ padding: '36px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '36px' }}>
          
          {/* Cột Trái: Slide Bộ Ảnh */}
          <div>
            {/* Ảnh Chính */}
            <div style={{
              width: '100%',
              height: '360px',
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <img
                src={selectedImg || product.productImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                backgroundColor: 'var(--purple-primary)',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '20px',
                textTransform: 'uppercase'
              }}>
                {product.brand}
              </span>
            </div>

            {/* List Thumbs Ảnh */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
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
                      opacity: selectedImg === img ? 1 : 0.65
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột Phải: Thông Tin Chi Tiết */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Thương hiệu & Đánh giá */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingRight: '45px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {product.brand}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', padding: '6px 14px', borderRadius: '20px' }}>
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>{product.rating || 4.9} ({product.reviewsCount || 500}+ đánh giá Store Hàn)</span>
                </div>
              </div>

              {/* Tên sản phẩm lớn */}
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#111827', lineHeight: '1.35', marginBottom: '14px' }}>
                {product.name}
              </h2>

              {/* Xuất xứ & Quy cách */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Globe size={16} color="var(--purple-primary)" /> {product.origin || 'Store Olive Young Korea'}
                </span>
                <span style={{ fontSize: '0.88rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Sparkles size={16} color="var(--purple-primary)" /> Quy cách: {product.options}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', borderBottom: '2px solid #F3F4F6', marginBottom: '20px' }}>
                {[
                  { id: 'description', label: 'Mô Tả Sản Phẩm' },
                  { id: 'usage', label: 'Hướng Dẫn Sử Dụng' },
                  { id: 'specs', label: 'Thông Số Kỹ Thuật' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '12px 20px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '3px solid var(--purple-primary)' : '3px solid transparent',
                      color: activeTab === tab.id ? 'var(--purple-primary)' : '#6B7280',
                      fontWeight: activeTab === tab.id ? 800 : 600,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      marginBottom: '-2px'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Nội dung Tab */}
              <div style={{ minHeight: '160px', fontSize: '1.02rem', color: '#374151', lineHeight: '1.7', fontWeight: 400 }}>
                {activeTab === 'description' && (
                  <p style={{ margin: 0 }}>{product.description || 'Sản phẩm chính hãng Hàn Quốc được nhập khẩu và phân phối trực tiếp.'}</p>
                )}
                {activeTab === 'usage' && (
                  <p style={{ margin: 0 }}>{product.usage || 'Sử dụng hàng ngày sau bước làm sạch mặt.'}</p>
                )}
                {activeTab === 'specs' && product.specifications && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px' }}><strong>Dung tích/Trọng lượng:</strong> {product.specifications.volume}</li>
                    <li style={{ marginBottom: '8px' }}><strong>Loại da phù hợp:</strong> {product.specifications.skinType}</li>
                    <li style={{ marginBottom: '8px' }}><strong>Hạn sử dụng:</strong> {product.specifications.expiry}</li>
                    <li><strong>Thành phần chính:</strong> {product.specifications.ingredients}</li>
                  </ul>
                )}
              </div>

            </div>

            {/* Nút Bấm Đặt Mua: Đã Bỏ Chữ "Đặt Mua Ngay Sản Phẩm Này", Chỉ Hiển Thị Số Tiền Việt Nam */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
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
                  gap: '12px',
                  padding: '16px 28px',
                  borderRadius: '50px',
                  boxShadow: '0 10px 25px -5px rgba(122, 75, 158, 0.4)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <ShoppingBag size={22} />
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  THÊM VÀO GIỎ ({formatVnd(calculatedVnd)})
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
