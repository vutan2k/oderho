import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Check, Trash2, Eye, EyeOff, Sparkles,
  DollarSign, Image, Tag, Layers, Star, AlertCircle,
  ExternalLink, Save, ArrowRight, RefreshCw, Box
} from 'lucide-react';

export default function AdminProductModal({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onApprove, // Dành cho hàng chờ duyệt
  rates,
  isPending = false,
  isDark: isDarkProp
}) {
  const isDark = isDarkProp !== undefined
    ? isDarkProp
    : (typeof window !== 'undefined' && localStorage.getItem('tavy_admin_theme') === 'dark');

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFee = rates?.serviceFeePercent || 5;

  const [formData, setFormData] = useState(() => ({
    goodsNo: product?.goodsNo || product?.id || `P-${Date.now()}`,
    name: product?.name || '',
    nameKr: product?.nameKr || product?.koreanTitle || '',
    brand: product?.brand || '',
    category: product?.category || 'ginseng',
    foreignPrice: product?.foreignPrice ?? product?.price ?? 0,
    productImage: product?.productImage || '',
    images: Array.isArray(product?.images) ? product.images : (product?.productImage ? [product.productImage] : []),
    rating: product?.rating ?? 0,
    reviewsCount: product?.reviewsCount ?? 0,
    origin: product?.origin || 'Hàn Quốc',
    description: product?.description || '',
    usage: product?.usage || '',
    activeIngredients: Array.isArray(product?.activeIngredients) ? product.activeIngredients.join(', ') : (product?.activeIngredients || ''),
    isOutOfStock: Boolean(product?.isOutOfStock),
    isHidden: Boolean(product?.isHidden),
    isVerifiedHealthFood: product?.isVerifiedHealthFood ?? true,
    isGmpCertified: product?.isGmpCertified ?? true
  }));

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        goodsNo: product.goodsNo || product.id || `P-${Date.now()}`,
        name: product.name || '',
        nameKr: product.nameKr || product.koreanTitle || '',
        brand: product.brand || '',
        category: product.category || 'ginseng',
        foreignPrice: product.foreignPrice ?? product.price ?? 0,
        productImage: product.productImage || '',
        images: Array.isArray(product.images) ? product.images : (product.productImage ? [product.productImage] : []),
        rating: product.rating ?? 0,
        reviewsCount: product.reviewsCount ?? 0,
        origin: product.origin || 'Hàn Quốc',
        description: product.description || '',
        usage: product.usage || '',
        activeIngredients: Array.isArray(product.activeIngredients) ? product.activeIngredients.join(', ') : (product.activeIngredients || ''),
        isOutOfStock: Boolean(product.isOutOfStock),
        isHidden: Boolean(product.isHidden),
        isVerifiedHealthFood: product.isVerifiedHealthFood ?? true,
        isGmpCertified: product.isGmpCertified ?? true
      });
    }
  }, [product]);

  const isDirty = useMemo(() => {
    if (!product) return false;
    const initialGoodsNo = product.goodsNo || product.id || '';
    const initialName = product.name || '';
    const initialNameKr = product.nameKr || product.koreanTitle || '';
    const initialBrand = product.brand || '';
    const initialCategory = product.category || 'ginseng';
    const initialForeignPrice = product.foreignPrice ?? product.price ?? 0;
    const initialProductImage = product.productImage || '';
    const initialOrigin = product.origin || 'Hàn Quốc';
    const initialDescription = product.description || '';
    const initialUsage = product.usage || '';
    const initialOutOfStock = Boolean(product.isOutOfStock);
    const initialHidden = Boolean(product.isHidden);

    return (
      formData.goodsNo !== initialGoodsNo ||
      formData.name !== initialName ||
      formData.nameKr !== initialNameKr ||
      formData.brand !== initialBrand ||
      formData.category !== initialCategory ||
      parseFloat(formData.foreignPrice) !== parseFloat(initialForeignPrice) ||
      formData.productImage !== initialProductImage ||
      formData.origin !== initialOrigin ||
      formData.description !== initialDescription ||
      formData.usage !== initialUsage ||
      formData.isOutOfStock !== initialOutOfStock ||
      formData.isHidden !== initialHidden
    );
  }, [formData, product]);

  // Tính giá VNĐ ước tính tự động theo tỷ giá & phí mua hộ
  const calculatedVnd = useMemo(() => {
    const won = parseFloat(formData.foreignPrice) || 0;
    const vnd = Math.round(won * krwRate * (1 + serviceFee / 100));
    return vnd;
  }, [formData.foreignPrice, krwRate, serviceFee]);

  if (!isOpen || !product) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm.');
      return;
    }

    setIsSaving(true);
    try {
      const activeIngList = typeof formData.activeIngredients === 'string'
        ? formData.activeIngredients.split(',').map(s => s.trim()).filter(Boolean)
        : formData.activeIngredients;

      const payload = {
        ...product,
        ...formData,
        foreignPrice: parseFloat(formData.foreignPrice) || 0,
        price: parseFloat(formData.foreignPrice) || 0,
        rating: Number.isFinite(Number(formData.rating)) ? Number(formData.rating) : 0,
        reviewsCount: Number.isFinite(Number(formData.reviewsCount)) ? Number(formData.reviewsCount) : 0,
        activeIngredients: activeIngList,
        updatedAt: new Date().toISOString()
      };

      await onSave(formData.goodsNo, payload);
      onClose();
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      alert("Lỗi khi lưu thay đổi: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAndPublish = async () => {
    if (onApprove) {
      setIsSaving(true);
      try {
        const activeIngList = typeof formData.activeIngredients === 'string'
          ? formData.activeIngredients.split(',').map(s => s.trim()).filter(Boolean)
          : formData.activeIngredients;

        const payload = {
          ...product,
          ...formData,
          foreignPrice: parseFloat(formData.foreignPrice) || 0,
          price: parseFloat(formData.foreignPrice) || 0,
          rating: Number.isFinite(Number(formData.rating)) ? Number(formData.rating) : 0,
          reviewsCount: Number.isFinite(Number(formData.reviewsCount)) ? Number(formData.reviewsCount) : 0,
          activeIngredients: activeIngList,
          isPublished: true,
          status: 'published'
        };
        await onApprove(formData.goodsNo, payload);
        onClose();
      } catch (err) {
        console.error("Lỗi duyệt sản phẩm:", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (!isDirty) {
            onClose();
          }
        }
      }}
    >
      <div
        style={{
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: isPending ? '#F59E0B' : '#2563EB',
              color: '#FFF',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{isPending ? 'Kiểm Duyệt Sản Phẩm Mới' : 'Chỉnh Sửa Nhanh Sản Phẩm'}</span>
                <span style={{
                  fontSize: '0.7rem',
                  backgroundColor: isPending ? 'rgba(245, 158, 11, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                  color: isPending ? '#FBBF24' : '#60A5FA',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800
                }}>
                  {formData.goodsNo}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                {isPending ? 'Kiểm tra thông tin & giá trước khi duyệt xuất bản lên website' : 'Quyền Quản Trị Viên: Thay đổi giá, ảnh, danh mục và trạng thái kho'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              transition: 'background 0.15s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, padding: '24px', gap: '20px' }}>
          {/* Quick Price & Status Banner */}
          <div style={{
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Giá Gốc Won (KRW)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.foreignPrice}
                  onChange={(e) => handleChange('foreignPrice', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#1E293B' : '#FFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '1rem',
                    fontWeight: 800,
                    width: '130px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontWeight: 800, color: isDark ? '#94A3B8' : '#64748B' }}>₩</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Giá Bán VNĐ Ước Tính
              </label>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38BDF8' }}>
                {calculatedVnd.toLocaleString('vi-VN')} đ
              </div>
              <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px' }}>
                Tỷ giá: 1 KRW = {krwRate}đ (Phí {serviceFee}%)
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: formData.isOutOfStock ? '#EF4444' : '#10B981' }}>
                <input
                  type="checkbox"
                  checked={formData.isOutOfStock}
                  onChange={(e) => handleChange('isOutOfStock', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#EF4444' }}
                />
                <span>{formData.isOutOfStock ? 'Đang tạm hết hàng (Out of Stock)' : 'Còn hàng trong kho'}</span>
              </label>

              {!isPending && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: formData.isHidden ? (isDark ? '#94A3B8' : '#64748B') : '#38BDF8' }}>
                  <input
                    type="checkbox"
                    checked={formData.isHidden}
                    onChange={(e) => handleChange('isHidden', e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#38BDF8' }}
                  />
                  <span>{formData.isHidden ? 'Tạm ẩn khỏi Website' : 'Đang hiển thị trên Website'}</span>
                </label>
              )}
            </div>
          </div>

          {/* Main Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '20px' }}>
            {/* Image Preview & URL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Ảnh Sản Phẩm (HD)
              </label>
              <div style={{
                width: '100%',
                height: '210px',
                borderRadius: '10px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {formData.productImage ? (
                  <img
                    src={formData.productImage}
                    alt={formData.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                ) : (
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Dán link ảnh online..."
                  value={formData.productImage}
                  onChange={(e) => handleChange('productImage', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Product Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Product Name VN */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Tên Sản Phẩm (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ví dụ: Hồng Sâm Củ Khô KGC Cao Cấp 300g..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Korean Name & Brand */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                    Tên Gốc (Tiếng Hàn)
                  </label>
                  <input
                    type="text"
                    value={formData.nameKr}
                    onChange={(e) => handleChange('nameKr', e.target.value)}
                    placeholder="정관장 홍삼..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                    Thương Hiệu (Brand)
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="KGC, CheongKwanJang, Nonghyup..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Category & Origin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                    Phân Loại Ngành Hàng
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  >
                    <option value="ginseng">Sâm Nấm Hàn Quốc</option>
                    <option value="supplements">Thực Phẩm Chức Năng</option>
                    <option value="cosmetics">Mỹ Phẩm Nội Địa Hàn</option>
                    <option value="skincare">Chăm Sóc Da & Body</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                    Xuất Xứ
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => handleChange('origin', e.target.value)}
                    placeholder="Hàn Quốc"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Rating & Reviews */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                    Đánh Giá Sao
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => handleChange('rating', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                    Số Lượt Đánh Giá
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviewsCount}
                    onChange={(e) => handleChange('reviewsCount', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Ingredients & Usage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                Hoạt Chất Chính / Thành Phần Nổi Bật (Phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={formData.activeIngredients}
                onChange={(e) => handleChange('activeIngredients', e.target.value)}
                placeholder="Ví dụ: Ginsenoside Rg1+Rb1+Rg3 5.5mg/g, Đông Trùng Hạ Thảo..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  backgroundColor: isDark ? '#0F172A' : '#FFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#CBD5E1' : '#475569', display: 'block', marginBottom: '4px' }}>
                Mô Tả Sản Phẩm & Hướng Dẫn Sử Dụng
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả công dụng, cách dùng, lưu ý khi bảo quản..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  backgroundColor: isDark ? '#0F172A' : '#FFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '0.82rem',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(formData.goodsNo)}
              style={{
                backgroundColor: isDark ? '#450A0A' : '#FEE2E2',
                color: '#EF4444',
                border: isDark ? '1px solid #7F1D1D' : 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={15} />
              <span>Xoá Sản Phẩm</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: isDark ? '#1E293B' : '#FFF',
                color: isDark ? '#CBD5E1' : '#64748B',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Huỷ Bỏ
            </button>

            {isPending && onApprove ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleApproveAndPublish}
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Duyệt & Xuất Bản Lên Web Ngay</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSubmit}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Lưu Thay Đổi Ngay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
