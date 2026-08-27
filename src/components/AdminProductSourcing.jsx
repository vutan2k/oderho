import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductModal from './AdminProductModal';
import {
  VERIFIED_KOREAN_HEALTH_CATALOG,
  scrapeKoreanHealthProduct
} from '../services/koreanHealthScraperCore';
import { scrapeProductMetadata } from '../services/productScraperService';
import {
  Zap, Search, Plus, Trash2, Edit3, Check,
  CheckCircle2, AlertCircle, RefreshCw, Layers,
  ExternalLink, ArrowRight, X, Sparkles, Box, CheckCheck
} from 'lucide-react';

export default function AdminProductSourcing() {
  const {
    pendingProducts,
    addPendingProduct,
    updatePendingProduct,
    approvePendingProduct,
    approveSelectedPendingProducts,
    approveAllPendingProducts,
    rejectPendingProduct,
    addProduct,
    rates
  } = useContext(AppContext);
  const showToast = useToast();

  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'scraper'

  // Sourcing input state
  const [sourcingInput, setSourcingInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedPreview, setScrapedPreview] = useState(null);

  // Batch selection state in Pending queue
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal edit state for pending item
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFee = rates?.serviceFeePercent || 5;

  // Toggle select item
  const handleToggleSelect = (goodsNo) => {
    setSelectedIds(prev =>
      prev.includes(goodsNo) ? prev.filter(id => id !== goodsNo) : [...prev, goodsNo]
    );
  };

  // Select all / Deselect all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === pendingProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingProducts.map(p => p.goodsNo));
    }
  };

  // Duyệt 1 sản phẩm 1-click
  const handleApproveSingle = (prod) => {
    approvePendingProduct(prod.goodsNo);
    if (showToast) showToast(`Đã duyệt và xuất bản "${prod.name}" lên website!`, 'success');
  };

  // Duyệt các mục đã chọn
  const handleApproveSelected = () => {
    if (selectedIds.length === 0) return;
    approveSelectedPendingProducts(selectedIds);
    if (showToast) showToast(`Đã duyệt thành công ${selectedIds.length} sản phẩm lên website!`, 'success');
    setSelectedIds([]);
  };

  // Duyệt tất cả
  const handleApproveAll = () => {
    if (pendingProducts.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn duyệt và xuất bản TẤT CẢ ${pendingProducts.length} sản phẩm lên website?`)) {
      approveAllPendingProducts();
      if (showToast) showToast(`Đã duyệt toàn bộ ${pendingProducts.length} sản phẩm lên website!`, 'success');
      setSelectedIds([]);
    }
  };

  // Từ chối / Xoá 1 sản phẩm chờ duyệt
  const handleRejectSingle = (goodsNo) => {
    rejectPendingProduct(goodsNo);
    if (showToast) showToast('Đã xoá sản phẩm khỏi Hàng Chờ Duyệt!', 'info');
  };

  // Mở modal sửa trước khi duyệt
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Lưu chỉnh sửa cho sản phẩm chờ duyệt
  const handleSavePendingItem = (goodsNo, updatedData) => {
    updatePendingProduct(goodsNo, updatedData);
    if (showToast) showToast(`Đã cập nhật thông tin "${updatedData.name}" trong Hàng Chờ Duyệt!`, 'success');
  };

  // Duyệt & Đăng ngay từ modal
  const handleApproveFromModal = (goodsNo, updatedData) => {
    const cleanProduct = {
      ...updatedData,
      goodsNo: goodsNo,
      isPublished: true,
      status: 'published'
    };
    addProduct(cleanProduct);
    rejectPendingProduct(goodsNo);
    if (showToast) showToast(`Đã duyệt và xuất bản "${cleanProduct.name}" lên website!`, 'success');
  };

  // Xử lý cào sản phẩm từ URL
  const handleScrapeProduct = async (e) => {
    if (e) e.preventDefault();
    if (!sourcingInput.trim() || isScraping) return;

    setIsScraping(true);
    setScrapedPreview(null);

    const input = sourcingInput.trim();
    try {
      if (/kgc|nhmall|nonghyup|naver|smartstore|brand\.naver|health|ginseng/i.test(input)) {
        const item = await scrapeKoreanHealthProduct(input);
        setScrapedPreview(item);
        if (showToast) showToast('Đã bóc tách thành công sản phẩm từ Hàn Quốc!', 'success');
      } else {
        const res = await scrapeProductMetadata(input);
        if (res.success && res.product) {
          setScrapedPreview(res.product);
          if (showToast) showToast('Đã bóc tách thành công sản phẩm từ Olive Young!', 'success');
        } else {
          const item = await scrapeKoreanHealthProduct(input);
          setScrapedPreview(item);
        }
      }
    } catch (err) {
      if (showToast) showToast(`Lỗi khi cào dữ liệu: ${err.message}`, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  // Lưu vào Hàng Chờ Duyệt (Mặc định chuẩn)
  const handleSaveToPendingQueue = (prod) => {
    if (!prod) return;
    addPendingProduct({
      goodsNo: prod.goodsNo || `P-${Date.now()}`,
      name: prod.name,
      nameKr: prod.koreanTitle || prod.nameKr || '',
      brand: prod.brand,
      category: prod.category || 'ginseng',
      foreignPrice: prod.foreignPrice || prod.price || 30000,
      price: prod.foreignPrice || prod.price || 30000,
      productImage: prod.productImage,
      images: prod.images || [prod.productImage],
      rating: prod.rating || 4.9,
      reviewsCount: prod.reviewsCount || 1500,
      origin: prod.origin || 'Hàn Quốc',
      description: prod.description || '',
      usage: prod.usage || '',
      activeIngredients: prod.activeIngredients || [],
      isPublished: false,
      status: 'pending',
      scrapedAt: new Date().toISOString()
    });
    if (showToast) showToast(`Đã lưu "${prod.name}" vào Hàng Chờ Duyệt!`, 'success');
    setScrapedPreview(null);
    setSourcingInput('');
    setActiveSubTab('pending'); // Chuyển sang hàng chờ duyệt để kiểm tra
  };

  // Duyệt & Đăng ngay (1-click bypass)
  const handleDirectPublish = (prod) => {
    if (!prod) return;
    addProduct({
      goodsNo: prod.goodsNo || `P-${Date.now()}`,
      name: prod.name,
      nameKr: prod.koreanTitle || prod.nameKr || '',
      brand: prod.brand,
      category: prod.category || 'ginseng',
      foreignPrice: prod.foreignPrice || prod.price || 30000,
      price: prod.foreignPrice || prod.price || 30000,
      productImage: prod.productImage,
      images: prod.images || [prod.productImage],
      rating: prod.rating || 4.9,
      reviewsCount: prod.reviewsCount || 1500,
      origin: prod.origin || 'Hàn Quốc',
      description: prod.description || '',
      usage: prod.usage || '',
      activeIngredients: prod.activeIngredients || [],
      isVerifiedHealthFood: true,
      isGmpCertified: true,
      isPublished: true,
      status: 'published'
    });
    if (showToast) showToast(`Đã đăng "${prod.name}" lên Kho Live thành công!`, 'success');
    setScrapedPreview(null);
    setSourcingInput('');
  };

  // Nạp nhanh bộ sưu tập vào Hàng Chờ Duyệt
  const handleBatchImportToPending = (type = 'all') => {
    let pool = [...VERIFIED_KOREAN_HEALTH_CATALOG];
    if (type === 'ginseng') pool = pool.filter(p => p.category === 'ginseng');
    else if (type === 'supplements') pool = pool.filter(p => p.category === 'supplements');
    else if (type === 'kgc') pool = pool.filter(p => p.brand.includes('KGC') || p.brand.includes('CheongKwanJang'));
    else if (type === 'naver') pool = pool.filter(p => p.source.includes('Naver') || (p.originalUrl && p.originalUrl.includes('naver.com')));

    let count = 0;
    pool.forEach(item => {
      addPendingProduct({
        goodsNo: item.goodsNo,
        name: item.name,
        nameKr: item.koreanTitle || '',
        brand: item.brand,
        category: item.category,
        foreignPrice: item.foreignPrice,
        price: item.foreignPrice,
        productImage: item.productImage,
        images: item.images,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        origin: item.origin,
        description: item.description,
        usage: item.usage,
        activeIngredients: item.activeIngredients,
        isPublished: false,
        status: 'pending',
        scrapedAt: new Date().toISOString()
      });
      count++;
    });

    if (showToast) showToast(`Đã nạp ${count} sản phẩm ${type.toUpperCase()} vào Hàng Chờ Duyệt!`, 'success');
    setActiveSubTab('pending');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Sub Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '12px 18px',
        border: '1px solid #E2E8F0',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('pending')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeSubTab === 'pending' ? '#F59E0B' : 'transparent',
              color: activeSubTab === 'pending' ? '#FFF' : '#64748B',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={16} />
            <span>Hàng Chờ Duyệt</span>
            <span style={{
              backgroundColor: activeSubTab === 'pending' ? 'rgba(255,255,255,0.3)' : '#F1F5F9',
              color: activeSubTab === 'pending' ? '#FFF' : '#475569',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 900
            }}>
              {pendingProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('scraper')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeSubTab === 'scraper' ? '#10B981' : 'transparent',
              color: activeSubTab === 'scraper' ? '#FFF' : '#64748B',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={16} />
            <span>Cào & Nạp Dữ Liệu Hàn Quốc</span>
          </button>
        </div>

        {activeSubTab === 'pending' && pendingProducts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleApproveAll}
              style={{
                backgroundColor: '#10B981',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCheck size={16} />
              <span>Duyệt Tất Cả ({pendingProducts.length}) Lên Web</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleApproveSelected}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={15} />
                <span>Duyệt {selectedIds.length} Mục Đã Chọn</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SUB-VIEW 1: HÀNG CHỜ DUYỆT (PENDING APPROVAL QUEUE)              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Header Note */}
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#D97706" />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#92400E' }}>
                  Hàng chờ duyệt trước khi xuất bản lên website
                </strong>
                <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '2px' }}>
                  Các sản phẩm trong danh sách này <strong>chưa hiển thị</strong> cho khách hàng. Hãy kiểm tra giá, ảnh và bấm Duyệt để đưa lên web bán hàng.
                </div>
              </div>
            </div>

            {pendingProducts.length > 0 && (
              <button
                onClick={handleToggleSelectAll}
                style={{
                  backgroundColor: '#FFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#334155'
                }}
              >
                {selectedIds.length === pendingProducts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            )}
          </div>

          {/* Pending List Grid */}
          {pendingProducts.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: '#FFF',
              borderRadius: '16px',
              border: '1px dashed #CBD5E1',
              color: '#94A3B8'
            }}>
              <Box size={44} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#475569' }}>
                Hiện không có sản phẩm nào đang chờ duyệt
              </div>
              <div style={{ fontSize: '0.82rem', marginTop: '6px', color: '#64748B' }}>
                Bấm sang tab <strong>"Cào & Nạp Dữ Liệu Hàn Quốc"</strong> bên trên để cào link sản phẩm mới!
              </div>
              <button
                onClick={() => setActiveSubTab('scraper')}
                style={{
                  marginTop: '16px',
                  backgroundColor: '#10B981',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={15} />
                <span>Mở Trung Tâm Cào Hàng Ngay</span>
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {pendingProducts.map(prod => {
                const won = prod.foreignPrice || prod.price || 0;
                const vnd = Math.round(won * krwRate * (1 + serviceFee / 100));
                const isSelected = selectedIds.includes(prod.goodsNo);

                return (
                  <div
                    key={prod.goodsNo}
                    style={{
                      backgroundColor: '#FFF',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Header bar of Card: Checkbox + Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(prod.goodsNo)}
                          style={{ width: '16px', height: '16px', accentColor: '#2563EB' }}
                        />
                        <span>Mã: {prod.goodsNo}</span>
                      </label>

                      <span style={{
                        backgroundColor: '#FEF3C7',
                        color: '#D97706',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        CHỜ DUYỆT
                      </span>
                    </div>

                    {/* Image & Title */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        <img
                          src={prod.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
                          {prod.brand || 'Thương hiệu Hàn Quốc'}
                        </div>
                        <div style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: '#0F172A',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {prod.name}
                        </div>
                        {prod.nameKr && (
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.nameKr}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing Box */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Giá Won gốc:</div>
                        <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{won.toLocaleString('vi-VN')} ₩</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Giá bán VNĐ ước tính:</div>
                        <strong style={{ fontSize: '0.95rem', color: '#2563EB' }}>{vnd.toLocaleString('vi-VN')} đ</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '6px',
                      borderTop: '1px solid #F1F5F9'
                    }}>
                      {/* Approve Button */}
                      <button
                        onClick={() => handleApproveSingle(prod)}
                        style={{
                          flex: 1,
                          backgroundColor: '#10B981',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={14} />
                        <span>Duyệt Lên Web</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Edit3 size={13} />
                        <span>Sửa</span>
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => handleRejectSingle(prod.goodsNo)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          cursor: 'pointer'
                        }}
                        title="Xoá khỏi Hàng Chờ Duyệt"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SUB-VIEW 2: CÀO & NẠP DỮ LIỆU HÀN QUỐC                           */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'scraper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Smart Scraper Input Bar */}
          <div style={{
            backgroundColor: '#0F172A',
            color: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ backgroundColor: '#10B981', color: '#FFF', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                ĐA NỀN TẢNG
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Naver Brand Store • KGC CheongKwanJang • Nonghyup • Olive Young
              </span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 6px 0' }}>
              🚀 Trung Tâm Tìm & Nạp Hàng Hàn Quốc Chuẩn Y Tế
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '0 0 16px 0' }}>
              Dán đường dẫn sản phẩm bất kỳ để tự động bóc tách ảnh HD, giá gốc và thành phần dinh dưỡng.
            </p>

            <form onSubmit={handleScrapeProduct} style={{ display: 'flex', gap: '8px', maxWidth: '700px' }}>
              <input
                type="text"
                placeholder="Dán link Naver Brand Store, KGC, Nonghyup, Olive Young..."
                value={sourcingInput}
                onChange={(e) => setSourcingInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#1E293B',
                  color: '#FFF',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isScraping || !sourcingInput.trim()}
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 20px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: isScraping ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isScraping ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                <span>{isScraping ? 'Đang bóc tách...' : 'Cào Dữ Liệu'}</span>
              </button>
            </form>

            {/* Quick Batch Sourcing Buttons */}
            <div style={{ marginTop: '18px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Nạp nhanh bộ sưu tập vào Hàng Chờ Duyệt:</span>
              <button
                onClick={() => handleBatchImportToPending('naver')}
                style={{ backgroundColor: '#03C75A', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🟢 Naver Brand Store
              </button>
              <button
                onClick={() => handleBatchImportToPending('kgc')}
                style={{ backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Top Sâm KGC
              </button>
              <button
                onClick={() => handleBatchImportToPending('ginseng')}
                style={{ backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Nấm Nonghyup
              </button>
              <button
                onClick={() => handleBatchImportToPending('supplements')}
                style={{ backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + TPCN Quốc Dân
              </button>
              <button
                onClick={() => handleBatchImportToPending('all')}
                style={{ backgroundColor: '#F59E0B', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
              >
                ⚡ Nhập Tất Cả Vào Hàng Chờ Duyệt
              </button>
            </div>
          </div>

          {/* Scraped Product Result Preview Card */}
          {scrapedPreview && (
            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '16px',
              border: '2px solid #10B981',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: '#0F172A' }}>
                    KẾT QUẢ BÓC TÁCH THÀNH CÔNG
                  </span>
                </div>
                <button onClick={() => setScrapedPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 240px) 1fr', gap: '20px' }}>
                {/* Image */}
                <div style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <img
                    src={scrapedPreview.productImage}
                    alt=""
                    style={{ width: '100%', height: '220px', objectFit: 'contain' }}
                  />
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
                    Thương hiệu: {scrapedPreview.brand} • Nguồn: {scrapedPreview.source || 'Hàn Quốc'}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                    {scrapedPreview.name}
                  </h3>
                  {scrapedPreview.koreanTitle && (
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      Tên tiếng Hàn: {scrapedPreview.koreanTitle}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Giá Won: </span>
                      <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{scrapedPreview.foreignPrice?.toLocaleString('vi-VN')} ₩</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Giá về VN ước tính: </span>
                      <strong style={{ fontSize: '1.1rem', color: '#2563EB' }}>
                        {(Math.round(scrapedPreview.foreignPrice * krwRate * (1 + serviceFee / 100))).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>

                  {scrapedPreview.activeIngredients && scrapedPreview.activeIngredients.length > 0 && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#059669', backgroundColor: '#ECFDF5', padding: '8px 12px', borderRadius: '8px' }}>
                      <strong>Hoạt chất chính:</strong> {scrapedPreview.activeIngredients.join(' | ')}
                    </div>
                  )}

                  {/* Actions for Scraped Item */}
                  <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleSaveToPendingQueue(scrapedPreview)}
                      style={{
                        backgroundColor: '#F59E0B',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Layers size={16} />
                      <span>Lưu Vào Hàng Chờ Duyệt (Khuyên Dùng)</span>
                    </button>

                    <button
                      onClick={() => handleDirectPublish(scrapedPreview)}
                      style={{
                        backgroundColor: '#10B981',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} />
                      <span>Duyệt & Đăng Lên Web Ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Edit Modal for Pending Item */}
      <AdminProductModal
        isOpen={isModalOpen}
        product={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePendingItem}
        onApprove={handleApproveFromModal}
        onDelete={handleRejectSingle}
        rates={rates}
        isPending={true}
      />
    </div>
  );
}
