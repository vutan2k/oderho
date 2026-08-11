import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { scrapeProductMetadata } from '../services/productScraperService';
import {
  Plus, Trash2, Save, Sparkles, Link as LinkIcon, Loader2,
  CheckCircle2, Search, Edit3, X, Image as ImageIcon, Star, Package
} from 'lucide-react';

const CATEGORIES = [
  { value: 'skincare', label: 'Mỹ phẩm dưỡng da' },
  { value: 'makeup', label: 'Mỹ phẩm trang điểm' },
  { value: 'health', label: 'Thực phẩm chức năng' },
  { value: 'pharmacy', label: 'Thuốc / Dược phẩm' },
];

const categoryLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val;

export default function AdminProductManager() {
  const {
    products, addProduct, updateProduct, deleteProduct, rates,
    botIsRunning, toggleBot, pendingProducts,
    approvePendingProduct, approveSelectedPendingProducts, approveAllPendingProducts, rejectPendingProduct
  } = useContext(AppContext);
  const showToast = useToast();

  const [quickLink, setQuickLink] = useState('');
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingBotInstant, setLoadingBotInstant] = useState(false);
  const [scrapedPreview, setScrapedPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedPendingGoodsNo, setSelectedPendingGoodsNo] = useState([]);
  const [editModal, setEditModal] = useState(null); // product object or null
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Manual Trigger 1-Run for Bot
  const handleTriggerBotInstant = async () => {
    setLoadingBotInstant(true);
    if (showToast) showToast('Bot đang tự động quét Olive Young Best Sellers...', 'info');
    const { executeSingleBotRun } = await import('../services/autoScraperBotService');
    const res = await executeSingleBotRun(products, pendingProducts);
    setLoadingBotInstant(false);

    if (res.success && res.product) {
      approvePendingProduct(res.product.goodsNo); // or put in queue
      if (showToast) showToast(`Bot đã cào thành công: "${res.product.name}"! Đã thêm vào hàng chờ duyệt.`, 'success');
    } else {
      if (showToast) showToast(`Lỗi bot cào: ${res.error}`, 'error');
    }
  };

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = filterCat === 'all' || p.category === filterCat;
      const term = searchTerm.toLowerCase();
      const matchSearch = !term ||
        (p.name || '').toLowerCase().includes(term) ||
        (p.brand || '').toLowerCase().includes(term) ||
        (p.goodsNo || '').toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [products, filterCat, searchTerm]);

  // ── Agent Scraper ──
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!quickLink.trim()) { showToast('Dán link sản phẩm Hàn Quốc!', 'error'); return; }
    setLoadingScrape(true);
    setScrapedPreview(null);
    showToast('Agent đang bóc tách thông tin từ link...', 'info');
    const res = await scrapeProductMetadata(quickLink.trim());
    setLoadingScrape(false);
    if (res.success && res.product) {
      setScrapedPreview(res.product);
      showToast('Bóc tách thành công! Kiểm tra kết quả bên dưới.', 'success');
    } else {
      showToast(`Lỗi: ${res.error}`, 'error');
    }
  };

  const handlePushScraped = () => {
    if (!scrapedPreview) return;
    addProduct(scrapedPreview);
    setScrapedPreview(null);
    setQuickLink('');
    showToast('Đã thêm sản phẩm mới lên Website!', 'success');
  };

  // ── Manual Add ──
  const handleAddNew = () => {
    const newProd = {
      goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '',
      brand: '',
      category: 'skincare',
      foreignPrice: 0,
      productImage: '',
      description: '',
      origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 5.0,
      reviewsCount: 0,
      usage: '',
      productUrl: '',
    };
    setEditForm(newProd);
    setEditModal({ isNew: true, ...newProd });
  };

  // ── Edit ──
  const openEdit = (prod) => {
    setEditForm({ ...prod });
    setEditModal(prod);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'foreignPrice' || field === 'rating' || field === 'reviewsCount'
        ? (parseFloat(value) || 0) : value
    }));
  };

  const handleSaveEdit = () => {
    if (!editForm.name?.trim()) { showToast('Tên sản phẩm không được trống!', 'error'); return; }
    if (editModal.isNew) {
      addProduct(editForm);
      showToast('Đã thêm sản phẩm mới!', 'success');
    } else {
      updateProduct(editModal.goodsNo, editForm);
      showToast('Đã cập nhật sản phẩm!', 'success');
    }
    setEditModal(null);
  };

  // ── Delete ──
  const handleDelete = (goodsNo) => {
    deleteProduct(goodsNo);
    setDeleteConfirm(null);
    showToast('Đã xoá sản phẩm', 'info');
  };

  // ── Styles ──
  const s = {
    card: { backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' },
    agentBar: { background: 'linear-gradient(135deg, #FEF3C7 0%, #FFF7ED 100%)', border: '1.5px solid #F59E0B', borderRadius: '14px', padding: '20px', marginBottom: '24px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s' },
    btn: (bg, color) => ({ backgroundColor: bg, color, border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s' }),
    th: { padding: '14px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', fontWeight: 700, borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' },
    td: { padding: '12px 16px', borderBottom: '1px solid #F3F4F6', fontSize: '0.85rem', verticalAlign: 'middle' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '60px', zIndex: 9999 },
    modal: { backgroundColor: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '85vh', overflowY: 'auto', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    fieldLabel: { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' },
  };

  return (
    <div style={s.card}>

      {/* 🤖 ═══════════ BOT CÀO ĐỊNH KỲ 30 PHÚT & SWITCH BẬT/TẮT ═══════════ */}
      <div style={{
        background: botIsRunning ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
        border: botIsRunning ? '2px solid #10B981' : '1px solid #D1D5DB',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: botIsRunning ? '0 4px 14px rgba(16, 185, 129, 0.15)' : 'none'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: botIsRunning ? '#10B981' : '#6B7280',
              boxShadow: botIsRunning ? '0 0 10px #10B981' : 'none'
            }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: botIsRunning ? '#065F46' : '#374151', fontWeight: 800 }}>
              BOT CÀO DỮ LIỆU TỰ ĐỘNG CHU KỲ 30 PHÚT (OLIVE YOUNG BEST SELLERS)
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: botIsRunning ? '#047857' : '#6B7280' }}>
            {botIsRunning
              ? '🟢 Bot đang CHẠY TỰ ĐỘNG! Cứ hoàn thành 1 sản phẩm → Tự nghỉ 30 phút → Tự động cào tiếp & đẩy vào Bảng Chờ Duyệt.'
              : '🔴 Bot đang TẮT. Bật công tắc bên phải để kích hoạt vòng lặp cào dữ liệu tự động 30 phút/lần.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleTriggerBotInstant}
            disabled={loadingBotInstant}
            style={{
              backgroundColor: '#FFF',
              color: 'var(--purple-primary)',
              border: '1.5px solid var(--purple-primary)',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {loadingBotInstant ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{loadingBotInstant ? 'Đang Quét...' : 'Cho Bot Chạy 1 Lần Ngay'}</span>
          </button>

          {/* Toggle Switch */}
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px', backgroundColor: '#FFF', padding: '6px 14px', borderRadius: '30px', border: '1px solid #D1D5DB' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: botIsRunning ? '#10B981' : '#6B7280' }}>
              {botIsRunning ? 'BẬT BOT (ACTIVE)' : 'TẮT BOT'}
            </span>
            <input
              type="checkbox"
              checked={botIsRunning}
              onChange={(e) => {
                toggleBot(e.target.checked);
                if (showToast) showToast(e.target.checked ? '🟢 Đã BẬT Bot Cào Tự Động 30 phút/lần!' : '🔴 Đã TẮT Bot Cào Tự Động', e.target.checked ? 'success' : 'info');
              }}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10B981' }}
            />
          </label>
        </div>
      </div>

      {/* 📥 ═══════════ BẢNG SẢN PHẨM CHỜ ADMIN DUYỆT ═══════════ */}
      {pendingProducts && pendingProducts.length > 0 && (
        <div style={{ backgroundColor: '#FEF3C7', border: '2px dashed #F59E0B', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#92400E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} />
                BẢNG SẢN PHẨM CHỜ ADMIN DUYỆT ({pendingProducts.length} sản phẩm vừa cào)
              </h4>
              <span style={{ fontSize: '0.8rem', color: '#B45309' }}>Tích chọn sản phẩm cần duyệt hoặc bấm Đẩy Lên Website tức thì.</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* Nút Đẩy Sản Phẩm Được Chọn Lên Website */}
              {selectedPendingGoodsNo.length > 0 && (
                <button
                  onClick={() => {
                    approveSelectedPendingProducts(selectedPendingGoodsNo);
                    if (showToast) showToast(`🚀 Đã đẩy ${selectedPendingGoodsNo.length} sản phẩm được chọn lên Website thành công!`, 'success');
                    setSelectedPendingGoodsNo([]);
                  }}
                  style={{ backgroundColor: '#7A4B9E', color: '#FFF', border: 'none', padding: '8px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(122, 75, 158, 0.3)' }}
                >
                  <Sparkles size={16} /> 🚀 ĐẨY {selectedPendingGoodsNo.length} SẢN PHẨM ĐÃ CHỌN LÊN WEBSITE
                </button>
              )}

              <button
                onClick={() => {
                  approveAllPendingProducts();
                  if (showToast) showToast(`Đã duyệt tất cả ${pendingProducts.length} sản phẩm lên Website!`, 'success');
                }}
                style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '8px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} /> Duyệt Tất Cả ({pendingProducts.length})
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #FCD34D' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#FFFBEB', color: '#78350F', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '1.5px solid #FCD34D' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={pendingProducts.length > 0 && selectedPendingGoodsNo.length === pendingProducts.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPendingGoodsNo(pendingProducts.map(p => p.goodsNo));
                        else setSelectedPendingGoodsNo([]);
                      }}
                    />
                  </th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '50px' }}>STT</th>
                  <th style={{ padding: '10px 12px', width: '60px' }}>Ảnh</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tên Sản Phẩm Cào Về</th>
                  <th style={{ padding: '10px 12px', width: '110px' }}>Thương Hiệu</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', width: '100px' }}>Giá Won (₩)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', width: '110px' }}>VNĐ Ước Tính</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '150px' }}>Thao Tác Duyệt</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((p, idx) => {
                  const vndEst = Math.round((p.foreignPrice || 0) * krwRate);
                  const isChecked = selectedPendingGoodsNo.includes(p.goodsNo);
                  return (
                    <tr key={p.goodsNo || idx} style={{ borderBottom: '1px solid #FEF3C7', backgroundColor: isChecked ? '#FEFCE8' : 'transparent' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedPendingGoodsNo(prev =>
                              prev.includes(p.goodsNo) ? prev.filter(g => g !== p.goodsNo) : [...prev, p.goodsNo]
                            );
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#B45309' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <img src={p.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }} />
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#111827' }}>
                        {p.name}
                        <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 400 }}>Mã: {p.goodsNo}</div>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.brand}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--purple-primary)' }}>₩{(p.foreignPrice || 0).toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatVnd(vndEst)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              approvePendingProduct(p.goodsNo);
                              if (showToast) showToast(`🚀 Đã đẩy sản phẩm "${p.name}" lên Website!`, 'success');
                            }}
                            style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🚀 Đẩy Lên Web
                          </button>
                          <button
                            onClick={() => {
                              rejectPendingProduct(p.goodsNo);
                              if (showToast) showToast(`Đã từ chối sản phẩm khỏi hàng chờ`, 'info');
                            }}
                            style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✕ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={s.agentBar}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} />
          AGENT CÀO DỮ LIỆU TỰ ĐỘNG
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#78350F', margin: '0 0 12px 0' }}>
          Dán link sản phẩm Olive Young / Naver / Coupang → Agent tự bóc tách Tên, Thương hiệu, Ảnh HD, Giá Won ₩ và đẩy lên website.
        </p>

        <form onSubmit={handleScrape} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="url"
              style={{ ...s.input, paddingLeft: '36px' }}
              placeholder="Dán link sản phẩm Hàn Quốc vào đây..."
              value={quickLink}
              onChange={(e) => setQuickLink(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loadingScrape} style={s.btn('#D97706', '#FFF')}>
            {loadingScrape ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{loadingScrape ? 'ĐANG CÀO...' : 'KÍCH HOẠT AGENT'}</span>
          </button>
        </form>

        {/* Scraped Preview */}
        {scrapedPreview && (
          <div style={{ marginTop: '16px', backgroundColor: '#FFF', border: '2px solid #10B981', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={scrapedPreview.productImage}
              alt={scrapedPreview.name}
              style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              onError={(e) => { e.target.src = 'https://placehold.co/72x72/f3f4f6/9ca3af?text=No+Img'; }}
            />
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '12px' }}>{scrapedPreview.brand}</span>
                <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Mã: {scrapedPreview.goodsNo}</span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#111827', fontWeight: 700, lineHeight: 1.3 }}>{scrapedPreview.name}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--purple-primary)', fontWeight: 700 }}>
                ₩{scrapedPreview.foreignPrice?.toLocaleString()} ({formatVnd(Math.round(scrapedPreview.foreignPrice * krwRate))})
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setScrapedPreview(null); openEdit({ isNew: true, ...scrapedPreview }); }} style={s.btn('#3B82F6', '#FFF')}>
                <Edit3 size={14} /> Sửa trước
              </button>
              <button onClick={handlePushScraped} style={s.btn('#10B981', '#FFF')}>
                <CheckCircle2 size={14} /> Thêm ngay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#111827', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} />
            DANH MỤC SẢN PHẨM ({products.length})
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Tìm tên, brand, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...s.input, width: '200px', paddingLeft: '32px', fontSize: '0.82rem', padding: '8px 10px 8px 32px' }}
            />
          </div>
          {/* Category filter */}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            style={{ ...s.input, width: 'auto', fontSize: '0.82rem', padding: '8px 12px' }}
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {/* Add new */}
          <button onClick={handleAddNew} style={s.btn('var(--purple-primary)', '#FFF')}>
            <Plus size={16} /> Thêm SP mới
          </button>
        </div>
      </div>

      {/* ═══════════ PRODUCT TABLE ═══════════ */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...s.th, width: '44px', textAlign: 'center' }}>#</th>
              <th style={{ ...s.th, width: '60px' }}>Ảnh</th>
              <th style={{ ...s.th, width: '100px' }}>Mã SP</th>
              <th style={{ ...s.th, minWidth: '200px' }}>Tên sản phẩm</th>
              <th style={{ ...s.th, width: '120px' }}>Thương hiệu</th>
              <th style={{ ...s.th, width: '100px' }}>Danh mục</th>
              <th style={{ ...s.th, width: '100px', textAlign: 'right' }}>Giá ₩</th>
              <th style={{ ...s.th, width: '120px', textAlign: 'right' }}>Giá VNĐ</th>
              <th style={{ ...s.th, width: '60px', textAlign: 'center' }}>⭐</th>
              <th style={{ ...s.th, width: '110px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ ...s.td, textAlign: 'center', color: '#9CA3AF', padding: '40px' }}>Không tìm thấy sản phẩm nào.</td></tr>
            )}
            {filtered.map((prod, idx) => {
              const vnd = prod.explicitVndPrice || Math.round((prod.foreignPrice || 0) * krwRate);
              return (
                <tr key={prod.goodsNo || idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFF' : '#FAFAFA' }}>
                  <td style={{ ...s.td, textAlign: 'center', color: '#9CA3AF', fontWeight: 600, fontSize: '0.78rem' }}>{idx + 1}</td>
                  <td style={s.td}>
                    <img
                      src={prod.productImage || ''}
                      alt=""
                      style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                      onError={(e) => { e.target.src = 'https://placehold.co/44x44/f3f4f6/9ca3af?text=N/A'; }}
                    />
                  </td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--purple-primary)', fontWeight: 600 }}>{prod.goodsNo}</td>
                  <td style={{ ...s.td, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                    {prod.name}
                    {prod.productUrl && (
                      <a href={prod.productUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '6px', color: '#3B82F6', fontSize: '0.72rem' }}>🔗</a>
                    )}
                  </td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{prod.brand}</td>
                  <td style={s.td}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px',
                      backgroundColor: prod.category === 'skincare' ? '#EDE9FE' : prod.category === 'makeup' ? '#FCE7F3' : prod.category === 'health' ? '#D1FAE5' : '#FEF3C7',
                      color: prod.category === 'skincare' ? '#6D28D9' : prod.category === 'makeup' ? '#BE185D' : prod.category === 'health' ? '#047857' : '#92400E'
                    }}>
                      {categoryLabel(prod.category)}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: 'var(--purple-primary)' }}>₩{(prod.foreignPrice || 0).toLocaleString()}</td>
                  <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatVnd(vnd)}</td>
                  <td style={{ ...s.td, textAlign: 'center', fontSize: '0.82rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={12} fill="#F59E0B" stroke="#F59E0B" /> {prod.rating || '-'}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => openEdit(prod)} title="Sửa" style={{ background: 'none', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Edit3 size={13} /> Sửa
                      </button>
                      <button onClick={() => setDeleteConfirm(prod.goodsNo)} title="Xoá" style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══════════ DELETE CONFIRM ═══════════ */}
      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modal, maxWidth: '400px', marginTop: '120px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <Trash2 size={40} color="#EF4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>Xác nhận xoá sản phẩm?</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 20px 0' }}>Mã: <strong>{deleteConfirm}</strong>. Hành động này không thể hoàn tác.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={s.btn('#F3F4F6', '#374151')}>Huỷ</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={s.btn('#EF4444', '#FFF')}>Xoá vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ EDIT / ADD MODAL ═══════════ */}
      {editModal && (
        <div style={s.overlay} onClick={() => setEditModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                {editModal.isNew ? '➕ THÊM SẢN PHẨM MỚI' : `✏️ SỬA: ${editModal.goodsNo}`}
              </h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <X size={22} />
              </button>
            </div>

            {/* Image Preview */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed #D1D5DB', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                {editForm.productImage ? (
                  <img src={editForm.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <ImageIcon size={32} color="#D1D5DB" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.fieldLabel}>URL Ảnh sản phẩm</label>
                <input type="url" value={editForm.productImage || ''} onChange={e => handleEditChange('productImage', e.target.value)}
                  style={s.input} placeholder="https://..." />
                <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '4px' }}>Dán URL ảnh HD. Preview tự cập nhật.</div>
              </div>
            </div>

            {/* Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={s.fieldLabel}>Mã sản phẩm</label>
                <input value={editForm.goodsNo || ''} onChange={e => handleEditChange('goodsNo', e.target.value)}
                  style={s.input} placeholder="A000000..." />
              </div>
              <div>
                <label style={s.fieldLabel}>Thương hiệu</label>
                <input value={editForm.brand || ''} onChange={e => handleEditChange('brand', e.target.value)}
                  style={s.input} placeholder="VD: Torriden, Anua..." />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={s.fieldLabel}>Tên sản phẩm <span style={{ color: '#EF4444' }}>*</span></label>
              <input value={editForm.name || ''} onChange={e => handleEditChange('name', e.target.value)}
                style={s.input} placeholder="Tên đầy đủ sản phẩm..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={s.fieldLabel}>Danh mục</label>
                <select value={editForm.category || 'skincare'} onChange={e => handleEditChange('category', e.target.value)} style={s.input}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={s.fieldLabel}>Giá Won (₩)</label>
                <input type="number" value={editForm.foreignPrice || 0} onChange={e => handleEditChange('foreignPrice', e.target.value)}
                  style={{ ...s.input, textAlign: 'right', fontWeight: 700 }} />
              </div>
              <div>
                <label style={s.fieldLabel}>Đánh giá (⭐)</label>
                <input type="number" step="0.1" min="0" max="5" value={editForm.rating || 0} onChange={e => handleEditChange('rating', e.target.value)}
                  style={{ ...s.input, textAlign: 'right' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={s.fieldLabel}>Xuất xứ</label>
                <input value={editForm.origin || ''} onChange={e => handleEditChange('origin', e.target.value)} style={s.input} />
              </div>
              <div>
                <label style={s.fieldLabel}>Link sản phẩm gốc</label>
                <input type="url" value={editForm.productUrl || ''} onChange={e => handleEditChange('productUrl', e.target.value)}
                  style={s.input} placeholder="https://oliveyoung.co.kr/..." />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={s.fieldLabel}>Mô tả sản phẩm</label>
              <textarea value={editForm.description || ''} onChange={e => handleEditChange('description', e.target.value)}
                style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} placeholder="Mô tả chi tiết về công dụng..." />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={s.fieldLabel}>Hướng dẫn sử dụng</label>
              <textarea value={editForm.usage || ''} onChange={e => handleEditChange('usage', e.target.value)}
                style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} placeholder="Cách sử dụng..." />
            </div>

            {/* Price preview */}
            <div style={{ backgroundColor: '#F5F3FF', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Giá VNĐ (tỷ giá {krwRate}):</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
                {formatVnd(Math.round((editForm.foreignPrice || 0) * krwRate))}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditModal(null)} style={s.btn('#F3F4F6', '#374151')}>Huỷ</button>
              <button onClick={handleSaveEdit} style={s.btn('var(--purple-primary)', '#FFF')}>
                <Save size={16} /> {editModal.isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
