import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { scrapeProductMetadata } from '../services/productScraperService';
import {
  Plus, Trash2, X, Box,
  Play, Square, Globe, Check
} from 'lucide-react';

const CATEGORIES = [
  { value: 'skincare', label: 'Mỹ phẩm dưỡng da' },
  { value: 'makeup', label: 'Mỹ phẩm trang điểm' },
  { value: 'health', label: 'Thực phẩm chức năng' },
  { value: 'pharmacy', label: 'Thuốc / Dược phẩm' },
];

export default function AdminProductManager() {
  const {
    products, addProduct, updateProduct, deleteProduct,
    botIsRunning, toggleBot, pendingProducts,
    approvePendingProduct, approveSelectedPendingProducts, approveAllPendingProducts, rejectPendingProduct
  } = useContext(AppContext);
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'pending', 'bot'

  // --- Inventory State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // --- Edit Modal State ---
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- Pending State ---
  const [selectedPending, setSelectedPending] = useState([]);

  // --- Bot State ---
  const [quickLink, setQuickLink] = useState('');
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingBotInstant, setLoadingBotInstant] = useState(false);
  const [scrapedPreview, setScrapedPreview] = useState(null);

  // ----------------------------------------------------
  // INVENTORY LOGIC
  // ----------------------------------------------------
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

  const toggleSelectProduct = (goodsNo) => {
    setSelectedProducts(prev => 
      prev.includes(goodsNo) ? prev.filter(id => id !== goodsNo) : [...prev, goodsNo]
    );
  };
  const toggleSelectAll = () => {
    if (selectedProducts.length === filtered.length && filtered.length > 0) setSelectedProducts([]);
    else setSelectedProducts(filtered.map(p => p.goodsNo));
  };
  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Xóa vĩnh viễn ${selectedProducts.length} sản phẩm?`)) {
      selectedProducts.forEach(id => deleteProduct(id));
      setSelectedProducts([]);
      if (showToast) showToast(`Đã xóa ${selectedProducts.length} sản phẩm`, 'success');
    }
  };
  const handleDelete = (goodsNo) => {
    deleteProduct(goodsNo);
    setDeleteConfirm(null);
    if (showToast) showToast('Đã xoá sản phẩm', 'info');
  };

  // --- Edit/Add Logic ---
  const handleAddNew = () => {
    const newProd = {
      goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '', brand: '', category: 'skincare', foreignPrice: 0,
      productImage: '', description: '', origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 5.0, reviewsCount: 0, usage: '', productUrl: '',
    };
    setEditForm(newProd);
    setEditModal({ isNew: true, ...newProd });
  };
  const openEdit = (prod) => {
    setEditForm({ ...prod });
    setEditModal(prod);
  };
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: ['foreignPrice', 'rating', 'reviewsCount'].includes(field) ? (parseFloat(value) || 0) : value
    }));
  };
  const handleSaveEdit = () => {
    if (!editForm.name?.trim()) { showToast('Tên sản phẩm không được trống!', 'error'); return; }
    if (editModal.isNew) { addProduct(editForm); showToast('Đã thêm sản phẩm!', 'success'); } 
    else { updateProduct(editModal.goodsNo, editForm); showToast('Đã cập nhật!', 'success'); }
    setEditModal(null);
  };

  // ----------------------------------------------------
  // PENDING LOGIC
  // ----------------------------------------------------
  const toggleSelectPending = (goodsNo) => {
    setSelectedPending(prev => 
      prev.includes(goodsNo) ? prev.filter(id => id !== goodsNo) : [...prev, goodsNo]
    );
  };
  const toggleSelectAllPending = () => {
    if (selectedPending.length === pendingProducts.length && pendingProducts.length > 0) setSelectedPending([]);
    else setSelectedPending(pendingProducts.map(p => p.goodsNo));
  };
  const handleApproveSelected = () => {
    if (selectedPending.length === 0) return;
    if (window.confirm(`Duyệt ${selectedPending.length} sản phẩm lên Website?`)) {
      approveSelectedPendingProducts(selectedPending);
      setSelectedPending([]);
      if (showToast) showToast('Đã duyệt sản phẩm thành công!', 'success');
    }
  };
  const handleDeleteSelectedPending = () => {
    if (selectedPending.length === 0) return;
    if (window.confirm(`Xóa ${selectedPending.length} sản phẩm chờ?`)) {
      selectedPending.forEach(id => rejectPendingProduct(id));
      setSelectedPending([]);
      if (showToast) showToast('Đã xóa danh sách chờ!', 'success');
    }
  };

  // ----------------------------------------------------
  // BOT & SCRAPER LOGIC
  // ----------------------------------------------------
  const handleTriggerBotInstant = async () => {
    setLoadingBotInstant(true);
    if (showToast) showToast('Bot đang quét...', 'info');
    const { executeSingleBotRun } = await import('../services/autoScraperBotService');
    const res = await executeSingleBotRun(products, pendingProducts);
    setLoadingBotInstant(false);
    if (res.success && res.product) {
      approvePendingProduct(res.product.goodsNo);
      if (showToast) showToast(`Cào thành công: ${res.product.name}`, 'success');
    } else {
      if (showToast) showToast(`Lỗi: ${res.error}`, 'error');
    }
  };
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!quickLink.trim()) return;
    setLoadingScrape(true);
    setScrapedPreview(null);
    const res = await scrapeProductMetadata(quickLink.trim());
    setLoadingScrape(false);
    if (res.success && res.product) setScrapedPreview(res.product);
    else showToast(`Lỗi: ${res.error}`, 'error');
  };
  const handlePushScraped = () => {
    if (!scrapedPreview) return;
    addProduct(scrapedPreview);
    setScrapedPreview(null);
    setQuickLink('');
    showToast('Đã thêm!', 'success');
  };

  // Chrome Extension Receive
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoFill = params.get('autoFill');
    if (autoFill) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(autoFill)));
        setScrapedPreview({
          goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
          name: decoded.name || '', brand: decoded.brand || 'Korea Brand',
          category: decoded.category || 'skincare', foreignPrice: decoded.price || 0,
          productImage: decoded.image || '', description: decoded.description || '',
          usage: decoded.usage || '', origin: 'Store Olive Young, Hàn Quốc',
          productUrl: decoded.url || '', reviewsCount: 150
        });
        setActiveTab('bot');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.warn("Lỗi giải mã autoFill url param:", err);
      }
    }
  }, []);

  // ----------------------------------------------------
  // STYLES (Minimalist)
  // ----------------------------------------------------
  const styles = {
    container: { backgroundColor: '#F9FAFB', padding: '24px', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    card: { backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    tabList: { display: 'flex', gap: '16px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' },
    tabBtn: (active) => ({ padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: active ? '#2563EB' : '#6B7280', borderBottom: active ? '2px solid #2563EB' : '2px solid transparent' }),
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
    th: { padding: '12px 16px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#4B5563', fontWeight: 600, textAlign: 'left' },
    td: { padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', verticalAlign: 'middle' },
    input: { padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', outline: 'none', fontSize: '0.85rem' },
    btnPrimary: { backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' },
    btnDanger: { backgroundColor: '#DC2626', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' },
    btnOutline: { backgroundColor: '#FFF', color: '#374151', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' },
  };

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 24px 0', color: '#111827' }}>Quản Trị Kho Sản Phẩm</h2>
      
      <div style={styles.tabList}>
        <button style={styles.tabBtn(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}>Kho Sản Phẩm ({products.length})</button>
        <button style={styles.tabBtn(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
          Chờ Duyệt {pendingProducts?.length > 0 && <span style={{ background: '#DC2626', color: '#FFF', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '6px' }}>{pendingProducts.length}</span>}
        </button>
        <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>Cấu hình Bot & Crawler</button>
      </div>

      <div style={styles.card}>
        {/* ================= TAB 1: INVENTORY ================= */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.input, width: '250px' }} />
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={styles.input}>
                  <option value="all">Tất cả danh mục</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedProducts.length > 0 && (
                  <button onClick={handleDeleteSelected} style={styles.btnDanger}><Trash2 size={16}/> Xóa {selectedProducts.length} mục</button>
                )}
                <button onClick={handleAddNew} style={styles.btnPrimary}><Plus size={16}/> Thêm mới</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}><input type="checkbox" checked={filtered.length > 0 && selectedProducts.length === filtered.length} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} /></th>
                    <th style={{ ...styles.th, width: '60px' }}>Ảnh</th>
                    <th style={{ ...styles.th, width: '120px' }}>Mã SP</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={{ ...styles.th, width: '150px' }}>Thương hiệu</th>
                    <th style={{ ...styles.th, width: '150px', textAlign: 'right' }}>Giá (₩)</th>
                    <th style={{ ...styles.th, width: '100px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#6B7280', padding: '40px' }}>Không có dữ liệu</td></tr>
                  ) : (
                    filtered.map(prod => (
                      <tr key={prod.goodsNo} style={{ backgroundColor: selectedProducts.includes(prod.goodsNo) ? '#F3F4F6' : '#FFF' }}>
                        <td style={{ ...styles.td, textAlign: 'center' }}><input type="checkbox" checked={selectedProducts.includes(prod.goodsNo)} onChange={() => toggleSelectProduct(prod.goodsNo)} style={{ cursor: 'pointer' }} /></td>
                        <td style={styles.td}><img src={prod.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }} /></td>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{prod.goodsNo}</td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{prod.name}</td>
                        <td style={styles.td}>{prod.brand}</td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>₩{(prod.foreignPrice||0).toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button onClick={() => openEdit(prod)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '4px' }}>Sửa</button>
                          <button onClick={() => setDeleteConfirm(prod.goodsNo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px', marginLeft: '8px' }}>Xóa</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PENDING ================= */}
        {activeTab === 'pending' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.9rem', color: '#4B5563', paddingTop: '8px' }}>
                Đang có <strong>{pendingProducts?.length || 0}</strong> sản phẩm chờ duyệt từ Bot.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedPending.length > 0 && (
                  <>
                    <button onClick={handleDeleteSelectedPending} style={styles.btnDanger}><X size={16}/> Từ chối ({selectedPending.length})</button>
                    <button onClick={handleApproveSelected} style={{...styles.btnPrimary, backgroundColor: '#059669'}}><Check size={16}/> Duyệt lên Web ({selectedPending.length})</button>
                  </>
                )}
                <button onClick={approveAllPendingProducts} style={styles.btnOutline}>Duyệt tất cả</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}><input type="checkbox" checked={pendingProducts?.length > 0 && selectedPending.length === pendingProducts.length} onChange={toggleSelectAllPending} style={{ cursor: 'pointer' }} /></th>
                    <th style={{ ...styles.th, width: '60px' }}>Ảnh</th>
                    <th style={{ ...styles.th, width: '120px' }}>Mã SP</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={{ ...styles.th, width: '150px' }}>Thương hiệu</th>
                    <th style={{ ...styles.th, width: '150px', textAlign: 'right' }}>Giá (₩)</th>
                    <th style={{ ...styles.th, width: '180px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {!pendingProducts || pendingProducts.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#6B7280', padding: '40px' }}>Hàng chờ trống</td></tr>
                  ) : (
                    pendingProducts.map(prod => (
                      <tr key={prod.goodsNo} style={{ backgroundColor: selectedPending.includes(prod.goodsNo) ? '#F3F4F6' : '#FFF' }}>
                        <td style={{ ...styles.td, textAlign: 'center' }}><input type="checkbox" checked={selectedPending.includes(prod.goodsNo)} onChange={() => toggleSelectPending(prod.goodsNo)} style={{ cursor: 'pointer' }} /></td>
                        <td style={styles.td}><img src={prod.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }} /></td>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{prod.goodsNo}</td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{prod.name}</td>
                        <td style={styles.td}>{prod.brand}</td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>₩{(prod.foreignPrice||0).toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button onClick={() => approvePendingProduct(prod.goodsNo)} style={{ background: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '8px' }}>Duyệt</button>
                          <button onClick={() => rejectPendingProduct(prod.goodsNo)} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Xóa</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BOT & SCRAPER ================= */}
        {activeTab === 'bot' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Bot Auto */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box size={20} color="#2563EB" /> Auto Crawler Bot
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '20px', lineHeight: 1.5 }}>
                  Hệ thống tự động quét dữ liệu từ Olive Young Best Sellers mỗi 30 phút. Sản phẩm cào về sẽ được đưa vào <b>Hàng Chờ Duyệt</b>.
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={() => {
                      toggleBot(!botIsRunning);
                      if (showToast) showToast(!botIsRunning ? 'Đã bật Bot' : 'Đã tắt Bot', !botIsRunning ? 'success' : 'info');
                    }} 
                    style={botIsRunning ? styles.btnDanger : styles.btnPrimary}>
                    {botIsRunning ? <Square size={16}/> : <Play size={16}/>} 
                    {botIsRunning ? 'Dừng Bot' : 'Khởi động Bot Tự Động'}
                  </button>
                  <button onClick={handleTriggerBotInstant} disabled={loadingBotInstant} style={styles.btnOutline}>
                    {loadingBotInstant ? 'Đang chạy...' : 'Chạy thử 1 lần ngay'}
                  </button>
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.85rem', color: botIsRunning ? '#059669' : '#6B7280', fontWeight: 500 }}>
                  Trạng thái: {botIsRunning ? 'Đang hoạt động (Chu kỳ 30p)' : 'Đã tắt'}
                </div>
              </div>

              {/* Manual Scrape */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={20} color="#2563EB" /> Lấy dữ liệu bằng Link
                </h3>
                <form onSubmit={handleScrape} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input type="url" required placeholder="Dán link sản phẩm (Olive Young/Naver...)" value={quickLink} onChange={e => setQuickLink(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                  <button type="submit" disabled={loadingScrape} style={styles.btnPrimary}>
                    {loadingScrape ? 'Đang bóc...' : 'Lấy dữ liệu'}
                  </button>
                </form>

                {scrapedPreview && (
                  <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <img src={scrapedPreview.productImage} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D1D5DB' }} />
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#111827' }}>{scrapedPreview.name}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '4px' }}>Thương hiệu: <b>{scrapedPreview.brand}</b></div>
                        <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>Giá gốc: <b>₩{(scrapedPreview.foreignPrice||0).toLocaleString()}</b></div>
                      </div>
                    </div>
                    <button onClick={handlePushScraped} style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }}>Đẩy lên Website</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem' }}>Xác nhận xóa</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#4B5563' }}>Bạn có chắc muốn xóa mã <b>{deleteConfirm}</b> vĩnh viễn?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={styles.btnOutline}>Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={styles.btnDanger}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '8px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{editModal.isNew ? 'Thêm Sản Phẩm Mới' : `Sửa SP: ${editModal.goodsNo}`}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Mã sản phẩm</label>
                <input value={editForm.goodsNo || ''} onChange={e => handleEditChange('goodsNo', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Thương hiệu</label>
                <input value={editForm.brand || ''} onChange={e => handleEditChange('brand', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Tên sản phẩm *</label>
              <input value={editForm.name || ''} onChange={e => handleEditChange('name', e.target.value)} style={{ ...styles.input, width: '100%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Danh mục</label>
                <select value={editForm.category || 'skincare'} onChange={e => handleEditChange('category', e.target.value)} style={{ ...styles.input, width: '100%' }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Giá Won (₩)</label>
                <input type="number" value={editForm.foreignPrice || 0} onChange={e => handleEditChange('foreignPrice', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Ảnh sản phẩm (URL)</label>
              <input value={editForm.productImage || ''} onChange={e => handleEditChange('productImage', e.target.value)} style={{ ...styles.input, width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setEditModal(null)} style={styles.btnOutline}>Hủy</button>
              <button onClick={handleSaveEdit} style={styles.btnPrimary}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
