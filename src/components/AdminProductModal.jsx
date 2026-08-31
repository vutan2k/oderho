import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Check, Trash2, Eye, EyeOff, Sparkles,
  DollarSign, Image as ImageIcon, Tag, Layers, Star, AlertCircle,
  ExternalLink, Save, ArrowRight, RefreshCw, Box, Plus, Camera, CheckCircle2
} from 'lucide-react';

const extractAllImages = (prod) => {
  if (!prod) return [];
  const list = [];
  if (prod.productImage) list.push(prod.productImage);
  if (Array.isArray(prod.images)) list.push(...prod.images);
  if (Array.isArray(prod.albumImgs)) list.push(...prod.albumImgs);
  if (Array.isArray(prod.photoReviews)) list.push(...prod.photoReviews);
  return Array.from(new Set(list.filter(url => typeof url === 'string' && url.trim().length > 5)));
};

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

  const initialImages = useMemo(() => extractAllImages(product), [product]);
  const initialMainImage = product?.productImage || initialImages[0] || '';

  const [formData, setFormData] = useState(() => ({
    goodsNo: product?.goodsNo || product?.id || `P-${Date.now()}`,
    name: product?.name || '',
    nameKr: product?.nameKr || product?.koreanTitle || '',
    brand: product?.brand || '',
    category: product?.category || 'ginseng',
    foreignPrice: product?.foreignPrice ?? product?.price ?? 0,
    productImage: initialMainImage,
    images: initialImages,
    rating: product?.rating ?? 4.9,
    reviewsCount: product?.reviewsCount ?? 120,
    origin: product?.origin || 'Hàn Quốc',
    description: product?.description || '',
    usage: product?.usage || '',
    activeIngredients: Array.isArray(product?.activeIngredients) ? product.activeIngredients.join(', ') : (product?.activeIngredients || ''),
    isOutOfStock: Boolean(product?.isOutOfStock),
    isHidden: Boolean(product?.isHidden),
    isVerifiedHealthFood: product?.isVerifiedHealthFood ?? true,
    isGmpCertified: product?.isGmpCertified ?? true
  }));

  const [selectedPreviewImg, setSelectedPreviewImg] = useState(initialMainImage);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      const allImgs = extractAllImages(product);
      const mainImg = product.productImage || allImgs[0] || '';
      setFormData({
        goodsNo: product.goodsNo || product.id || `P-${Date.now()}`,
        name: product.name || '',
        nameKr: product.nameKr || product.koreanTitle || '',
        brand: product.brand || '',
        category: product.category || 'ginseng',
        foreignPrice: product.foreignPrice ?? product.price ?? 0,
        productImage: mainImg,
        images: allImgs.length > 0 ? allImgs : (mainImg ? [mainImg] : []),
        rating: product.rating ?? 4.9,
        reviewsCount: product.reviewsCount ?? 120,
        origin: product.origin || 'Hàn Quốc',
        description: product.description || '',
        usage: product.usage || '',
        activeIngredients: Array.isArray(product.activeIngredients) ? product.activeIngredients.join(', ') : (product.activeIngredients || ''),
        isOutOfStock: Boolean(product.isOutOfStock),
        isHidden: Boolean(product.isHidden),
        isVerifiedHealthFood: product.isVerifiedHealthFood ?? true,
        isGmpCertified: product.isGmpCertified ?? true
      });
      setSelectedPreviewImg(mainImg);
      setNewImageUrl('');
      setIsAddingImage(false);
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

    const initialImgs = extractAllImages(product);
    const imagesChanged = JSON.stringify(formData.images) !== JSON.stringify(initialImgs);

    return (
      formData.goodsNo !== initialGoodsNo ||
      formData.name !== initialName ||
      formData.nameKr !== initialNameKr ||
      formData.brand !== initialBrand ||
      formData.category !== initialCategory ||
      parseFloat(formData.foreignPrice) !== parseFloat(initialForeignPrice) ||
      formData.productImage !== initialProductImage ||
      imagesChanged ||
      formData.origin !== initialOrigin ||
      formData.description !== initialDescription ||
      formData.usage !== initialUsage
    );
  }, [formData, product]);

  const currentPreview = selectedPreviewImg || formData.productImage || (formData.images && formData.images[0]) || '';

  const handleSelectPreview = (imgUrl) => {
    setSelectedPreviewImg(imgUrl);
  };

  const handleSetAsMainImage = (imgUrl) => {
    if (!imgUrl) return;
    setFormData(prev => {
      const updatedImages = prev.images.includes(imgUrl)
        ? [imgUrl, ...prev.images.filter(img => img !== imgUrl)]
        : [imgUrl, ...prev.images];
      return {
        ...prev,
        productImage: imgUrl,
        images: updatedImages
      };
    });
    setSelectedPreviewImg(imgUrl);
  };

  const handleRemoveImage = (indexToRemove, e) => {
    if (e) e.stopPropagation();
    const targetUrl = formData.images[indexToRemove];
    setFormData(prev => {
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newMain = prev.productImage;
      if (prev.productImage === targetUrl) {
        newMain = updatedImages[0] || '';
      }
      return {
        ...prev,
        images: updatedImages,
        productImage: newMain
      };
    });

    if (selectedPreviewImg === targetUrl) {
      const remaining = formData.images.filter((_, idx) => idx !== indexToRemove);
      setSelectedPreviewImg(remaining[0] || '');
    }
  };

  const handleAddImage = (e) => {
    if (e) e.preventDefault();
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!formData.images.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, trimmed],
        productImage: prev.productImage || trimmed
      }));
      setSelectedPreviewImg(trimmed);
    }
    setNewImageUrl('');
    setIsAddingImage(false);
  };

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
          {/* Quick Price Banner */}
          <div style={{
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                    width: '140px',
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
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38BDF8' }}>
                {calculatedVnd.toLocaleString('vi-VN')} đ
              </div>
              <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px' }}>
                Tỷ giá: 1 KRW = {krwRate}đ (Phí {serviceFee}%)
              </div>
            </div>
          </div>

          {/* Main Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: '22px' }}>
            {/* Image Gallery (Main Preview & Thumbnails Album) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={15} color="#38BDF8" />
                  <span>Ảnh Sản Phẩm (HD)</span>
                  <span style={{
                    fontSize: '0.7rem',
                    backgroundColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#93C5FD' : '#2563EB',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}>
                    {formData.images?.length || (formData.productImage ? 1 : 0)} ảnh
                  </span>
                </label>

                {/* Nút đặt làm ảnh chính nếu đang xem ảnh phụ */}
                {currentPreview && currentPreview !== formData.productImage && (
                  <button
                    type="button"
                    onClick={() => handleSetAsMainImage(currentPreview)}
                    style={{
                      backgroundColor: '#2563EB',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Star size={11} fill="#FFF" />
                    <span>Đặt làm ảnh chính</span>
                  </button>
                )}
              </div>

              {/* Khung xem ảnh lớn chính */}
              <div style={{
                width: '100%',
                height: '230px',
                borderRadius: '12px',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                backgroundColor: isDark ? '#0B1329' : '#F8FAFC',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {currentPreview ? (
                  <img
                    src={currentPreview}
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

                {/* Badge nếu ảnh này là ảnh chính */}
                {currentPreview && currentPreview === formData.productImage && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: '#10B981',
                    color: '#FFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}>
                    <CheckCircle2 size={11} />
                    <span>ẢNH ĐẠI DIỆN CHÍNH</span>
                  </div>
                )}
              </div>

              {/* Album Thumbnails: Danh sách toàn bộ ảnh */}
              {formData.images && formData.images.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B' }}>
                    Bộ Sưu Tập ({formData.images.length} hình - bấm để xem/đổi ảnh chính):
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    maxWidth: '100%'
                  }}>
                    {formData.images.map((imgUrl, idx) => {
                      const isSelected = currentPreview === imgUrl;
                      const isMain = formData.productImage === imgUrl;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectPreview(imgUrl)}
                          style={{
                            position: 'relative',
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #38BDF8' : (isMain ? '2px solid #10B981' : (isDark ? '1px solid #334155' : '1px solid #E2E8F0')),
                            backgroundColor: isDark ? '#0F172A' : '#FFF',
                            overflow: 'hidden',
                            flexShrink: 0,
                            cursor: 'pointer',
                            opacity: isSelected ? 1 : 0.75,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=100&q=80';
                            }}
                          />

                          {/* Dấu sao cho ảnh chính */}
                          {isMain && (
                            <div style={{
                              position: 'absolute',
                              bottom: '2px',
                              left: '2px',
                              backgroundColor: '#10B981',
                              color: '#FFF',
                              borderRadius: '4px',
                              width: '14px',
                              height: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Star size={9} fill="#FFF" />
                            </div>
                          )}

                          {/* Nút xoá ảnh */}
                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              title="Xoá ảnh này khỏi album"
                              onClick={(e) => handleRemoveImage(idx, e)}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                backgroundColor: 'rgba(239, 68, 68, 0.85)',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '4px',
                                width: '15px',
                                height: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ô Thêm Ảnh Mới vào Album */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Dán link ảnh HD mới để thêm..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage(e);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!newImageUrl.trim()}
                    style={{
                      backgroundColor: newImageUrl.trim() ? '#2563EB' : (isDark ? '#334155' : '#E2E8F0'),
                      color: newImageUrl.trim() ? '#FFF' : '#94A3B8',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: newImageUrl.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}
                  >
                    <Plus size={13} />
                    <span>Thêm</span>
                  </button>
                </div>

                {/* Chỉnh sửa link ảnh chính trực tiếp */}
                <div>
                  <div style={{ fontSize: '0.68rem', color: isDark ? '#94A3B8' : '#64748B', marginBottom: '2px' }}>
                    Link URL Ảnh Đại Diện Chính:
                  </div>
                  <input
                    type="text"
                    placeholder="URL ảnh đại diện chính..."
                    value={formData.productImage}
                    onChange={(e) => handleChange('productImage', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.72rem',
                      outline: 'none'
                    }}
                  />
                </div>
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
