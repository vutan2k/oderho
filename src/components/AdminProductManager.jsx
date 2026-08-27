import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import {
  VERIFIED_KOREAN_HEALTH_CATALOG,
  scrapeKoreanHealthProduct
} from '../services/koreanHealthScraperCore';
import { scrapeProductMetadata } from '../services/productScraperService';
import {
  Search, Plus, Trash2, Edit3, ExternalLink,
  Sparkles, Star, RefreshCw, Zap, Check, CheckCircle2,
  Filter, Eye, EyeOff, Layers, ShoppingBag, ShieldCheck,
  ArrowRight, X
} from 'lucide-react';

export default function AdminProductManager() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    rates
  } = useContext(AppContext);
  const showToast = useToast();

  // 2 Sub-tabs rõ ràng
  const [subTab, setSubTab] = useState('catalog'); // 'catalog' (Kho hàng đang bán) | 'sourcing' (Tìm & Nạp hàng Hàn Quốc)

  // Sub-tab 1: Kho Hàng Đang Bán State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);

  // Sub-tab 2: Sourcing Center State
  const [sourcingInput, setSourcingInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedPreview, setScrapedPreview] = useState(null);

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFee = rates?.serviceFeePercent || 5;

  // Lọc sản phẩm trong kho
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = !searchTerm.trim() ||
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.goodsNo && p.goodsNo.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Xử lý cào sản phẩm từ URL hoặc mã SP
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
          // Fallback sang Health scraper
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

  // Nạp sản phẩm vào Kho Hàng Live
  const handleImportToLive = (prod) => {
    if (!prod) return;
    addProduct({
      goodsNo: prod.goodsNo || `P-${Date.now()}`,
      name: prod.name,
      nameKr: prod.koreanTitle || prod.nameKr || '',
      brand: prod.brand,
      category: prod.category || 'health',
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
      isGmpCertified: true
    });
    if (showToast) showToast(`Đã thêm "${prod.name}" vào Kho Hàng Live thành công!`, 'success');
    setScrapedPreview(null);
    setSourcingInput('');
    setSubTab('catalog'); // Chuyển về kho để xem ngay
  };

  // Nạp nhanh bộ sưu tập
  const handleBatchImport = (type = 'all') => {
    let pool = [...VERIFIED_KOREAN_HEALTH_CATALOG];
    if (type === 'ginseng') pool = pool.filter(p => p.category === 'ginseng');
    else if (type === 'supplements') pool = pool.filter(p => p.category === 'supplements');
    else if (type === 'kgc') pool = pool.filter(p => p.brand.includes('KGC') || p.brand.includes('CheongKwanJang'));
    else if (type === 'naver') pool = pool.filter(p => p.source.includes('Naver') || (p.originalUrl && p.originalUrl.includes('naver.com')));

    let count = 0;
    pool.forEach(item => {
      addProduct({
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
        isVerifiedHealthFood: true,
        isGmpCertified: true
      });
      count++;
    });

    if (showToast) showToast(`Đã nạp thành công ${count} sản phẩm ${type.toUpperCase()} vào Kho Live!`, 'success');
    setSubTab('catalog');
  };

  // Xoá sản phẩm khỏi kho
  const handleDelete = (goodsNo) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này khỏi kho bán hàng?')) {
      deleteProduct(goodsNo);
      if (showToast) showToast('Đã xoá sản phẩm khỏi kho!', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 🚀 Navigation Sub-tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '8px 14px',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSubTab('catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: subTab === 'catalog' ? '#2563EB' : 'transparent',
              color: subTab === 'catalog' ? '#FFF' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingBag size={16} />
            <span>Kho Hàng Đang Bán ({products.length})</span>
          </button>

          <button
            onClick={() => setSubTab('sourcing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: subTab === 'sourcing' ? '#10B981' : 'transparent',
              color: subTab === 'sourcing' ? '#FFF' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Zap size={16} />
            <span>Tìm & Nạp Hàng Hàn Quốc (Naver / Olive Young)</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 1: KHO HÀNG ĐANG BÁN                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {subTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Filter Bar */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '350px' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm, thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'ginseng', label: '🌿 Sâm Nấm' },
                { id: 'supplements', label: '💊 TPCN' },
                { id: 'skincare', label: '✨ Mỹ Phẩm' }
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
          </div>

          {/* Product Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px'
          }}>
            {filteredProducts.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#FFF',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
                color: '#94A3B8'
              }}>
                <ShoppingBag size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Kho hàng chưa có sản phẩm phù hợp</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Bấm sang tab <strong>"Tìm & Nạp Hàng Hàn Quốc"</strong> để nạp sản phẩm tự động!
                </div>
              </div>
            ) : (
              filteredProducts.map(prod => {
                const won = prod.foreignPrice || prod.price || 0;
                const vnd = Math.round(won * krwRate * (1 + serviceFee / 100));

                return (
                  <div
                    key={prod.goodsNo || prod.id}
                    style={{
                      backgroundColor: '#FFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {/* Product Image & Badges */}
                    <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                      <img
                        src={prod.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        color: '#FFF',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {prod.brand || 'Hàn Quốc'}
                      </span>
                    </div>

                    {/* Product Title */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#0F172A',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {prod.name}
                      </div>

                      {/* Pricing */}
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {won.toLocaleString('vi-VN')} ₩
                          </div>
                          <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#2563EB' }}>
                            {vnd.toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#F59E0B', fontWeight: 700 }}>
                          <Star size={13} fill="#F59E0B" />
                          <span>{prod.rating || 4.9}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #F1F5F9'
                    }}>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                        Mã: {prod.goodsNo}
                      </span>
                      <button
                        onClick={() => handleDelete(prod.goodsNo || prod.id)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Xoá</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 2: TÌM & NẠP HÀNG HÀN QUỐC                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {subTab === 'sourcing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Unified Smart Scraper Bar */}
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
              Dán đường dẫn sản phẩm bất kỳ hoặc từ khóa để tự động lấy ảnh gốc HD và bảng thành phần dinh dưỡng.
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
                <span>{isScraping ? 'Đang bóc tách...' : 'Cào Ngay'}</span>
              </button>
            </form>

            {/* Quick Batch Sourcing Buttons */}
            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Nạp nhanh bộ sưu tập:</span>
              <button
                onClick={() => handleBatchImport('naver')}
                style={{ backgroundColor: '#03C75A', color: '#FFF', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🟢 Naver Brand Store
              </button>
              <button
                onClick={() => handleBatchImport('kgc')}
                style={{ backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Top Sâm KGC
              </button>
              <button
                onClick={() => handleBatchImport('ginseng')}
                style={{ backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Nấm Nonghyup
              </button>
              <button
                onClick={() => handleBatchImport('supplements')}
                style={{ backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + TPCN Quốc Dân
              </button>
              <button
                onClick={() => handleBatchImport('all')}
                style={{ backgroundColor: '#F59E0B', color: '#000', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
              >
                ⚡ Nhập Tất Cả (1-Click)
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
                    Thương hiệu: {scrapedPreview.brand} • Nguồn: {scrapedPreview.source}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                    {scrapedPreview.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Tên tiếng Hàn: {scrapedPreview.koreanTitle}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Giá Hàn Quốc: </span>
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

                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <button
                      onClick={() => handleImportToLive(scrapedPreview)}
                      style={{
                        backgroundColor: '#10B981',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={16} />
                      <span>Xác Nhận Nhập Vào Kho Hàng Live Ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
