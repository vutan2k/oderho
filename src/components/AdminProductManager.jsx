import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { runAIScraperAgent } from '../services/aiScraperAgentEngine';
import {
  Plus, Trash2, X, Globe, Check, Edit3, Link2
} from 'lucide-react';

const CATEGORIES = [
  { value: 'skincare', label: 'Mỹ phẩm dưỡng da' },
  { value: 'makeup', label: 'Mỹ phẩm trang điểm' },
  { value: 'health', label: 'Thực phẩm chức năng' },
  { value: 'pharmacy', label: 'Thuốc / Dược phẩm' },
  { value: 'haircare', label: 'Chăm sóc tóc' },
  { value: 'bodycare', label: 'Chăm sóc cơ thể' },
];

export default function AdminProductManager() {
  const {
    products, addProduct, updateProduct, deleteProduct,
    pendingProducts, addPendingProduct, updatePendingProduct,
    approvePendingProduct, approveSelectedPendingProducts, approveAllPendingProducts, rejectPendingProduct
  } = useContext(AppContext);
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'pending'

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

  // --- Scraper State ---
  const [quickLink, setQuickLink] = useState('');
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [scrapeError, setScrapeError] = useState(null);

  // ----------------------------------------------------
  // INVENTORY LOGIC
  // ----------------------------------------------------
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = filterCat === 'all' || p.category === filterCat;
      const term = searchTerm.toLowerCase();
      const matchSearch = !term ||
        (p.name || '').toLowerCase().includes(term) ||
        (p.nameKr || '').toLowerCase().includes(term) ||
        (p.brand || '').toLowerCase().includes(term) ||
        (p.brandKr || '').toLowerCase().includes(term) ||
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
      name: '', nameKr: '', brand: '', brandKr: '', category: 'skincare', foreignPrice: 0,
      productImage: '', description: '', origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 5.0, reviewsCount: 0, usage: '', productUrl: '',
    };
    setEditForm(newProd);
    setEditModal({ isNew: true, ...newProd });
  };
  const openEdit = (prod) => {
    setEditForm({ ...prod });
    setEditModal({ isPending: false, ...prod });
  };
  const openEditPending = (prod) => {
    setEditForm({ ...prod });
    setEditModal({ isPending: true, ...prod });
  };
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: ['foreignPrice', 'rating', 'reviewsCount'].includes(field) ? (parseFloat(value) || 0) : value
    }));
  };
  const handleSaveEdit = () => {
    if (!editForm.name?.trim()) { 
      if (showToast) showToast('Tên sản phẩm không được trống!', 'error'); 
      return; 
    }
    if (editModal.isPending) {
      updatePendingProduct(editModal.goodsNo, editForm);
      if (showToast) showToast('Đã cập nhật thông tin hàng chờ!', 'success');
    } else if (editModal.isNew) { 
      addProduct(editForm); 
      if (showToast) showToast('Đã thêm sản phẩm!', 'success'); 
    } else { 
      updateProduct(editModal.goodsNo, editForm); 
      if (showToast) showToast('Đã cập nhật sản phẩm!', 'success'); 
    }
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
  // SCRAPER LOGIC
  // ----------------------------------------------------
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!quickLink.trim()) return;
    setLoadingScrape(true);
    setScrapeError(null);
    if (showToast) showToast('🤖 AI đang bóc tách dữ liệu từ link...', 'info');
    const res = await runAIScraperAgent(quickLink.trim());
    setLoadingScrape(false);
    if (res.success && res.product) {
      addPendingProduct(res.product);
      setQuickLink('');
      setActiveTab('pending');
      if (showToast) showToast(`🤖 AI đã bóc tách: "${res.product.name}"! Đã chuyển vào Hàng Chờ Duyệt.`, 'success');
    } else {
      setScrapeError({ message: res.error, url: quickLink.trim(), openPage: !!res.openProductPage });
      if (showToast) showToast(`Lỗi bóc tách: ${res.error}`, 'error');
    }
  };

  const handleOpenProductPage = () => {
    if (scrapeError?.url) window.open(scrapeError.url, '_blank');
  };

  // Chrome Extension Receive
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoFill = params.get('autoFill');
    if (autoFill) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(autoFill)));
        const extProduct = {
          goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
          name: decoded.name || '',
          nameKr: decoded.nameKr || '',
          brand: decoded.brand || 'Korea Brand',
          brandKr: decoded.brandKr || '',
          category: decoded.category || 'skincare',
          foreignPrice: decoded.price || 0,
          productImage: decoded.image || '',
          description: decoded.description || '',
          usage: decoded.usage || '',
          origin: 'Store Olive Young, Hàn Quốc',
          productUrl: decoded.url || '',
          reviewsCount: 150
        };
        addPendingProduct(extProduct);
        setActiveTab('pending');
        if (showToast) showToast('Đã nhận dữ liệu từ Extension! Đã thêm vào Chờ Duyệt.', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    }
  }, [addPendingProduct, showToast]);

  // ----------------------------------------------------
  // STYLES (Minimalist)
  // ----------------------------------------------------
  const styles = {
    container: { backgroundColor: '#F9FAFB', padding: '24px', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    card: { backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    topBanner: { backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' },
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
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 20px 0', color: '#111827' }}>Quản Trị Kho Sản Phẩm</h2>
      
      {/* ================= TOP SCRAPER BANNER ================= */}
      <div style={styles.topBanner}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={18} /> Bóc Tách Dữ Liệu Sản Phẩm Từ Link (Olive Young Korea)
        </div>
        <form onSubmit={handleScrape} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Link2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input 
              type="url" 
              required 
              placeholder="Dán đường dẫn sản phẩm Olive Young (https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=...)" 
              value={quickLink} 
              onChange={e => setQuickLink(e.target.value)} 
              style={{ ...styles.input, width: '100%', paddingLeft: '36px', backgroundColor: '#FFF' }} 
            />
          </div>
          <button type="submit" disabled={loadingScrape} style={{ ...styles.btnPrimary, whiteSpace: 'nowrap' }}>
            {loadingScrape ? 'Đang bóc...' : 'Bóc Tách & Đẩy Vào Chờ Duyệt'}
          </button>
        </form>
        {scrapeError && (
          <div style={{ marginTop: '12px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '0.85rem', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span>⚠️ {scrapeError.message}</span>
            {scrapeError.openPage && (
              <button onClick={handleOpenProductPage} style={{ ...styles.btnPrimary, background: '#2563EB', padding: '6px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Mở Trang Sản Phẩm
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div style={styles.tabList}>
        <button style={styles.tabBtn(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}>Kho Sản Phẩm ({products.length})</button>
        <button style={styles.tabBtn(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
          Chờ Duyệt {pendingProducts?.length > 0 && <span style={{ background: '#DC2626', color: '#FFF', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '6px' }}>{pendingProducts.length}</span>}
        </button>
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
                    <th style={{ ...styles.th, width: '110px' }}>Mã SP</th>
                    <th style={styles.th}>Tên sản phẩm (Việt / Hàn)</th>
                    <th style={{ ...styles.th, width: '130px' }}>Thương hiệu</th>
                    <th style={{ ...styles.th, width: '110px' }}>Phân loại</th>
                    <th style={{ ...styles.th, width: '110px', textAlign: 'right' }}>Giá (₩)</th>
                    <th style={{ ...styles.th, width: '90px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#6B7280', padding: '40px' }}>Không có dữ liệu</td></tr>
                  ) : (
                    filtered.map(prod => (
                      <tr key={prod.goodsNo} style={{ backgroundColor: selectedProducts.includes(prod.goodsNo) ? '#F3F4F6' : '#FFF' }}>
                        <td style={{ ...styles.td, textAlign: 'center' }}><input type="checkbox" checked={selectedProducts.includes(prod.goodsNo)} onChange={() => toggleSelectProduct(prod.goodsNo)} style={{ cursor: 'pointer' }} /></td>
                        <td style={styles.td}><img src={prod.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }} /></td>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{prod.goodsNo}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{prod.name}</div>
                          {prod.nameKr && <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>🇰🇷 {prod.nameKr}</div>}
                        </td>
                        <td style={styles.td}>
                          <div>{prod.brand}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {CATEGORIES.find(c => c.value === prod.category)?.label || prod.category || 'Skincare'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>₩{(prod.foreignPrice||0).toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button onClick={() => openEdit(prod)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '4px' }}>Sửa</button>
                          <button onClick={() => setDeleteConfirm(prod.goodsNo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px', marginLeft: '6px' }}>Xóa</button>
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
                Danh sách <strong>{pendingProducts?.length || 0}</strong> sản phẩm bóc tách từ link chờ Admin xem lại & chỉnh sửa trước khi Duyệt.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedPending.length > 0 && (
                  <>
                    <button onClick={handleDeleteSelectedPending} style={styles.btnDanger}><X size={16}/> Từ chối ({selectedPending.length})</button>
                    <button onClick={handleApproveSelected} style={{...styles.btnPrimary, backgroundColor: '#059669'}}><Check size={16}/> Duyệt lên Web ({selectedPending.length})</button>
                  </>
                )}
                {pendingProducts?.length > 0 && (
                  <button onClick={approveAllPendingProducts} style={styles.btnOutline}>Duyệt tất cả</button>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}><input type="checkbox" checked={pendingProducts?.length > 0 && selectedPending.length === pendingProducts.length} onChange={toggleSelectAllPending} style={{ cursor: 'pointer' }} /></th>
                    <th style={{ ...styles.th, width: '60px' }}>Ảnh</th>
                    <th style={{ ...styles.th, width: '110px' }}>Mã SP</th>
                    <th style={styles.th}>Tên sản phẩm (Việt / Hàn)</th>
                    <th style={{ ...styles.th, width: '130px' }}>Thương hiệu</th>
                    <th style={{ ...styles.th, width: '110px' }}>Phân loại</th>
                    <th style={{ ...styles.th, width: '110px', textAlign: 'right' }}>Giá (₩)</th>
                    <th style={{ ...styles.th, width: '200px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {!pendingProducts || pendingProducts.length === 0 ? (
                    <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#6B7280', padding: '40px' }}>Hàng chờ trống. Bạn hãy dán Link sản phẩm Olive Young ở thanh trên để bóc tách!</td></tr>
                  ) : (
                    pendingProducts.map(prod => (
                      <tr key={prod.goodsNo} style={{ backgroundColor: selectedPending.includes(prod.goodsNo) ? '#F3F4F6' : '#FFF' }}>
                        <td style={{ ...styles.td, textAlign: 'center' }}><input type="checkbox" checked={selectedPending.includes(prod.goodsNo)} onChange={() => toggleSelectPending(prod.goodsNo)} style={{ cursor: 'pointer' }} /></td>
                        <td style={styles.td}><img src={prod.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }} /></td>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{prod.goodsNo}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{prod.name}</div>
                          {prod.nameKr && <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>🇰🇷 {prod.nameKr}</div>}
                        </td>
                        <td style={styles.td}>
                          <div>{prod.brand}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {CATEGORIES.find(c => c.value === prod.category)?.label || prod.category || 'Skincare'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>₩{(prod.foreignPrice||0).toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button onClick={() => openEditPending(prod)} style={{ background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Edit3 size={12}/> Sửa
                          </button>
                          <button onClick={() => approvePendingProduct(prod.goodsNo)} style={{ background: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '6px' }}>
                            Duyệt
                          </button>
                          <button onClick={() => rejectPendingProduct(prod.goodsNo)} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                {editModal.isPending ? `Chỉnh sửa sản phẩm hàng chờ: ${editModal.goodsNo}` : (editModal.isNew ? 'Thêm Sản Phẩm Mới' : `Sửa SP: ${editModal.goodsNo}`)}
              </h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Mã sản phẩm</label>
                <input value={editForm.goodsNo || ''} onChange={e => handleEditChange('goodsNo', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Thương hiệu (Brand)</label>
                <input value={editForm.brand || ''} onChange={e => handleEditChange('brand', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Tên sản phẩm (Tiếng Việt) *</label>
              <input value={editForm.name || ''} onChange={e => handleEditChange('name', e.target.value)} style={{ ...styles.input, width: '100%' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Tên sản phẩm (Tiếng Hàn gốc)</label>
              <input value={editForm.nameKr || ''} onChange={e => handleEditChange('nameKr', e.target.value)} style={{ ...styles.input, width: '100%' }} />
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Mô tả sản phẩm</label>
              <textarea value={editForm.description || ''} onChange={e => handleEditChange('description', e.target.value)} style={{ ...styles.input, width: '100%', height: '70px', resize: 'vertical' }} />
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
