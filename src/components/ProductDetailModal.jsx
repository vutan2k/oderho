import React, { useState } from 'react';
import { X, ShoppingBag, Star, Sparkles, Globe } from 'lucide-react';

export default function ProductDetailModal({ product, krwRate, onClose, onOrderNow }) {
  const images = product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : []);
  const [selectedImg, setSelectedImg] = useState(images[0] || '');
  const [activeTab, setActiveTab] = useState('description');

  if (!product) return null;

  const calculatedVnd = product.foreignPrice * krwRate;

  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const formatKrw = (n) => new Intl.NumberFormat('ko-KR').format(n) + ' ₩';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
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
          <X size={20} color="#4B5563" />
        </button>

        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '36px' }}>
          
          {/* Cột Trái: Slide Bộ Ảnh */}
          <div>
            {/* Ảnh Chính */}
            <div style={{
              width: '100%',
              height: '360px',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <img
                src={selectedImg}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'var(--purple-primary)',
                color: '#FFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
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
                      width: '68px',
                      height: '68px',
                      borderRadius: '10px',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--purple-primary)', textTransform: 'uppercase' }}>
                  {product.brand}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', padding: '4px 10px', borderRadius: '12px' }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>{product.rating || 4.9} ({product.reviewsCount || 500}+ đánh giá Store Hàn)</span>
                </div>
              </div>

              {/* Tên sản phẩm */}
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', lineHeight: '1.4', marginBottom: '12px' }}>
                {product.name}
              </h2>

              {/* Xuất xứ & Quy cách */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Globe size={14} color="var(--purple-primary)" /> {product.origin || 'Store Olive Young Korea'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={14} color="var(--purple-primary)" /> Quy cách: {product.options}
                </span>
              </div>

              {/* Khối Hiển Thị Tỷ Giá Song Song */}
              <div style={{
                backgroundColor: '#F9F5FC',
                border: '1px solid rgba(122, 75, 158, 0.2)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Giá niêm yết tại Hàn Quốc:</span>
                  <strong style={{ fontSize: '1.2rem', color: '#1F2937' }}>{formatKrw(product.foreignPrice)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Giá quy đổi VNĐ hôm nay:</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    {formatVnd(calculatedVnd)}
                  </strong>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: '16px' }}>
                {[
                  { id: 'description', label: 'Mô Tả Sản Phẩm' },
                  { id: 'usage', label: 'Hướng Dẫn Sử Dụng' },
                  { id: 'specs', label: 'Thông Số Kỹ Thuật' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid var(--purple-primary)' : '2px solid transparent',
                      color: activeTab === tab.id ? 'var(--purple-primary)' : '#6B7280',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Nội dung Tab */}
              <div style={{ minHeight: '120px', fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
                {activeTab === 'description' && (
                  <p>{product.description || 'Sản phẩm chính hãng Hàn Quốc được nhập khẩu và phân phối trực tiếp.'}</p>
                )}
                {activeTab === 'usage' && (
                  <p>{product.usage || 'Sử dụng hàng ngày sau bước làm sạch mặt.'}</p>
                )}
                {activeTab === 'specs' && product.specifications && (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '6px' }}><strong>Dung tích/Trọng lượng:</strong> {product.specifications.volume}</li>
                    <li style={{ marginBottom: '6px' }}><strong>Loại da phù hợp:</strong> {product.specifications.skinType}</li>
                    <li style={{ marginBottom: '6px' }}><strong>Hạn sử dụng:</strong> {product.specifications.expiry}</li>
                    <li><strong>Thành phần chính:</strong> {product.specifications.ingredients}</li>
                  </ul>
                )}
              </div>

            </div>

            {/* Khối Nút Đặt Hàng Ngay */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '16px' }}>
              <button
                onClick={() => {
                  onClose();
                  onOrderNow(product);
                }}
                className="btn-gold"
                style={{ flex: 1, justifyContent: 'center', padding: '14px 0', fontSize: '1rem' }}
              >
                <ShoppingBag size={18} />
                <span>ĐẶT MUA NGAY SẢN PHẨM NÀY</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
