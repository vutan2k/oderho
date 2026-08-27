import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductModal from './AdminProductModal';
import {
  Search, Plus, Trash2, Edit3, ExternalLink,
  Star, RefreshCw, Eye, EyeOff, Layers, ShoppingBag,
  CheckCircle2, AlertCircle, Filter, ArrowUpRight,
  SlidersHorizontal, Check, ArrowRight
} from 'lucide-react';

export default function AdminProductCatalog() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    addPendingProduct,
    rates
  } = useContext(AppContext);
  const showToast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'

  // Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFee = rates?.serviceFeePercent || 5;

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = !searchTerm.trim() ||
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.goodsNo && p.goodsNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.nameKr && p.nameKr.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const isOutOfStock = Boolean(p.isOutOfStock);
      const matchStock = stockFilter === 'all' ||
        (stockFilter === 'in_stock' && !isOutOfStock) ||
        (stockFilter === 'out_of_stock' && isOutOfStock);

      return matchCat && matchSearch && matchStock;
    });
  }, [products, selectedCategory, searchTerm, stockFilter]);

  // Mở modal sửa nhanh
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  // Mở modal tạo mới
  const handleOpenCreateNew = () => {
    setEditingProduct({
      goodsNo: `SP-${Date.now()}`,
      name: '',
      nameKr: '',
      brand: 'Tavy Korea',
      category: 'ginseng',
      foreignPrice: 35000,
      productImage: '',
      images: [],
      rating: 4.9,
      reviewsCount: 150,
      origin: 'Hàn Quốc',
      description: '',
      usage: '',
      activeIngredients: [],
      isOutOfStock: false,
      isHidden: false
    });
    setIsModalOpen(true);
  };

  // Lưu sản phẩm từ Modal
  const handleSaveProduct = async (goodsNo, updatedData) => {
    const exists = products.some(p => p.goodsNo === goodsNo);
    if (exists) {
      updateProduct(goodsNo, updatedData);
      if (showToast) showToast(`Đã cập nhật thông tin sản phẩm "${updatedData.name}"!`, 'success');
    } else {
      addProduct(updatedData);
      if (showToast) showToast(`Đã thêm mới sản phẩm "${updatedData.name}" vào Kho Live!`, 'success');
    }
  };

  // Xoá sản phẩm
  const handleDeleteProduct = (goodsNo) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này khỏi Kho Hàng Live?')) {
      deleteProduct(goodsNo);
      setIsModalOpen(false);
      if (showToast) showToast('Đã xoá sản phẩm khỏi kho!', 'info');
    }
  };

  // Toggle nhanh trạng thái tồn kho
  const handleToggleStock = (e, prod) => {
    e.stopPropagation();
    const newStatus = !prod.isOutOfStock;
    updateProduct(prod.goodsNo, { isOutOfStock: newStatus });
    if (showToast) {
      showToast(newStatus ? `Đã chuyển "${prod.name}" sang Hết hàng!` : `Đã chuyển "${prod.name}" sang Còn hàng!`, 'info');
    }
  };

  // Toggle nhanh ẩn / hiện
  const handleToggleVisibility = (e, prod) => {
    e.stopPropagation();
    const newHidden = !prod.isHidden;
    updateProduct(prod.goodsNo, { isHidden: newHidden });
    if (showToast) {
      showToast(newHidden ? `Đã tạm ẩn "${prod.name}" khỏi web!` : `Đã hiển thị "${prod.name}" lên web!`, 'info');
    }
  };

  // Chuyển sản phẩm về Hàng Chờ Duyệt (Unpublish to Pending)
  const handleMoveToPending = (e, prod) => {
    e.stopPropagation();
    if (window.confirm(`Chuyển "${prod.name}" về lại Hàng Chờ Duyệt (gỡ khỏi web bán hàng)?`)) {
      addPendingProduct({ ...prod, isPublished: false, status: 'pending' });
      deleteProduct(prod.goodsNo);
      if (showToast) showToast(`Đã chuyển "${prod.name}" về Hàng Chờ Duyệt!`, 'warning');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner & Control */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0F172A' }}>
              🏷️ Kho Sản Phẩm Đang Bán ({products.length})
            </h2>
            <span style={{
              backgroundColor: '#ECFDF5',
              color: '#059669',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #A7F3D0'
            }}>
              LIVE TRÊN WEBSITE
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
            Toàn quyền quản trị: Bấm vào bất kỳ thẻ sản phẩm nào để <strong>Chỉnh Sửa Nhanh</strong> thông tin & giá bán.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleOpenCreateNew}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '14px 18px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã, thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'ginseng', label: '🌿 Sâm Nấm' },
            { id: 'supplements', label: '💊 TPCN' },
            { id: 'cosmetics', label: '✨ Mỹ Phẩm' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: selectedCategory === cat.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                backgroundColor: selectedCategory === cat.id ? '#EFF6FF' : '#FFF',
                color: selectedCategory === cat.id ? '#1D4ED8' : '#475569',
                fontWeight: selectedCategory === cat.id ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stock Filter */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#334155',
              backgroundColor: '#FFF'
            }}
          >
            <option value="all">Tất cả tình trạng kho</option>
            <option value="in_stock">🟢 Còn hàng</option>
            <option value="out_of_stock">🔴 Tạm hết hàng</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '50px 20px',
            textAlign: 'center',
            backgroundColor: '#FFF',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            color: '#94A3B8'
          }}>
            <ShoppingBag size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#475569' }}>
              Không tìm thấy sản phẩm nào phù hợp
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>
              Hãy thử tìm kiếm từ khoá khác hoặc sang tab <strong>"Kho Nạp Hàng"</strong> để duyệt sản phẩm mới!
            </div>
          </div>
        ) : (
          filteredProducts.map(prod => {
            const won = prod.foreignPrice || prod.price || 0;
            const vnd = Math.round(won * krwRate * (1 + serviceFee / 100));
            const isOutOfStock = Boolean(prod.isOutOfStock);
            const isHidden = Boolean(prod.isHidden);

            return (
              <div
                key={prod.goodsNo || prod.id}
                onClick={() => handleOpenEdit(prod)}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '14px',
                  border: isOutOfStock ? '1px solid #FECACA' : (isHidden ? '1px dashed #CBD5E1' : '1px solid #E2E8F0'),
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  opacity: isHidden ? 0.75 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = isOutOfStock ? '#FECACA' : (isHidden ? '#CBD5E1' : '#E2E8F0');
                }}
              >
                {/* Product Image & Badges */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '190px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #F1F5F9'
                }}>
                  <img
                    src={prod.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Brand Tag Top Left */}
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    color: '#FFF',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {prod.brand || 'Hàn Quốc'}
                  </span>

                  {/* Status Tag Top Right */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    {isOutOfStock && (
                      <span style={{
                        backgroundColor: '#EF4444',
                        color: '#FFF',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        HẾT HÀNG
                      </span>
                    )}
                    {isHidden && (
                      <span style={{
                        backgroundColor: '#64748B',
                        color: '#FFF',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        TẠM ẨN
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {prod.name}
                  </div>

                  {prod.nameKr && (
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.nameKr}
                    </div>
                  )}

                  {/* Pricing Box */}
                  <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                        {won.toLocaleString('vi-VN')} ₩
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#2563EB' }}>
                        {vnd.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#F59E0B', fontWeight: 800 }}>
                      <Star size={13} fill="#F59E0B" />
                      <span>{prod.rating || 4.9}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Toolbar */}
                <div
                  style={{
                    paddingTop: '10px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Toggle Stock */}
                    <button
                      title={isOutOfStock ? "Chuyển sang Còn hàng" : "Chuyển sang Hết hàng"}
                      onClick={(e) => handleToggleStock(e, prod)}
                      style={{
                        backgroundColor: isOutOfStock ? '#FEE2E2' : '#F1F5F9',
                        color: isOutOfStock ? '#DC2626' : '#475569',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isOutOfStock ? '🔴 Hết hàng' : '🟢 Còn hàng'}
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      title={isHidden ? "Hiện lên website" : "Tạm ẩn khỏi website"}
                      onClick={(e) => handleToggleVisibility(e, prod)}
                      style={{
                        backgroundColor: isHidden ? '#F1F5F9' : '#EFF6FF',
                        color: isHidden ? '#64748B' : '#2563EB',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isHidden ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Quick Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Edit3 size={12} />
                      <span>Sửa</span>
                    </button>

                    {/* Move to Pending Button */}
                    <button
                      title="Chuyển về Hàng Chờ Duyệt"
                      onClick={(e) => handleMoveToPending(e, prod)}
                      style={{
                        backgroundColor: '#FFFBEB',
                        color: '#D97706',
                        border: '1px solid #FDE68A',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Nháp
                    </button>

                    {/* Delete Button */}
                    <button
                      title="Xoá sản phẩm"
                      onClick={() => handleDeleteProduct(prod.goodsNo || prod.id)}
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Edit Modal */}
      <AdminProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        rates={rates}
        isPending={false}
      />
    </div>
  );
}
