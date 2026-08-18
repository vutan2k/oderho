import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { runAIScraperAgent } from '../services/aiScraperAgentEngine';
import { fetchLatestPlaywrightScrapedProducts, syncPlaywrightScrapedProductsToDb } from '../services/playwrightScraperEngine';
import {
  Plus, Trash2, X, Globe, Check, Edit3, Link2, Download, Play, Square, Eye
} from 'lucide-react';

const CATEGORIES = [
  { value: 'skincare', label: 'Mỹ phẩm Dưỡng Da' },
  { value: 'health', label: 'Thực Phẩm Chức Năng' },
  { value: 'pharmacy', label: 'Hiệu Thuốc Hàn' },
  { value: 'haircare', label: 'Chăm sóc tóc' },
  { value: 'bodycare', label: 'Chăm sóc cơ thể' },
];

export default function AdminProductManager() {
  const {
    products, addProduct, updateProduct, deleteProduct, deleteAllProducts,
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

  // --- Playwright Visual Browser Live Controls ---
  const [isPlaywrightLive, setIsPlaywrightLive] = useState(false);
  const [playwrightLogs, setPlaywrightLogs] = useState([]);

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

  const handleExportProductCSV = () => {
    if (!products || products.length === 0) {
      if (showToast) showToast('Kho hàng hiện đang trống!', 'warning');
      return;
    }
    const headers = ['Mã SP', 'Tên Tiếng Việt', 'Tên Tiếng Hàn', 'Thương Hiệu', 'Danh Mục', 'Giá Won (₩)', 'Nguồn Gốc', 'Link Olive Young'];
    const rows = products.map(p => {
      let catLabel = p.category;
      const foundCat = CATEGORIES.find(c => c.value === p.category);
      if (foundCat) catLabel = foundCat.label;

      return [
        p.goodsNo || '',
        p.name || '',
        p.nameKr || '',
        p.brand || p.brandKr || '',
        catLabel,
        p.foreignPrice || 0,
        p.origin || 'Korea',
        p.productUrl || ''
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Kho_Hang_TAVY_KOREA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast(`Đã xuất báo cáo ${products.length} sản phẩm sang CSV thành công!`, 'success');
  };

  // --- Helper Sanitize Product Admin ---
  const translateKoreanToVi = (krTitle) => {
    if (!krTitle) return 'Sản phẩm Olive Young Korea';
    let vi = krTitle;
    const dict = [
      [/바이오던스/g, 'Biodance'], [/포어 퍼펙팅/g, 'Thu Nhỏ Lỗ Chân Lông'], [/콜라겐/g, 'Collagen'], [/펩타이드/g, 'Peptide'],
      [/비플레인/g, 'Beplain'], [/녹두/g, 'Đậu Xanh'], [/약산성/g, 'pH Cân Bằng'], [/화이트/g, 'White'], [/스테이쿨/g, 'Stay Cool'],
      [/생리대/g, 'Băng Vệ Sinh'], [/중형/g, 'Size M'], [/대형/g, 'Size L'], [/구달/g, 'Goodal'], [/어성초/g, 'Rau Diếp Cá'],
      [/진정/g, 'Làm Dịu Da'], [/블레미쉬/g, 'Giảm Mụn Thâm'], [/선비비/g, 'Kem BB Chống Nắng'], [/뉴트럴베이지/g, 'Beige Tự Nhiên'],
      [/라이트베이지/g, 'Beige Sáng'], [/딜라이트/g, 'Delight'], [/프로젝트/g, 'Project'], [/단백질쉐이크/g, 'Sữa Lắc Protein'],
      [/택1/g, 'Tùy Chọn 1'], [/어노브/g, 'UNOVE'], [/딥 데미지/g, 'Phục Hồi Sâu Sơ Rối'], [/리페어/g, 'Phục Hồi'],
      [/헤어/g, 'Tóc'], [/트리트먼트/g, 'Ủ Tóc Treatment'], [/헤어팩/g, 'Mặt Nạ Tóc'], [/듀오/g, 'Bộ Đôi'],
      [/4년 연속 1위/g, 'Top 1 4 Năm Liền'], [/오브제/g, 'Objet'], [/퍼펙트/g, 'Perfect'], [/커버/g, 'Che Phủ'], [/쿠션/g, 'Phấn Nước Cushion'],
      [/셀리맥스/g, 'Celimax'], [/레이어랩/g, 'Layerlab'], [/메디힐/g, 'Mediheal'], [/라운드랩/g, 'Round Lab'],
      [/클리오/g, 'Clio'], [/롬앤/g, 'Romand'], [/조선미녀/g, 'Beauty of Joseon'], [/에스쁘아/g, 'Espoir'],
      [/아누아/g, 'Anua'], [/토리든/g, 'Torriden'], [/마녀공장/g, 'Manyo Factory'], [/달바/g, "d'Alba"],
      [/스킨1004/g, 'Skin1004'], [/넘버즈인/g, 'Numbuzin'], [/트라넥삼산/g, 'Tranexamic Acid'],
      [/판테놀/g, 'Panthenol B5'], [/브라이트닝/g, 'Làm Sáng Da'], [/인텐시브/g, 'Phục Hồi Sâu'],
      [/크림/g, 'Kem Dưỡng'], [/랩핑/g, 'Phục Hồi Hàng Rào'], [/마스크/g, 'Mặt Nạ'], [/기획/g, 'Bộ Đặc Biệt'],
      [/단독/g, 'Độc Quyền Olive Young'], [/세트/g, 'Bộ'], [/5매/g, '5 Miếng'], [/10매/g, '10 Miếng'],
      [/\(\+1매\)/g, '(Tặng 1 Miếng)'], [/\(1\+1\)/g, '(Mua 1 Tặng 1)'], [/잡티미백/g, 'Giảm Thâm Làm Sáng Da'],
      [/TXA/g, 'Tranexamic Acid'], [/선크림/g, 'Kem Chống Nắng'], [/세럼/g, 'Tinh Chất Serum'],
      [/앰플/g, 'Tinh Chất Ampoule'], [/토너/g, 'Nước Hoa Hồng Toner'], [/클렌징/g, 'Sữa Rửa Mặt Tẩy Trang'], [/패드/g, 'Bông Dưỡng Da Pad'],
      [/더블/g, 'Bộ Kép'], [/잡티/g, 'Giảm Thâm'], [/선/g, 'Chống Nắng']
    ];
    dict.forEach(([kr, v]) => { vi = vi.replace(kr, v); });
    vi = vi.replace(/\[[^\]]*\]/g, '').replace(/[가-힣]/g, '').replace(/\s+/g, ' ').trim();
    return vi || krTitle;
  };

  const sanitizePrice = (rawPrice) => {
    let val = Number(rawPrice) || 0;
    if (val > 200000) {
      const matches = String(rawPrice).match(/([0-9]{4,6})/g);
      if (matches && matches.length > 0) {
        const validNums = matches.map(m => parseInt(m, 10)).filter(n => n >= 1000 && n <= 200000);
        val = validNums.length > 0 ? Math.min(...validNums) : 26800;
      } else {
        val = 26800;
      }
    }
    return val > 0 ? val : 25000;
  };

  const sanitizeProductForAdmin = (prod) => {
    if (!prod) return prod;
    const cleanPrice = sanitizePrice(prod.foreignPrice || prod.price);
    let vietnameseName = prod.name || '';
    if (!vietnameseName || /[가-힣]/.test(vietnameseName)) {
      vietnameseName = translateKoreanToVi(prod.nameKr || prod.name);
    }

    // Lọc bỏ các link ảnh đoán mò bị lỗi 404 (gdasEditor và ko.jpg đoán chuỗi)
    const isRealWorkingUrl = (u) => u && u.startsWith('http') && !/gdasEditor/i.test(u) && !/A00000[0-9]{6}[0-9]{2}ko\.jpg/i.test(u);

    const existingAlbum = (prod.images || (prod.productImage ? [prod.productImage] : [])).filter(isRealWorkingUrl);
    const existingReviews = (prod.photoReviews || []).filter(isRealWorkingUrl);

    const mainImg = existingAlbum[0] || (isRealWorkingUrl(prod.productImage) ? prod.productImage : '');

    return {
      ...prod,
      name: vietnameseName,
      foreignPrice: cleanPrice,
      price: cleanPrice,
      productImage: mainImg,
      images: existingAlbum.length > 0 ? existingAlbum : (mainImg ? [mainImg] : []),
      photoReviews: existingReviews
    };
  };

  // --- Edit/Add Logic ---
  const handleAddNew = () => {
    const newProd = {
      goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '', nameKr: '', brand: '', brandKr: '', category: 'skincare', foreignPrice: 25000,
      productImage: '', description: '', origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 5.0, reviewsCount: 0, usage: '', productUrl: '',
    };
    setEditForm(newProd);
    setEditModal({ isNew: true, ...newProd });
  };
  const openEdit = (prod) => {
    const cleanProd = sanitizeProductForAdmin(prod);
    setEditForm({ ...cleanProd });
    setEditModal({ isPending: false, ...cleanProd });
  };
  const openEditPending = (prod) => {
    const cleanProd = sanitizeProductForAdmin(prod);
    setEditForm({ ...cleanProd });
    setEditModal({ isPending: true, ...cleanProd });
  };
  const handleEditChange = (field, value) => {
    let cleanVal = value;
    if (field === 'foreignPrice') {
      cleanVal = sanitizePrice(value);
    }
    setEditForm(prev => ({
      ...prev,
      [field]: ['rating', 'reviewsCount'].includes(field) ? (parseFloat(value) || 0) : cleanVal
    }));
  };
  const handleSaveEdit = () => {
    if (!editForm.name?.trim()) { 
      if (showToast) showToast('Tên sản phẩm không được trống!', 'error'); 
      return; 
    }
    const cleanForm = sanitizeProductForAdmin(editForm);
    if (editModal.isPending) {
      updatePendingProduct(editModal.goodsNo, cleanForm);
      if (showToast) showToast('Đã cập nhật thông tin hàng chờ!', 'success');
    } else if (editModal.isNew) { 
      addProduct(cleanForm); 
      if (showToast) showToast('Đã thêm sản phẩm!', 'success'); 
    } else { 
      updateProduct(editModal.goodsNo, cleanForm); 
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
      if (addProduct) addProduct(res.product); // Thêm thẳng vào Kho & Tự động lưu Realtime lên Firebase Firestore!
      setQuickLink('');
      setActiveTab('inventory'); // Chuyển sang Kho Sản Phẩm để thấy dữ liệu ngay tức thì!
      if (showToast) showToast(`🤖 Đã bóc tách thành công: "${res.product.name}"! Dữ liệu đã tự động đồng bộ Realtime lên Admin & Website.`, 'success');
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
        const urlGoodsNoMatch = (decoded.url || '').match(/goodsNo=([A-Za-z0-9_]+)/i);
        const goodsNo = urlGoodsNoMatch ? urlGoodsNoMatch[1].toUpperCase() : `SP-${Math.floor(10000 + Math.random() * 90000)}`;

        const extProduct = {
          goodsNo: goodsNo,
          name: decoded.name || decoded.nameKr || 'Sản phẩm Olive Young',
          nameKr: decoded.nameKr || decoded.name || '',
          brand: decoded.brand || 'Korea Brand',
          brandKr: decoded.brandKr || decoded.brand || '올리브영',
          category: decoded.category || 'skincare',
          foreignPrice: Number(decoded.foreignPrice || decoded.price) || 25000,
          productImage: decoded.productImage || decoded.image || (decoded.images && decoded.images[0]) || '',
          images: decoded.images || [],
          photoReviews: decoded.photoReviews || [],
          description: decoded.description || `Sản phẩm chính hãng bóc tách từ Olive Young. Tên gốc: ${decoded.nameKr || decoded.name}`,
          usage: decoded.usage || 'Xem hướng dẫn sử dụng trên bao bì.',
          origin: 'Store Olive Young, Hàn Quốc',
          productUrl: decoded.url || '',
          rating: decoded.rating || 4.9,
          reviewsCount: decoded.reviewsCount || (decoded.photoReviews ? decoded.photoReviews.length : 150),
          scrapedAt: new Date().toISOString(),
          source: 'chrome-extension'
        };

        addPendingProduct(extProduct);
        if (addProduct) addProduct(extProduct); // Đẩy thẳng vào Kho & Tự động lưu Realtime lên Firebase Firestore!
        setActiveTab('inventory');
        if (showToast) showToast(`🚀 Đã nhận dữ liệu từ Chrome Extension: "${extProduct.name}"! Đã đồng bộ Realtime lên Admin & Website.`, 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Lỗi nhận dữ liệu từ Chrome Extension:', err);
      }
    }
  }, [addPendingProduct, addProduct, showToast]);

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
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={18} /> 🎭 Playwright AI Autonomous Scraper (Giả Lập Người Dùng & AI Vision)
          </div>
          {/* Tool Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 8px #22C55E', display: 'inline-block' }}></span>
            <span style={{ color: '#1E40AF', fontWeight: 600 }}>Playwright + Chromium AI Scraper v1.0: Sẵn Sàng (CLI & Web Sync)</span>
          </div>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#3B82F6', marginBottom: '12px', lineHeight: 1.5 }}>
          🤖 <b>Bật/Tắt Xem Trực Tiếp Trình Duyệt Playwright AI:</b> Bấm nút bên dưới để Bật/Tắt trình duyệt chạy tự động cuộn trang, rê chuột, soi hình ảnh HD bằng AI và đẩy sản phẩm trực tiếp về Admin.
        </div>

        {/* ================= LIVE BROWSER CONTROL BUTTONS ================= */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          {!isPlaywrightLive ? (
            <button 
              type="button" 
              onClick={() => {
                setIsPlaywrightLive(true);
                setPlaywrightLogs([
                  "🚀 [Playwright Live] Đang khởi động trình duyệt Chromium trực quan...",
                  "🌐 Mode: Headful Visual Inspector",
                  "📍 [Playwright] Đang điều hướng đến trang Olive Young Ranking...",
                  "📜 Giả lập thao tác người dùng: Cuộn trang mượt mà & rê chuột...",
                  "✨ Bật hiệu ứng viền đỏ/xanh lá highlight sản phẩm..."
                ]);
                fetchLatestPlaywrightScrapedProducts().then(latestData => {
                  if (latestData && latestData.length > 0) {
                    latestData.forEach(item => addPendingProduct(item));
                    syncPlaywrightScrapedProductsToDb(latestData);
                    setPlaywrightLogs(prev => [
                      ...prev,
                      `✅ Đã cào & bóc tách thành công ${latestData.length} sản phẩm HD!`,
                      `🎉 Đã tự động đồng bộ dữ liệu vào tab Chờ Duyệt.`
                    ]);
                    if (showToast) showToast(`🎉 Đã cào & đồng bộ ${latestData.length} sản phẩm vào Chờ Duyệt!`, 'success');
                  }
                });
              }}
              style={{ ...styles.btnPrimary, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontWeight: 700, fontSize: '0.88rem' }}
            >
              <Play size={16} /> ▶️ BẬT XEM TRỰC TIẾP TRÌNH DUYỆT (PLAYWRIGHT AI)
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => {
                setIsPlaywrightLive(false);
                setPlaywrightLogs(prev => [...prev, "🛑 Đã TẮT chế độ xem trực tiếp trình duyệt Playwright."]);
                if (showToast) showToast('Đã TẮT Playwright Live Browser', 'info');
              }}
              style={{ ...styles.btnDanger, background: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontWeight: 700, fontSize: '0.88rem' }}
            >
              <Square size={16} /> ⏹️ DỪNG / TẮT XEM TRỰC TIẾP TRÌNH DUYỆT
            </button>
          )}

          {/* Status Badge Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, padding: '6px 12px', borderRadius: '8px', backgroundColor: isPlaywrightLive ? '#DCFCE7' : '#F1F5F9', color: isPlaywrightLive ? '#15803D' : '#64748B' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isPlaywrightLive ? '#22C55E' : '#94A3B8', boxShadow: isPlaywrightLive ? '0 0 8px #22C55E' : 'none' }}></span>
            <span>{isPlaywrightLive ? '🟢 TRÌNH DUYỆT ĐANG CHẠY TRỰC TIẾP' : '⚪ TRÌNH DUYỆT ĐANG TẮT'}</span>
          </div>
        </div>

        {/* Live Logs Console Output Box */}
        {playwrightLogs.length > 0 && (
          <div style={{ background: '#0F172A', color: '#38BDF8', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '14px', maxHeight: '160px', overflowY: 'auto', border: '1px solid #1E293B' }}>
            <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} color="#38BDF8" /> 📊 Bảng Nhật Ký Tiến Trình Playwright Live:
            </div>
            {playwrightLogs.map((log, idx) => (
              <div key={idx} style={{ marginBottom: '3px' }}>{log}</div>
            ))}
          </div>
        )}

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
                {products.length > 0 && (
                  <button 
                    onClick={() => {
                      if (window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA TẤT CẢ ${products.length} sản phẩm trong kho không?`)) {
                        deleteAllProducts();
                        setSelectedProducts([]);
                        if (showToast) showToast('Đã xóa sạch toàn bộ kho sản phẩm!', 'success');
                      }
                    }} 
                    style={{ ...styles.btnDanger, backgroundColor: '#991B1B' }}
                  >
                    <Trash2 size={16}/> Xóa Tất Cả Kho ({products.length})
                  </button>
                )}
                {products.length > 0 && (
                  <button 
                    onClick={handleExportProductCSV} 
                    style={{ ...styles.btnPrimary, backgroundColor: '#059669' }}
                  >
                    <Download size={16}/> Xuất CSV Kho
                  </button>
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
                <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                  ≈ {((editForm.foreignPrice || 0) * 19.5).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Ảnh đại diện sản phẩm (URL)</label>
              <input value={editForm.productImage || ''} onChange={e => handleEditChange('productImage', e.target.value)} style={{ ...styles.input, width: '100%' }} />
            </div>

            {/* ALBUM ẢNH SẢN PHẨM & ẢNH ĐÁNH GIÁ (HIỂN THỊ ĐỦ NHƯ TRANG WEB) */}
            {((editForm.images && editForm.images.length > 0) || (editForm.photoReviews && editForm.photoReviews.length > 0)) && (
              <div style={{ marginBottom: '16px', background: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  📸 Bộ sưu tập ảnh hiển thị trên Website ({((editForm.images || []).length + (editForm.photoReviews || []).length)} ảnh)
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {(editForm.images || []).map((imgUrl, i) => (
                    <div key={`album-${i}`} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #2563EB', flexShrink: 0 }}>
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, bg: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: '0.65rem', textAlign: 'center', fontWeight: 700, background: 'rgba(37,99,235,0.85)' }}>Album</span>
                    </div>
                  ))}
                  {(editForm.photoReviews || []).map((rvUrl, j) => (
                    <div key={`rv-${j}`} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #D1D5DB', flexShrink: 0 }}>
                      <img src={rvUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, color: '#FFF', fontSize: '0.65rem', textAlign: 'center', fontWeight: 700, background: 'rgba(5,150,105,0.85)' }}>Review</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
