import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Search, ShoppingBag, ArrowLeft, Plus } from 'lucide-react';
import { triggerFlyToCart } from '../../utils/flyToCart';

export default function ProductConsultView({ onBack, isMobile }) {
  const { oliveYoungCatalog, rates, addToCart } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter((product) => {
    if (product.isPublished === false || product.status === 'pending' || product.isHidden === true) return false;
    if (!searchTerm.trim()) return true;
    const query = searchTerm.trim().toLowerCase();
    const matchName = (product.name || '').toLowerCase().includes(query);
    const matchBrand = (product.brand || '').toLowerCase().includes(query);
    const matchCategory = (product.category || '').toLowerCase().includes(query);
    return matchName || matchBrand || matchCategory;
  }).slice(0, 10) : [];

  const formatVnd = (n) => (n || n === 0) ? `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} VNĐ` : '0 VNĐ';

  const handleAdd = (product, e) => {
    addToCart(product, 1);
    if (e && product.productImage) {
      triggerFlyToCart(e, product.productImage);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px', height: '100%' }}>
      {/* Header with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--purple-primary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            touchAction: 'manipulation'
          }}
          title="Quay lại menu"
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontSize: isMobile ? '0.82rem' : '0.88rem', fontWeight: 700, color: 'var(--text-dark)' }}>
          Mỹ phẩm Olive Young (Tỷ giá ₩: {krwRate}đ)
        </span>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Tìm sản phẩm (Medicube, Serum...)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: isMobile ? '10px 12px 10px 34px' : '8px 12px 8px 32px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            fontSize: isMobile ? '0.85rem' : '0.82rem',
            outline: 'none',
            backgroundColor: '#FFFFFF',
            color: '#1F2937'
          }}
        />
        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
      </div>

      {/* Products Mini List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', WebkitOverflowScrolling: 'touch' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: '#6B7280', fontSize: '0.82rem' }}>
            <ShoppingBag size={24} style={{ margin: '0 auto 6px auto', color: '#9CA3AF', display: 'block' }} />
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const priceKrw = p.foreignPrice || p.price || 0;
            const priceVnd = Math.round(priceKrw * krwRate * serviceFeeMultiplier);
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '8px' : '8px 10px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  gap: '8px'
                }}
              >
                <img
                  src={p.productImage}
                  alt={p.name}
                  style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4B5563', display: 'flex', gap: '6px' }}>
                    <span>₩{new Intl.NumberFormat('ko-KR').format(priceKrw)}</span>
                    <span>•</span>
                    <strong style={{ color: '#059669' }}>{formatVnd(priceVnd)}</strong>
                  </div>
                </div>
                <button
                  onClick={(e) => handleAdd(p, e)}
                  title="Thêm vào giỏ hàng"
                  style={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid var(--purple-primary)',
                    color: 'var(--purple-primary)',
                    borderRadius: '6px',
                    padding: isMobile ? '6px 10px' : '5px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    whiteSpace: 'nowrap',
                    touchAction: 'manipulation'
                  }}
                >
                  <Plus size={13} />
                  <span>Chọn</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
