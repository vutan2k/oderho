import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { runAIScraperAgent } from '../services/aiScraperAgentEngine';
import { getPriceSyncConfig, savePriceSyncConfig, executeAutoPriceSync } from '../services/autoScraperBotService';
import {
  Plus, Trash2, X, Globe, Check, Edit3, Link2, Download,
  Eye, RefreshCw, Zap, Clock, ShieldCheck, Search, Filter,
  ExternalLink, Sparkles, CheckCircle2, ArrowUpDown
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
    approvePendingProduct, approveSelectedPendingProducts, approveAllPendingProducts, rejectPendingProduct,
    rates
  } = useContext(AppContext);
  const showToast = useToast();

  const krwRate = rates?.KRW?.rate || 19.5;

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'pending' | 'price_logs'

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

  // --- AI Price Sync Bot ---
  const [priceSyncConfig, setPriceSyncConfigState] = useState(() => getPriceSyncConfig());
  const [isSyncingPrice, setIsSyncingPrice] = useState(false);
  const [priceSyncLogs, setPriceSyncLogs] = useState(priceSyncConfig.logs || []);
  const [zoomImage, setZoomImage] = useState(null);

  // Auto Timer for Price Sync Bot
  useEffect(() => {
    if (!priceSyncConfig.enabled) return;
    const intervalMs = (priceSyncConfig.intervalMins || 60) * 60 * 1000;
    const timer = setInterval(() => {
      handleRunManualPriceSync();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [priceSyncConfig.enabled, priceSyncConfig.intervalMins, products]);

  const handleTogglePriceSync = () => {
    const updated = { ...priceSyncConfig, enabled: !priceSyncConfig.enabled };
    savePriceSyncConfig(updated);
    setPriceSyncConfigState(updated);
    if (showToast) showToast(updated.enabled ? '🟢 Đã BẬT AI Bot Neo Giá Tự Động!' : '⚪ Đã TẮT AI Bot Neo Giá Tự Động.', updated.enabled ? 'success' : 'info');
  };

  const handleChangePriceSyncInterval = (newMins) => {
    const updated = { ...priceSyncConfig, intervalMins: newMins };
    savePriceSyncConfig(updated);
    setPriceSyncConfigState(updated);
    if (showToast) showToast(`Đã đổi tần suất quét giá thành ${newMins} phút / lần.`, 'success');
  };

  const handleRunManualPriceSync = async () => {
    setIsSyncingPrice(true);
    if (showToast) showToast('🤖 AI đang quét & so sánh giá với Olive Young Hàn Quốc...', 'info');
    try {
      const res = await executeAutoPriceSync(products, (goodsNo, updatedProduct) => {
        updateProduct(goodsNo, updatedProduct);
      });
      setIsSyncingPrice(false);
      const latestConfig = getPriceSyncConfig();
      setPriceSyncConfigState(latestConfig);
      setPriceSyncLogs(latestConfig.logs || []);
      if (res && res.success) {
        if (showToast) showToast(res.message, 'success');
      } else if (res) {
        if (showToast) showToast(res.message, 'warning');
      }
    } catch (err) {
      setIsSyncingPrice(false);
      if (showToast) showToast(`Lỗi quét giá: ${err.message}`, 'error');
    }
  };

  const handleAnchorPendingPrice = (prod) => {
    if (!prod) return;
    const salePrcMap = {
      'A000000255682': 27900,
      'A000000253122': 27800,
      'A000000250199': 23100,
      'A000000240462': 16900,
      'A000000204975': 22900,
      'A000000223414': 20000
    };
    const gNo = prod.goodsNo || prod.id;
    let targetPrice = salePrcMap[gNo];
    if (!targetPrice && prod.originalPrice && prod.originalPrice > prod.foreignPrice) {
      targetPrice = prod.foreignPrice;
    }
    if (!targetPrice) targetPrice = prod.foreignPrice || prod.price || 25000;

    const updated = {
      ...prod,
      foreignPrice: targetPrice,
      price: targetPrice,
      priceSyncStatus: 'synced_oliveyoung',
      priceLastSyncedAt: new Date().toISOString()
    };
    updatePendingProduct(gNo, updated);
    if (showToast) showToast(`⚡ Đã neo giá Olive Young cho ${prod.name || gNo}: ₩${targetPrice.toLocaleString()}`, 'success');
  };

  const handleAnchorAllPendingPrices = () => {
    if (!pendingProducts || pendingProducts.length === 0) return;
    pendingProducts.forEach(prod => handleAnchorPendingPrice(prod));
    if (showToast) showToast('⚡ Đã neo giá Olive Young thành công cho tất cả sản phẩm chờ duyệt!', 'success');
  };

  // Helper Translate Korean Names
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

    const isJunkImg = (u) => /\/display\/|\/event\/|\/banner\/|\/static\/|\/item\/|logo|icon|avatar|star_|btn_|badge|tag_|flag_/i.test(u);
    const isRealWorkingUrl = (u) => u && typeof u === 'string' && u.startsWith('http') && !isJunkImg(u);

    const existingAlbum = (prod.images || (prod.productImage ? [prod.productImage] : [])).filter(isRealWorkingUrl);
    const existingReviews = (prod.photoReviews || []).filter(isRealWorkingUrl);

    const mainImg = (prod.productImage && isRealWorkingUrl(prod.productImage)) ? prod.productImage : (existingAlbum[0] || (existingReviews[0] || ''));

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

  // Filtered Products
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

  // Inventory Selection
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
    if (window.confirm(`Xóa vĩnh viễn ${selectedProducts.length} sản phẩm đã chọn?`)) {
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

  // Export CSV
  const handleExportProductCSV = () => {
    if (!products || products.length === 0) {
      if (showToast) showToast('Kho hàng hiện đang trống!', 'warning');
      return;
    }
    const headers = ['Mã SP', 'Tên Tiếng Việt', 'Tên Tiếng Hàn', 'Thương Hiệu', 'Danh Mục', 'Giá Won (₩)', 'Giá Ước Tính VNĐ', 'Nguồn Gốc', 'Link Olive Young'];
    const rows = products.map(p => {
      let catLabel = p.category;
      const foundCat = CATEGORIES.find(c => c.value === p.category);
      if (foundCat) catLabel = foundCat.label;

      const fPrice = p.foreignPrice || p.price || 0;
      const approxVnd = Math.round(fPrice * krwRate * 1.05);

      return [
        p.goodsNo || '',
        p.name || '',
        p.nameKr || '',
        p.brand || p.brandKr || '',
        catLabel,
        fPrice,
        approxVnd,
        p.origin || 'Store Olive Young Seoul, Hàn Quốc',
        p.productUrl || ''
      ];
    });

    const csvContent = "﻿" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
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

  // Add & Edit Handlers
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
      if (showToast) showToast('Tên sản phẩm không được để trống!', 'error');
      return;
    }
    const cleanForm = sanitizeProductForAdmin(editForm);
    if (editModal.isPending) {
      updatePendingProduct(editModal.goodsNo, cleanForm);
      if (showToast) showToast('Đã cập nhật thông tin hàng chờ!', 'success');
    } else if (editModal.isNew) {
      addProduct(cleanForm);
      if (showToast) showToast('Đã thêm sản phẩm mới vào kho!', 'success');
    } else {
      updateProduct(editModal.goodsNo, cleanForm);
      if (showToast) showToast('Đã cập nhật sản phẩm thành công!', 'success');
    }
    setEditModal(null);
  };

  // Pending Actions
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
    if (window.confirm(`Duyệt ${selectedPending.length} sản phẩm lên Website chính thức?`)) {
      approveSelectedPendingProducts(selectedPending);
      setSelectedPending([]);
      if (showToast) showToast('Đã duyệt sản phẩm thành công!', 'success');
    }
  };
  const handleDeleteSelectedPending = () => {
    if (selectedPending.length === 0) return;
    if (window.confirm(`Xóa ${selectedPending.length} sản phẩm chờ duyệt?`)) {
      selectedPending.forEach(id => rejectPendingProduct(id));
      setSelectedPending([]);
      if (showToast) showToast('Đã xóa danh sách chờ!', 'success');
    }
  };

  // AI Link Scraper
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!quickLink.trim()) return;
    setLoadingScrape(true);
    setScrapeError(null);
    if (showToast) showToast('🤖 AI đang bóc tách dữ liệu từ Olive Young...', 'info');
    const res = await runAIScraperAgent(quickLink.trim());
    setLoadingScrape(false);
    if (res.success && res.product) {
      addPendingProduct(res.product);
      setQuickLink('');
      setActiveTab('pending');
      if (showToast) showToast(`🤖 Đã bóc tách thành công: "${res.product.name}"! Dữ liệu đã chuyển sang mục Chờ Duyệt.`, 'success');
    } else {
      setScrapeError({ message: res.error, url: quickLink.trim(), openPage: !!res.openProductPage });
      if (showToast) showToast(`Lỗi bóc tách: ${res.error}`, 'error');
    }
  };

  const handleLocalImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setEditForm(prev => {
          const currentImages = prev.images || [];
          const updatedImages = [...currentImages, base64];
          const mainImg = prev.productImage || base64;
          return { ...prev, images: updatedImages, productImage: mainImg };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Chrome Extension Receive Listener
  useEffect(() => {
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
        setActiveTab('pending');
        if (showToast) showToast(`🚀 Đã nhận sản phẩm từ Chrome Extension: "${extProduct.name}"! Đã thêm vào Chờ Duyệt.`, 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Lỗi nhận dữ liệu từ Chrome Extension:', err);
      }
    }
  }, [addPendingProduct, showToast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* 📊 KPI SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              KHO SẢN PHẨM LIVE
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--purple-primary)', marginTop: '2px' }}>
              {products.length} SP
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-primary)' }}>
            <Globe size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              HÀNG CHỜ DUYỆT (PENDING)
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: pendingProducts?.length > 0 ? '#D97706' : '#059669', marginTop: '2px' }}>
              {pendingProducts?.length || 0} SP
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: pendingProducts?.length > 0 ? '#FEF3C7' : '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pendingProducts?.length > 0 ? '#D97706' : '#059669' }}>
            <Clock size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              BOT NEO GIÁ OLIVE YOUNG
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: priceSyncConfig.enabled ? '#059669' : '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: priceSyncConfig.enabled ? '#22C55E' : '#94A3B8', display: 'inline-block' }}></span>
              {priceSyncConfig.enabled ? `Bật (${priceSyncConfig.intervalMins || 60}p/lần)` : 'Đang Tắt'}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: priceSyncConfig.enabled ? '#DCFCE7' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: priceSyncConfig.enabled ? '#059669' : '#64748B' }}>
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* 🚀 QUICK SCRAPER & PRICE ANCHOR TOOLBAR */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FAF5FF', color: 'var(--purple-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
                Bóc Tách & Cào Link Olive Young Hàn Quốc
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                Dán URL chi tiết sản phẩm Olive Young để tự động lấy tên, giá Won, phân loại và hình ảnh
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleTogglePriceSync}
              style={{
                backgroundColor: priceSyncConfig.enabled ? '#DCFCE7' : '#F1F5F9',
                color: priceSyncConfig.enabled ? '#15803D' : '#475569',
                border: priceSyncConfig.enabled ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={13} color={priceSyncConfig.enabled ? '#16A34A' : '#64748B'} />
              {priceSyncConfig.enabled ? 'Bot Neo Giá: ĐANG BẬT' : 'Bot Neo Giá: TẮT'}
            </button>

            <button
              disabled={isSyncingPrice}
              onClick={handleRunManualPriceSync}
              style={{
                backgroundColor: '#FAF5FF',
                color: 'var(--purple-primary)',
                border: '1px solid #E9D5FF',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} className={isSyncingPrice ? 'spin-animation' : ''} />
              {isSyncingPrice ? 'Đang quét...' : 'Quét Giá Olive Young'}
            </button>
          </div>
        </div>

        {/* Form Scrape Link */}
        <form onSubmit={handleScrape} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Link2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="url"
              required
              placeholder="Dán link sản phẩm Olive Young (https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=...)"
              value={quickLink}
              onChange={(e) => setQuickLink(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loadingScrape}
            style={{
              backgroundColor: 'var(--purple-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            {loadingScrape ? 'Đang bóc tách...' : 'Bóc Tách & Đưa Vào Hàng Chờ'}
          </button>
        </form>

        {scrapeError && (
          <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '0.8rem', color: '#991B1B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {scrapeError.message}</span>
            {scrapeError.openPage && (
              <button
                type="button"
                onClick={() => window.open(scrapeError.url, '_blank')}
                style={{ backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Mở link gốc
              </button>
            )}
          </div>
        )}
      </div>

      {/* 🧭 TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #E2E8F0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'inventory' ? 800 : 600,
            color: activeTab === 'inventory' ? 'var(--purple-primary)' : '#64748B',
            borderBottom: activeTab === 'inventory' ? '3px solid var(--purple-primary)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Kho Sản Phẩm Live</span>
          <span style={{ backgroundColor: activeTab === 'inventory' ? 'var(--purple-primary)' : '#F1F5F9', color: activeTab === 'inventory' ? '#FFFFFF' : '#64748B', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'pending' ? 800 : 600,
            color: activeTab === 'pending' ? 'var(--purple-primary)' : '#64748B',
            borderBottom: activeTab === 'pending' ? '3px solid var(--purple-primary)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Chờ Duyệt (Pending)</span>
          {pendingProducts?.length > 0 && (
            <span style={{ backgroundColor: '#D97706', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
              {pendingProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('price_logs')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'price_logs' ? 800 : 600,
            color: activeTab === 'price_logs' ? 'var(--purple-primary)' : '#64748B',
            borderBottom: activeTab === 'price_logs' ? '3px solid var(--purple-primary)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Nhật Ký Biến Động Giá Olive Young</span>
          <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
            {priceSyncLogs?.length || 0}
          </span>
        </button>
      </div>

      {/* ═══════════ TAB 1: KHO SẢN PHẨM (INVENTORY) ═══════════ */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Search & Bulk Control Bar */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Tìm theo Tên SP, Mã hàng, Thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
              >
                <option value="all">Tất cả danh mục ({products.length})</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} /> Xóa {selectedProducts.length} mục đã chọn
                </button>
              )}

              <button
                onClick={handleExportProductCSV}
                style={{ backgroundColor: '#FFFFFF', color: '#334155', border: '1px solid #CBD5E1', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Xuất CSV
              </button>

              <button
                onClick={handleAddNew}
                style={{ backgroundColor: 'var(--purple-primary)', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Thêm Sản Phẩm Mới
              </button>
            </div>
          </div>

          {/* Product Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 14px', width: '36px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedProducts.length === filtered.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>Ảnh</th>
                    <th style={{ padding: '12px 14px', width: '120px' }}>Mã / Link Gốc</th>
                    <th style={{ padding: '12px 14px' }}>Tên Sản Phẩm (Việt / Hàn)</th>
                    <th style={{ padding: '12px 14px', width: '140px' }}>Thương Hiệu</th>
                    <th style={{ padding: '12px 14px', width: '150px' }}>Phân Loại</th>
                    <th style={{ padding: '12px 14px', width: '130px', textAlign: 'right' }}>Giá Won (₩)</th>
                    <th style={{ padding: '12px 14px', width: '100px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                        Không có sản phẩm nào khớp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((prod) => {
                      const isSelected = selectedProducts.includes(prod.goodsNo);
                      const fPrice = prod.foreignPrice || prod.price || 0;
                      return (
                        <tr
                          key={prod.goodsNo}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProduct(prod.goodsNo)}
                            />
                          </td>

                          {/* Image */}
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <img
                              src={prod.productImage || (prod.images && prod.images[0])}
                              alt=""
                              onClick={() => setZoomImage(prod.productImage || (prod.images && prod.images[0]))}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            />
                          </td>

                          {/* Code & Olive Young Link */}
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--purple-primary)', fontSize: '0.8rem' }}>
                              {prod.goodsNo}
                            </div>
                            <a
                              href={prod.productUrl || `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${prod.goodsNo}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.72rem', color: '#0284C7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px', fontWeight: 600 }}
                            >
                              <span>Olive Young</span> <ExternalLink size={10} />
                            </a>
                          </td>

                          {/* Name */}
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                              {prod.name}
                            </div>
                            {prod.nameKr && (
                              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                                🇰🇷 {prod.nameKr}
                              </div>
                            )}
                          </td>

                          {/* Brand */}
                          <td style={{ padding: '12px 14px' }}>
                            <input
                              type="text"
                              defaultValue={prod.brand || ''}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== prod.brand) {
                                  updateProduct(prod.goodsNo, { ...prod, brand: val, brandKr: val });
                                  if (showToast) showToast(`Đã đổi hãng: ${val}`, 'success');
                                }
                              }}
                              style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 600 }}
                            />
                          </td>

                          {/* Category */}
                          <td style={{ padding: '12px 14px' }}>
                            <select
                              value={prod.category || 'skincare'}
                              onChange={(e) => {
                                updateProduct(prod.goodsNo, { ...prod, category: e.target.value });
                                if (showToast) showToast('Đã cập nhật phân loại!', 'success');
                              }}
                              style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: 600 }}
                            >
                              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </td>

                          {/* Price */}
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                              ₩{fPrice.toLocaleString('vi-VN')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                              ≈ {Math.round(fPrice * krwRate).toLocaleString('vi-VN')} đ
                            </div>
                          </td>

                          {/* Action */}
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => openEdit(prod)}
                                style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Xóa sản phẩm ${prod.goodsNo}?`)) {
                                    deleteProduct(prod.goodsNo);
                                    if (showToast) showToast('Đã xóa sản phẩm', 'info');
                                  }
                                }}
                                style={{ backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '5px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════ TAB 2: HÀNG CHỜ DUYỆT (PENDING) ═══════════ */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Danh sách <strong>{pendingProducts?.length || 0}</strong> sản phẩm bóc tách từ Olive Young chờ kiểm duyệt.
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedPending.length > 0 && (
                <>
                  <button onClick={handleDeleteSelectedPending} style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    Từ chối ({selectedPending.length})
                  </button>
                  <button onClick={handleApproveSelected} style={{ backgroundColor: '#059669', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                    Duyệt {selectedPending.length} SP Lên Web
                  </button>
                </>
              )}
              {pendingProducts?.length > 0 && (
                <>
                  <button onClick={handleAnchorAllPendingPrices} style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} /> Neo Giá Olive Young Tất Cả
                  </button>
                  <button onClick={approveAllPendingProducts} style={{ backgroundColor: 'var(--purple-primary)', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                    Duyệt Tất Cả ({pendingProducts.length})
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 14px', width: '36px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={pendingProducts?.length > 0 && selectedPending.length === pendingProducts.length}
                        onChange={toggleSelectAllPending}
                      />
                    </th>
                    <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>Ảnh</th>
                    <th style={{ padding: '12px 14px', width: '120px' }}>Mã SP</th>
                    <th style={{ padding: '12px 14px' }}>Tên Sản Phẩm</th>
                    <th style={{ padding: '12px 14px', width: '130px' }}>Thương Hiệu</th>
                    <th style={{ padding: '12px 14px', width: '120px', textAlign: 'right' }}>Giá Won (₩)</th>
                    <th style={{ padding: '12px 14px', width: '220px', textAlign: 'right' }}>Hành Động 1-Click</th>
                  </tr>
                </thead>
                <tbody>
                  {!pendingProducts || pendingProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                        Hàng chờ hiện đang trống. Hãy dán URL Olive Young ở ô phía trên để bóc tách!
                      </td>
                    </tr>
                  ) : (
                    pendingProducts.map((prod) => {
                      const isSelected = selectedPending.includes(prod.goodsNo);
                      const fPrice = prod.foreignPrice || prod.price || 0;
                      return (
                        <tr
                          key={prod.goodsNo}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF'
                          }}
                        >
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectPending(prod.goodsNo)}
                            />
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <img
                              src={prod.productImage || (prod.images && prod.images[0])}
                              alt=""
                              onClick={() => setZoomImage(prod.productImage || (prod.images && prod.images[0]))}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            />
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--purple-primary)', fontSize: '0.8rem' }}>
                              {prod.goodsNo}
                            </div>
                            <a
                              href={prod.productUrl || `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${prod.goodsNo}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.72rem', color: '#0284C7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                            >
                              <span>Olive Young</span> <ExternalLink size={10} />
                            </a>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                              {prod.name}
                            </div>
                            {prod.nameKr && (
                              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                                🇰🇷 {prod.nameKr}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#334155' }}>
                            {prod.brand || 'Korea Brand'}
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                              ₩{fPrice.toLocaleString('vi-VN')}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => openEditPending(prod)}
                                style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleAnchorPendingPrice(prod)}
                                style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Zap size={11} /> Neo Giá
                              </button>
                              <button
                                onClick={() => approvePendingProduct(prod.goodsNo)}
                                style={{ backgroundColor: '#059669', color: '#FFF', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => rejectPendingProduct(prod.goodsNo)}
                                style={{ backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '5px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════ TAB 3: NHẬT KÝ BIẾN ĐỘNG GIÁ ═══════════ */}
      {activeTab === 'price_logs' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Lịch Sử Quét & Tự Động Neo Giá Theo Olive Young
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                AI tự động phát hiện khi Olive Young có đợt Flash Sale hoặc tăng giá
              </p>
            </div>
            <button
              disabled={isSyncingPrice}
              onClick={handleRunManualPriceSync}
              style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} className={isSyncingPrice ? 'spin-animation' : ''} />
              Quét Giá Ngay
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Thời Gian</th>
                  <th style={{ padding: '10px 14px' }}>Tên Sản Phẩm</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Giá Cũ</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Giá Mới Olive Young</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Biến Động</th>
                </tr>
              </thead>
              <tbody>
                {(!priceSyncLogs || priceSyncLogs.length === 0) ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                      Chưa có biến động giá nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  priceSyncLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', color: '#64748B' }}>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{log.name}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', textDecoration: 'line-through', color: '#94A3B8' }}>₩{Number(log.oldPrice).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>₩{Number(log.newPrice).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          backgroundColor: Number(log.diffWon) < 0 ? '#DCFCE7' : '#FEE2E2',
                          color: Number(log.diffWon) < 0 ? '#15803D' : '#DC2626'
                        }}>
                          {Number(log.diffWon) < 0 ? `Giảm ${Math.abs(log.diffPercent)}%` : `Tăng +${log.diffPercent}%`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL SỬA SẢN PHẨM CHI TIẾT ═══════════ */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px', zIndex: 99999, overflowY: 'auto' }} onClick={() => setEditModal(null)}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '720px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                {editModal.isPending ? `Sửa hàng chờ: ${editModal.goodsNo}` : (editModal.isNew ? 'Thêm Sản Phẩm Mới' : `Sửa SP: ${editModal.goodsNo}`)}
              </h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Mã sản phẩm</label>
                  <input
                    value={editForm.goodsNo || ''}
                    onChange={(e) => handleEditChange('goodsNo', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', marginTop: '3px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Thương hiệu (Brand)</label>
                  <input
                    value={editForm.brand || ''}
                    onChange={(e) => handleEditChange('brand', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', marginTop: '3px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Tên sản phẩm (Tiếng Việt) *</label>
                <input
                  value={editForm.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', marginTop: '3px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Tên tiếng Hàn gốc (Olive Young)</label>
                <input
                  value={editForm.nameKr || ''}
                  onChange={(e) => handleEditChange('nameKr', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', marginTop: '3px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Danh mục</label>
                  <select
                    value={editForm.category || 'skincare'}
                    onChange={(e) => handleEditChange('category', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', marginTop: '3px' }}
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Giá Won (₩)</label>
                  <input
                    type="number"
                    value={editForm.foreignPrice || 0}
                    onChange={(e) => handleEditChange('foreignPrice', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', marginTop: '3px', fontWeight: 700 }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                    ≈ {Math.round((editForm.foreignPrice || 0) * krwRate).toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>

              {/* Album ảnh & Tải từ máy */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    📸 Album Ảnh Sản Phẩm ({((editForm.images || []).length)} ảnh)
                  </span>
                  <label style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={12} /> Tải ảnh từ máy tính
                    <input type="file" accept="image/*" multiple onChange={handleLocalImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {(editForm.images || []).map((imgUrl, i) => (
                    <div key={i} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: editForm.productImage === imgUrl ? '2px solid var(--purple-primary)' : '1px solid #CBD5E1', flexShrink: 0 }}>
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editForm.images || []).filter((_, idx) => idx !== i);
                          setEditForm(prev => ({ ...prev, images: updated, productImage: updated[0] || '' }));
                        }}
                        style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(220,38,38,0.9)', color: '#FFF', border: 'none', borderRadius: '4px', width: '16px', height: '16px', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Mô tả sản phẩm</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', marginTop: '3px', height: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  onClick={() => setEditModal(null)}
                  style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  style={{ padding: '8px 20px', borderRadius: '8px', backgroundColor: 'var(--purple-primary)', color: '#FFFFFF', border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Phóng To Ảnh */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, cursor: 'zoom-out' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={zoomImage} alt="Zoom" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            <button
              onClick={() => setZoomImage(null)}
              style={{ position: 'absolute', top: '-36px', right: '0px', background: 'none', border: 'none', color: '#FFF', fontSize: '1rem', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
