import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { runAIScraperAgent } from '../services/aiScraperAgentEngine';
import { getPriceSyncConfig, savePriceSyncConfig } from '../services/autoScraperBotService';
import {
  syncProductPriceWithOliveYoung,
  syncAllProductsWithOliveYoung,
  VERIFIED_OLIVEYOUNG_PRICES
} from '../services/oliveYoungPriceSyncService';
import {
  Plus, Trash2, X, Globe, Edit3, Download,
  Eye, RefreshCw, Zap, Clock, Search, ExternalLink,
  Sparkles, CheckCircle2, AlertCircle, UploadCloud, Image as ImageIcon, Star
} from 'lucide-react';

const CATEGORIES = [
  { value: 'cosmetics', label: 'Mỹ phẩm' },
  { value: 'ginseng', label: 'Sâm nấm' },
  { value: 'supplements', label: 'Thực phẩm chức năng' }
];

export default function AdminProductManager() {
  const {
    products, addProduct, updateProduct, deleteProduct,
    pendingProducts, addPendingProduct, updatePendingProduct,
    approvePendingProduct, approveSelectedPendingProducts, approveAllPendingProducts, rejectPendingProduct,
    rates
  } = useContext(AppContext);
  const showToast = useToast();

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'pending' | 'price_logs'

  // --- Search & Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // --- Edit Modal State ---
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [zoomImage, setZoomImage] = useState(null);
  const [urlInputVal, setUrlInputVal] = useState('');
  const mainImageFileInputRef = useRef(null);
  const albumFileInputRef = useRef(null);

  // --- Pending State ---
  const [selectedPending, setSelectedPending] = useState([]);

  // --- Scraper State ---
  const [quickLink, setQuickLink] = useState('');
  const [loadingScrape, setLoadingScrape] = useState(false);

  // --- Price Sync Bot & Logs ---
  const [priceSyncConfig, setPriceSyncConfigState] = useState(() => getPriceSyncConfig());
  const [isSyncingPrice, setIsSyncingPrice] = useState(false);
  const [priceSyncLogs, setPriceSyncLogs] = useState(priceSyncConfig.logs || []);
  const [priceSyncSummaryModal, setPriceSyncSummaryModal] = useState(null);

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
    if (showToast) showToast(updated.enabled ? 'Đã BẬT AI Bot Neo Giá Tự Động!' : 'Đã TẮT AI Bot Neo Giá Tự Động.', updated.enabled ? 'success' : 'info');
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

  const sanitizeProductForAdmin = (prod) => {
    if (!prod) return prod;
    let vietnameseName = prod.name || '';
    if (!vietnameseName || /[가-힣]/.test(vietnameseName)) {
      vietnameseName = translateKoreanToVi(prod.nameKr || prod.name);
    }

    const isJunkImg = (u) => /\/display\/|\/event\/|\/banner\/|\/static\/|\/item\/|logo|icon|avatar|star_|btn_|badge|tag_|flag_/i.test(u);
    const isRealWorkingUrl = (u) => u && typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image')) && !isJunkImg(u);

    const existingAlbum = (prod.images || (prod.productImage ? [prod.productImage] : [])).filter(isRealWorkingUrl);
    const existingReviews = (prod.photoReviews || []).filter(isRealWorkingUrl);
    const mainImg = (prod.productImage && isRealWorkingUrl(prod.productImage)) ? prod.productImage : (existingAlbum[0] || (existingReviews[0] || ''));

    const rawPrice = prod.foreignPrice !== undefined ? prod.foreignPrice : (prod.price !== undefined ? prod.price : '');

    return {
      ...prod,
      name: vietnameseName,
      foreignPrice: rawPrice,
      price: rawPrice,
      productImage: mainImg,
      images: existingAlbum.length > 0 ? existingAlbum : (mainImg ? [mainImg] : []),
      photoReviews: existingReviews
    };
  };

  // Category Classification Helpers
  const isCosmeticCat = (cat) => {
    if (!cat) return true;
    const c = String(cat).toLowerCase();
    return c === 'cosmetics' || c.includes('mỹ phẩm') || c.includes('skin') || c.includes('dưỡng') || c.includes('make') || c.includes('trang') || c.includes('hair') || c.includes('body') || c.includes('mask') || c.includes('pad');
  };

  const isGinsengCat = (cat) => {
    if (!cat) return false;
    const c = String(cat).toLowerCase();
    return c === 'ginseng' || c.includes('sâm') || c.includes('nấm');
  };

  const isSupplementCat = (cat) => {
    if (!cat) return false;
    const c = String(cat).toLowerCase();
    return c === 'supplements' || c.includes('thực phẩm') || c.includes('chức năng') || c.includes('health') || c.includes('collagen') || c.includes('pharm') || c.includes('thuốc');
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    let cosmeticsCount = 0;
    let ginsengCount = 0;
    let supplementsCount = 0;

    products.forEach(p => {
      if (isGinsengCat(p.category)) ginsengCount++;
      else if (isSupplementCat(p.category)) supplementsCount++;
      else cosmeticsCount++;
    });

    return {
      all: products.length,
      cosmetics: cosmeticsCount,
      ginseng: ginsengCount,
      supplements: supplementsCount
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      let matchCat = true;
      if (filterCat === 'cosmetics') matchCat = isCosmeticCat(p.category);
      else if (filterCat === 'ginseng') matchCat = isGinsengCat(p.category);
      else if (filterCat === 'supplements') matchCat = isSupplementCat(p.category);
      else if (filterCat !== 'all') matchCat = p.category === filterCat;

      const term = (searchTerm || '').toLowerCase().trim();
      const matchSearch = !term ||
        (p.name || '').toLowerCase().includes(term) ||
        (p.nameKr || '').toLowerCase().includes(term) ||
        (p.brand || '').toLowerCase().includes(term) ||
        (p.brandKr || '').toLowerCase().includes(term) ||
        (p.goodsNo || '').toLowerCase().includes(term);

      return matchCat && matchSearch;
    });
  }, [products, filterCat, searchTerm]);

  // Selection Handlers
  const toggleSelectProduct = (goodsNo) => {
    setSelectedProducts(prev =>
      prev.includes(goodsNo) ? prev.filter(id => id !== goodsNo) : [...prev, goodsNo]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.goodsNo));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Xóa ${selectedProducts.length} sản phẩm đã chọn?`)) {
      selectedProducts.forEach(id => deleteProduct(id));
      setSelectedProducts([]);
      if (showToast) showToast(`Đã xóa ${selectedProducts.length} sản phẩm`, 'success');
    }
  };

  // ⚡ Single Product Anchor Price
  const handleAnchorProductPrice = async (prod) => {
    if (!prod) return;
    const synced = syncProductPriceWithOliveYoung(prod);
    await updateProduct(prod.goodsNo, synced);
    const diff = (synced.foreignPrice || 0) - (prod.foreignPrice || 0);
    const diffMsg = diff !== 0 ? ` (Giá mới: ₩${synced.foreignPrice.toLocaleString('vi-VN')})` : ' (Giá đã chuẩn)';
    if (showToast) showToast(`⚡ Đã cập nhật giá OY cho "${synced.name || prod.goodsNo}": ₩${synced.foreignPrice.toLocaleString('vi-VN')}${diffMsg}`, 'success');
  };

  // ⚡ Batch Anchor Price
  const handleBatchAnchorPrice = async () => {
    if (selectedProducts.length === 0) return;
    const targetProds = products.filter(p => selectedProducts.includes(p.goodsNo));
    for (const prod of targetProds) {
      const synced = syncProductPriceWithOliveYoung(prod);
      await updateProduct(prod.goodsNo, synced);
    }
    if (showToast) showToast(`⚡ Đã neo giá Olive Young cho ${targetProds.length} sản phẩm đã chọn!`, 'success');
  };

  // Quét & cập nhật toàn bộ kho sản phẩm chuẩn Olive Young
  const handleRunManualPriceSync = async () => {
    setIsSyncingPrice(true);
    if (showToast) showToast('AI đang quét và đối chiếu toàn bộ kho hàng với Olive Young Hàn Quốc...', 'info');
    try {
      const res = syncAllProductsWithOliveYoung(products);
      for (const p of res.updatedProducts) {
        await updateProduct(p.goodsNo, p);
      }
      setIsSyncingPrice(false);
      setPriceSyncSummaryModal(res);
      const latestConfig = getPriceSyncConfig();
      const updatedLogs = [...res.changes, ...(latestConfig.logs || [])].slice(0, 100);
      savePriceSyncConfig({ ...latestConfig, lastSyncTime: new Date().toISOString(), logs: updatedLogs });
      setPriceSyncConfigState(getPriceSyncConfig());
      setPriceSyncLogs(updatedLogs);
      if (showToast) {
        if (res.updatedCount > 0) {
          showToast(`⚡ Đã đồng bộ giá chuẩn Olive Young cho ${res.updatedCount}/${res.totalScanned} sản phẩm!`, 'success');
        } else {
          showToast(`✅ Toàn bộ ${res.totalScanned} sản phẩm đã khớp 100% với giá Olive Young!`, 'success');
        }
      }
    } catch (err) {
      setIsSyncingPrice(false);
      if (showToast) showToast(`Lỗi quét giá: ${err.message}`, 'error');
    }
  };

  // Export CSV
  const handleExportProductCSV = () => {
    if (!products || products.length === 0) {
      if (showToast) showToast('Kho hàng hiện đang trống!', 'warning');
      return;
    }
    const headers = ['Mã SP', 'Tên Tiếng Việt', 'Tên Tiếng Hàn', 'Thương Hiệu', 'Danh Mục', 'Giá Won (₩)', 'Giá Ước Tính VNĐ', 'Link Olive Young'];
    const rows = products.map(p => {
      let catLabel = p.category;
      const foundCat = CATEGORIES.find(c => c.value === p.category);
      if (foundCat) catLabel = foundCat.label;

      const fPrice = p.foreignPrice || p.price || 0;
      const approxVnd = Math.round(fPrice * krwRate * serviceFeeMultiplier);

      return [
        p.goodsNo || '',
        p.name || '',
        p.nameKr || '',
        p.brand || p.brandKr || '',
        catLabel,
        fPrice,
        approxVnd,
        p.productUrl || `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${p.goodsNo}`
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

  // Add & Edit Handlers
  const handleAddNew = () => {
    const newProd = {
      goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '', nameKr: '', brand: '', brandKr: '', category: 'cosmetics',
      foreignPrice: '', originalPrice: '',
      productImage: '', images: [], photoReviews: [], description: '', origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 5.0, reviewsCount: 0, usage: '', productUrl: '',
    };
    setEditForm(newProd);
    setUrlInputVal('');
    setEditModal({ isNew: true, ...newProd });
  };

  const openEdit = (prod) => {
    const cleanProd = sanitizeProductForAdmin(prod);
    setEditForm({
      ...cleanProd,
      foreignPrice: cleanProd.foreignPrice ?? cleanProd.price ?? '',
      originalPrice: cleanProd.originalPrice ?? ''
    });
    setUrlInputVal('');
    setEditModal({ isPending: false, ...cleanProd });
  };

  const openEditPending = (prod) => {
    const cleanProd = sanitizeProductForAdmin(prod);
    setEditForm({
      ...cleanProd,
      foreignPrice: cleanProd.foreignPrice ?? cleanProd.price ?? '',
      originalPrice: cleanProd.originalPrice ?? ''
    });
    setUrlInputVal('');
    setEditModal({ isPending: true, ...cleanProd });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: ['rating', 'reviewsCount'].includes(field) ? (parseFloat(value) || 0) : value
    }));
  };

  const handleSaveEdit = () => {
    if (!editForm.name?.trim()) {
      if (showToast) showToast('Tên sản phẩm không được để trống!', 'error');
      return;
    }

    const cleanForeignPrice = editForm.foreignPrice !== '' ? Number(editForm.foreignPrice) || 0 : 0;
    const cleanOriginalPrice = editForm.originalPrice !== '' && editForm.originalPrice !== undefined ? Number(editForm.originalPrice) || 0 : undefined;

    const cleanForm = sanitizeProductForAdmin({
      ...editForm,
      foreignPrice: cleanForeignPrice,
      price: cleanForeignPrice,
      originalPrice: cleanOriginalPrice
    });

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

  // AI Link Scraper
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!quickLink.trim()) return;
    setLoadingScrape(true);
    if (showToast) showToast('AI đang bóc tách dữ liệu từ Olive Young...', 'info');
    const res = await runAIScraperAgent(quickLink.trim());
    setLoadingScrape(false);
    if (res.success && res.product) {
      addPendingProduct(res.product);
      setQuickLink('');
      setActiveTab('pending');
      if (showToast) showToast(`Đã bóc tách thành công: "${res.product.name}"!`, 'success');
    } else {
      if (showToast) showToast(`Lỗi bóc tách: ${res.error}`, 'error');
    }
  };

  // 🖼️ Upload Main Avatar Image from Computer
  const handleMainAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setEditForm(prev => {
        const currentImages = prev.images || [];
        const updatedImages = currentImages.includes(base64) ? currentImages : [base64, ...currentImages];
        return {
          ...prev,
          productImage: base64,
          images: updatedImages
        };
      });
      if (showToast) showToast('Đã tải và cài đặt ảnh đại diện chính!', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 🖼️ Upload Multiple Album Images from Computer
  const handleAlbumUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setEditForm(prev => {
          const currentImages = prev.images || [];
          const updatedImages = [...currentImages, base64];
          const mainImg = prev.productImage || base64;
          return {
            ...prev,
            images: updatedImages,
            productImage: mainImg
          };
        });
      };
      reader.readAsDataURL(file);
    });
    if (showToast) showToast(`Đang tải ${files.length} ảnh lên album...`, 'info');
    e.target.value = '';
  };

  // 🖼️ Add Image via Web URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    const url = urlInputVal.trim();
    if (!url) return;
    setEditForm(prev => {
      const currentImages = prev.images || [];
      const updatedImages = [...currentImages, url];
      const mainImg = prev.productImage || url;
      return {
        ...prev,
        images: updatedImages,
        productImage: mainImg
      };
    });
    setUrlInputVal('');
    if (showToast) showToast('Đã thêm ảnh từ link URL!', 'success');
  };

  // Set any album photo as Main Avatar
  const handleSetMainAvatar = (imgUrl) => {
    setEditForm(prev => ({
      ...prev,
      productImage: imgUrl
    }));
    if (showToast) showToast('Đã đặt làm ảnh đại diện chính!', 'success');
  };

  // Remove photo from album
  const handleRemovePhoto = (imgUrl) => {
    setEditForm(prev => {
      const updated = (prev.images || []).filter(u => u !== imgUrl);
      const newMain = prev.productImage === imgUrl ? (updated[0] || '') : prev.productImage;
      return {
        ...prev,
        images: updated,
        productImage: newMain
      };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* 📊 SUMMARY KPI CARDS (TRỰC QUAN & GỌN GÀNG) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px 18px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              KHO SẢN PHẨM LIVE
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--purple-primary)', marginTop: '2px' }}>
              {products.length} SP
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-primary)' }}>
            <Globe size={18} />
          </div>
        </div>

        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px 18px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              HÀNG CHỜ DUYỆT
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: pendingProducts?.length > 0 ? '#D97706' : '#059669', marginTop: '2px' }}>
              {pendingProducts?.length || 0} SP
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: pendingProducts?.length > 0 ? '#FEF3C7' : '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pendingProducts?.length > 0 ? '#D97706' : '#059669' }}>
            <Clock size={18} />
          </div>
        </div>

        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px 18px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              BOT NEO GIÁ OLIVE YOUNG
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: priceSyncConfig.enabled ? '#059669' : 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: priceSyncConfig.enabled ? '#22C55E' : '#94A3B8' }} />
              {priceSyncConfig.enabled ? `Đang Bật (${priceSyncConfig.intervalMins || 60}p)` : 'Đang Tắt'}
            </div>
          </div>
          <button
            onClick={handleTogglePriceSync}
            style={{
              backgroundColor: priceSyncConfig.enabled ? '#DCFCE7' : 'var(--bg-ivory)',
              color: priceSyncConfig.enabled ? '#15803D' : '#64748B',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {priceSyncConfig.enabled ? 'Tắt Bot' : 'Bật Bot'}
          </button>
        </div>
      </div>

      {/* 🚀 QUICK SCRAPER BAR (CÀO LINK GỌN GÀNG) */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px 18px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <form onSubmit={handleScrape} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Dán link sản phẩm Olive Young Hàn Quốc cần cào..."
            value={quickLink}
            onChange={(e) => setQuickLink(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loadingScrape || !quickLink.trim()}
            style={{
              backgroundColor: 'var(--purple-primary)',
              color: '#FFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={14} />
            {loadingScrape ? 'Đang bóc tách...' : 'Cào Dữ Liệu'}
          </button>
        </form>

        <button
          disabled={isSyncingPrice}
          onClick={handleRunManualPriceSync}
          style={{
            backgroundColor: '#059669',
            color: '#FFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={isSyncingPrice ? 'spin-animation' : ''} />
          {isSyncingPrice ? 'Đang quét giá...' : '⚡ Quét Giá Toàn Bộ Theo Olive Young'}
        </button>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'inventory' ? 800 : 600,
            color: activeTab === 'inventory' ? 'var(--purple-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'inventory' ? '3px solid var(--purple-primary)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Kho Sản Phẩm Live</span>
          <span style={{ backgroundColor: activeTab === 'inventory' ? 'var(--purple-primary)' : '#E2E8F0', color: activeTab === 'inventory' ? '#FFF' : '#475569', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'pending' ? 800 : 600,
            color: activeTab === 'pending' ? 'var(--purple-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'pending' ? '3px solid var(--purple-primary)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Chờ Duyệt (Pending)</span>
          {pendingProducts?.length > 0 && (
            <span style={{ backgroundColor: '#D97706', color: '#FFF', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
              {pendingProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('price_logs')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'price_logs' ? 800 : 600,
            color: activeTab === 'price_logs' ? 'var(--purple-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'price_logs' ? '3px solid var(--purple-primary)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Nhật Ký Biến Động Giá</span>
          <span style={{ backgroundColor: '#E2E8F0', color: '#475569', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
            {priceSyncLogs?.length || 0}
          </span>
        </button>
      </div>

      {/* ═══════════ TAB 1: KHO SẢN PHẨM LIVE (TRỰC QUAN & ĐƠN GIẢN) ═══════════ */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Search & Action Bar */}
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px 16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm, mã hàng, thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', backgroundColor: '#FFF' }}
              >
                <option value="all">Tất cả danh mục ({categoryCounts.all})</option>
                <option value="cosmetics">Mỹ phẩm ({categoryCounts.cosmetics})</option>
                <option value="ginseng">Sâm nấm ({categoryCounts.ginseng})</option>
                <option value="supplements">Thực phẩm chức năng ({categoryCounts.supplements})</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {selectedProducts.length > 0 && (
                <>
                  <button
                    onClick={handleBatchAnchorPrice}
                    style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '7px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Zap size={13} /> Neo Giá ({selectedProducts.length})
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '7px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Xóa ({selectedProducts.length})
                  </button>
                </>
              )}

              <button
                onClick={handleExportProductCSV}
                style={{ backgroundColor: '#FFF', color: '#475569', border: '1px solid var(--border-color)', padding: '7px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Download size={13} /> Xuất CSV
              </button>

              <button
                onClick={handleAddNew}
                style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Thêm Sản Phẩm Mới
              </button>
            </div>
          </div>

          {/* BẢNG SẢN PHẨM TRỰC QUAN */}
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-ivory)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '10px 12px', width: '36px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ padding: '10px 12px', width: '64px', textAlign: 'center' }}>Ảnh</th>
                    <th style={{ padding: '10px 12px', width: '125px' }}>Mã / Link Gốc</th>
                    <th style={{ padding: '10px 12px' }}>Tên Sản Phẩm (Việt / Hàn)</th>
                    <th style={{ padding: '10px 12px', width: '120px' }}>Thương Hiệu</th>
                    <th style={{ padding: '10px 12px', width: '120px' }}>Phân Loại</th>
                    <th style={{ padding: '10px 12px', width: '160px', textAlign: 'right' }}>Giá Olive Young</th>
                    <th style={{ padding: '10px 12px', width: '110px', textAlign: 'center' }}>Trạng Thái</th>
                    <th style={{ padding: '10px 12px', width: '150px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                        Không tìm thấy sản phẩm nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isSelected = selectedProducts.includes(prod.goodsNo);
                      const fPrice = Number(prod.foreignPrice || prod.price) || 0;
                      const origPrice = Number(prod.originalPrice) || 0;
                      const hasDiscount = origPrice > fPrice && fPrice > 0;
                      const discountPct = hasDiscount ? Math.round(((origPrice - fPrice) / origPrice) * 100) : 0;
                      const approxVnd = Math.round(fPrice * krwRate * serviceFeeMultiplier);

                      return (
                        <tr
                          key={prod.goodsNo}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isSelected ? '#F5F3FF' : '#FFF',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProduct(prod.goodsNo)}
                            />
                          </td>

                          {/* Thumbnail */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <img
                              src={prod.productImage || (prod.images && prod.images[0]) || ''}
                              alt=""
                              onClick={() => setZoomImage(prod.productImage || (prod.images && prod.images[0]))}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                            />
                          </td>

                          {/* Mã SP & Link Olive Young */}
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--purple-primary)', fontSize: '0.78rem' }}>
                              {prod.goodsNo}
                            </div>
                            <a
                              href={prod.productUrl || `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${prod.goodsNo}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.7rem', color: '#0284C7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 600 }}
                            >
                              <span>Olive Young</span> <ExternalLink size={10} />
                            </a>
                          </td>

                          {/* Tên Sản Phẩm (VI / KR) */}
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.84rem', lineHeight: '1.3' }}>
                              {prod.name}
                            </div>
                            {prod.nameKr && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                🇰🇷 {prod.nameKr}
                              </div>
                            )}
                          </td>

                          {/* Thương Hiệu (Brand) */}
                          <td style={{ padding: '10px 12px' }}>
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
                              style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.78rem', fontWeight: 600 }}
                            />
                          </td>

                          {/* Danh Mục (Category) */}
                          <td style={{ padding: '10px 12px' }}>
                            <select
                              value={prod.category || 'cosmetics'}
                              onChange={(e) => {
                                updateProduct(prod.goodsNo, { ...prod, category: e.target.value });
                                if (showToast) showToast('Đã cập nhật phân loại!', 'success');
                              }}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.76rem', fontWeight: 600 }}
                            >
                              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </td>

                          {/* Giá Won & VNĐ */}
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--purple-primary)', fontSize: '0.9rem' }}>
                              ₩{fPrice.toLocaleString('vi-VN')}
                            </div>
                            {hasDiscount && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '1px' }}>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                                  ₩{origPrice.toLocaleString('vi-VN')}
                                </span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0 4px', borderRadius: '3px' }}>
                                  -{discountPct}%
                                </span>
                              </div>
                            )}
                            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                              ≈ {approxVnd.toLocaleString('vi-VN')} đ
                            </div>
                          </td>

                          {/* Trạng Thái Giá */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <CheckCircle2 size={11} /> Chuẩn OY
                            </span>
                          </td>

                          {/* 3 Nút Thao Tác Trực Quan */}
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                onClick={() => handleAnchorProductPrice(prod)}
                                title="Cập nhật giá chuẩn từ Olive Young Hàn Quốc"
                                style={{
                                  backgroundColor: '#FEF3C7',
                                  color: '#D97706',
                                  border: '1px solid #FDE68A',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                <Zap size={11} /> Neo Giá
                              </button>

                              <button
                                onClick={() => openEdit(prod)}
                                style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Sửa
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Xóa vĩnh viễn sản phẩm ${prod.goodsNo} (${prod.name})?`)) {
                                    deleteProduct(prod.goodsNo);
                                    if (showToast) showToast('Đã xóa sản phẩm', 'info');
                                  }
                                }}
                                style={{ backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '4px 7px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                              >
                                <Trash2 size={11} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px 16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Danh sách <strong>{pendingProducts?.length || 0}</strong> sản phẩm bóc tách từ Olive Young chờ kiểm duyệt.
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedPending.length > 0 && (
                <>
                  <button onClick={handleDeleteSelectedPending} style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    Từ chối ({selectedPending.length})
                  </button>
                  <button onClick={handleApproveSelected} style={{ backgroundColor: '#059669', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
                    Duyệt {selectedPending.length} SP Lên Web
                  </button>
                </>
              )}
              {pendingProducts?.length > 0 && (
                <button onClick={approveAllPendingProducts} style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
                  Duyệt Tất Cả ({pendingProducts.length})
                </button>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-ivory)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px', width: '36px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={pendingProducts?.length > 0 && selectedPending.length === pendingProducts.length}
                        onChange={() => {
                          if (selectedPending.length === pendingProducts.length && pendingProducts.length > 0) setSelectedPending([]);
                          else setSelectedPending(pendingProducts.map(p => p.goodsNo));
                        }}
                      />
                    </th>
                    <th style={{ padding: '10px 12px', width: '64px', textAlign: 'center' }}>Ảnh</th>
                    <th style={{ padding: '10px 12px', width: '120px' }}>Mã SP</th>
                    <th style={{ padding: '10px 12px' }}>Tên Sản Phẩm</th>
                    <th style={{ padding: '10px 12px', width: '120px' }}>Hãng</th>
                    <th style={{ padding: '10px 12px', width: '110px', textAlign: 'right' }}>Giá Won (₩)</th>
                    <th style={{ padding: '10px 12px', width: '180px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {!pendingProducts || pendingProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                        Hàng chờ hiện đang trống. Hãy dán link Olive Young ở ô phía trên để bóc tách!
                      </td>
                    </tr>
                  ) : (
                    pendingProducts.map((prod) => {
                      const isSelected = selectedPending.includes(prod.goodsNo);
                      const fPrice = Number(prod.foreignPrice || prod.price) || 0;
                      return (
                        <tr
                          key={prod.goodsNo}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isSelected ? '#F5F3FF' : '#FFF'
                          }}
                        >
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedPending(prev =>
                                  prev.includes(prod.goodsNo) ? prev.filter(id => id !== prod.goodsNo) : [...prev, prod.goodsNo]
                                );
                              }}
                            />
                          </td>

                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <img
                              src={prod.productImage || (prod.images && prod.images[0]) || ''}
                              alt=""
                              onClick={() => setZoomImage(prod.productImage || (prod.images && prod.images[0]))}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                            />
                          </td>

                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--purple-primary)', fontSize: '0.78rem' }}>
                              {prod.goodsNo}
                            </div>
                            <a
                              href={prod.productUrl || `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${prod.goodsNo}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.7rem', color: '#0284C7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}
                            >
                              <span>Olive Young</span> <ExternalLink size={9} />
                            </a>
                          </td>

                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.84rem' }}>{prod.name}</div>
                            {prod.nameKr && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>🇰🇷 {prod.nameKr}</div>}
                          </td>

                          <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {prod.brand || 'Korea Brand'}
                          </td>

                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: 'var(--purple-primary)' }}>
                            ₩{fPrice.toLocaleString('vi-VN')}
                          </td>

                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => openEditPending(prod)}
                                style={{ backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => approvePendingProduct(prod.goodsNo)}
                                style={{ backgroundColor: '#059669', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => rejectPendingProduct(prod.goodsNo)}
                                style={{ backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '4px 6px', borderRadius: '6px', fontSize: '0.74rem', cursor: 'pointer' }}
                              >
                                <X size={11} />
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
        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                Lịch Sử Quét & Tự Động Neo Giá Theo Olive Young
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                AI tự động ghi nhận khi giá trên web Olive Young Hàn Quốc có đợt Flash Sale hoặc tăng giá
              </p>
            </div>
            <button
              disabled={isSyncingPrice}
              onClick={handleRunManualPriceSync}
              style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={isSyncingPrice ? 'spin-animation' : ''} />
              Quét Giá Ngay
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-ivory)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>Thời Gian</th>
                  <th style={{ padding: '8px 12px' }}>Tên Sản Phẩm</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Giá Cũ</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Giá Mới OY</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Biến Động</th>
                </tr>
              </thead>
              <tbody>
                {(!priceSyncLogs || priceSyncLogs.length === 0) ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>
                      Chưa có biến động giá nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  priceSyncLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{log.name}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', textDecoration: 'line-through', color: 'var(--text-light)' }}>₩{Number(log.oldPrice).toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>₩{Number(log.newPrice).toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.7rem',
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

      {/* ═══════════ MODAL SỬA & THÊM SẢN PHẨM TRỰC QUAN (VỚI Ô ẢNH ĐẠI DIỆN CỠ LỚN) ═══════════ */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '30px', paddingBottom: '30px', zIndex: 99999, overflowY: 'auto' }} onClick={() => setEditModal(null)}>
          <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: '18px', width: '100%', maxWidth: '880px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {editModal.isPending ? `Sửa Hàng Chờ: ${editModal.goodsNo}` : (editModal.isNew ? 'Thêm Sản Phẩm Mới Vào Kho' : `Chỉnh Sửa Sản Phẩm: ${editModal.goodsNo}`)}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Tải ảnh từ máy tính, thiết lập ảnh đại diện chính và chỉnh sửa giá tiền chi tiết
                </p>
              </div>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {/* 2-Column Main Form Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '20px' }}>

              {/* 📸 CỘT TRÁI: Ô ẢNH ĐẠI DIỆN CỠ LỚN & ALBUM PHỤ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* 1. Ô LỚN ẢNH ĐẠI DIỆN CHÍNH (FEATURED AVATAR BOX) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--purple-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill="var(--purple-primary)" /> ẢNH ĐẠI DIỆN CHÍNH *
                    </label>
                    {editForm.productImage && (
                      <button
                        type="button"
                        onClick={() => mainImageFileInputRef.current?.click()}
                        style={{ fontSize: '0.7rem', color: '#0284C7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Đổi ảnh khác
                      </button>
                    )}
                  </div>

                  {/* Big Image Box */}
                  <div
                    onClick={() => {
                      if (!editForm.productImage) mainImageFileInputRef.current?.click();
                    }}
                    style={{
                      width: '100%',
                      height: '240px',
                      borderRadius: '12px',
                      border: editForm.productImage ? '2px solid var(--purple-primary)' : '2px dashed #CBD5E1',
                      backgroundColor: editForm.productImage ? '#000' : 'var(--bg-ivory)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    {editForm.productImage ? (
                      <>
                        <img
                          src={editForm.productImage}
                          alt="Ảnh đại diện"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
                          <span style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFF', padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
                            ⭐ Ảnh Đại Diện
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              mainImageFileInputRef.current?.click();
                            }}
                            style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', pointerEvents: 'auto' }}
                          >
                            Thay ảnh
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EDE9FE', color: 'var(--purple-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                          <UploadCloud size={24} />
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                          Bấm để tải ảnh đại diện
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Hỗ trợ ảnh từ máy tính (PNG, JPG, WebP)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hidden Main Image File Input */}
                  <input
                    ref={mainImageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* 2. ALBUM ẢNH PHỤ & NÚT TẢI NHIỀU ẢNH */}
                <div style={{ backgroundColor: 'var(--bg-ivory)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                      📸 Album Ảnh ({((editForm.images || []).length)} ảnh)
                    </span>
                    <button
                      type="button"
                      onClick={() => albumFileInputRef.current?.click()}
                      style={{ backgroundColor: '#FFF', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Plus size={11} /> Thêm ảnh từ máy
                    </button>
                  </div>

                  {/* Hidden Album File Input */}
                  <input
                    ref={albumFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAlbumUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Sub-Images List */}
                  {(!editForm.images || editForm.images.length === 0) ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textAlign: 'center', padding: '10px' }}>
                      Chưa có ảnh nào trong album.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {editForm.images.map((imgUrl, i) => {
                        const isMain = editForm.productImage === imgUrl;
                        return (
                          <div
                            key={i}
                            style={{
                              position: 'relative',
                              width: '100%',
                              paddingTop: '100%',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: isMain ? '2px solid var(--purple-primary)' : '1px solid var(--border-color)',
                              cursor: 'pointer',
                              backgroundColor: '#FFF'
                            }}
                            onClick={() => handleSetMainAvatar(imgUrl)}
                            title="Bấm để chọn ảnh này làm Ảnh Đại Diện"
                          >
                            <img
                              src={imgUrl}
                              alt=""
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {isMain && (
                              <div style={{ position: 'absolute', bottom: '1px', left: '1px', right: '1px', backgroundColor: 'var(--purple-primary)', color: '#FFF', fontSize: '0.52rem', fontWeight: 800, textAlign: 'center', borderRadius: '2px' }}>
                                CHÍNH
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(imgUrl);
                              }}
                              style={{ position: 'absolute', top: '1px', right: '1px', backgroundColor: 'rgba(220,38,38,0.9)', color: '#FFF', border: 'none', borderRadius: '3px', width: '14px', height: '14px', fontSize: '0.55rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Form Chèn Link URL Trực Tiếp */}
                  <form onSubmit={handleAddImageUrl} style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <input
                      type="text"
                      placeholder="Hoặc dán link ảnh Web URL..."
                      value={urlInputVal}
                      onChange={(e) => setUrlInputVal(e.target.value)}
                      style={{ flex: 1, padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.72rem', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={!urlInputVal.trim()}
                      style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Thêm Link
                    </button>
                  </form>
                </div>

              </div>

              {/* 📝 CỘT PHẢI: THÔNG TIN SẢN PHẨM & GIÁ BÁN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mã sản phẩm</label>
                    <input
                      value={editForm.goodsNo || ''}
                      onChange={(e) => handleEditChange('goodsNo', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--purple-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Thương hiệu (Brand)</label>
                    <input
                      placeholder="Nhập tên thương hiệu (vd: Torriden, Anua, Sâm Cheong Kwan Jang...)"
                      value={editForm.brand || ''}
                      onChange={(e) => handleEditChange('brand', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '3px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tên sản phẩm (Tiếng Việt) *</label>
                  <input
                    placeholder="Nhập tên sản phẩm tiếng Việt..."
                    value={editForm.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', marginTop: '3px', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tên tiếng Hàn gốc (nếu có)</label>
                  <input
                    placeholder="Tên tiếng Hàn (Olive Young)..."
                    value={editForm.nameKr || ''}
                    onChange={(e) => handleEditChange('nameKr', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', marginTop: '3px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Danh mục *</label>
                    <select
                      value={editForm.category || 'cosmetics'}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', marginTop: '3px', fontWeight: 700 }}
                    >
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Giá Bán Won (₩) *</label>
                    <input
                      type="number"
                      placeholder="Nhập giá Won..."
                      value={editForm.foreignPrice ?? ''}
                      onChange={(e) => handleEditChange('foreignPrice', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', marginTop: '3px', fontWeight: 800, color: 'var(--purple-primary)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Giá Gốc Niêm Yết (₩)</label>
                    <input
                      type="number"
                      placeholder="Giá gốc trước sale..."
                      value={editForm.originalPrice ?? ''}
                      onChange={(e) => handleEditChange('originalPrice', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', marginTop: '3px' }}
                    />
                  </div>
                </div>

                {/* Quy đổi VNĐ trực tiếp */}
                {editForm.foreignPrice ? (
                  <div style={{ backgroundColor: '#F0FDF4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>
                      Giá bán ước tính sang VNĐ (Tỷ giá ₩: {krwRate}đ):
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803D' }}>
                      ≈ {Math.round(Number(editForm.foreignPrice) * krwRate * serviceFeeMultiplier).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                ) : null}

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mô tả chi tiết / Thành phần / Công dụng</label>
                  <textarea
                    placeholder="Nhập mô tả sản phẩm, cách sử dụng hoặc quy cách đóng gói..."
                    value={editForm.description || ''}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', marginTop: '3px', height: '65px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    style={{ padding: '7px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    style={{ padding: '7px 22px', borderRadius: '6px', backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Lưu Sản Phẩm
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ═══════════ MODAL BÁO CÁO ĐỐI CHIẾU GIÁ OLIVE YOUNG ═══════════ */}
      {priceSyncSummaryModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }} onClick={() => setPriceSyncSummaryModal(null)}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={18} color="#D97706" /> Báo Cáo Đối Chiếu Giá Olive Young
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Đã quét <strong>{priceSyncSummaryModal.totalScanned}</strong> sản phẩm | Cập nhật <strong>{priceSyncSummaryModal.updatedCount}</strong> sản phẩm có biến động giá
                </p>
              </div>
              <button onClick={() => setPriceSyncSummaryModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {priceSyncSummaryModal.changes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#059669' }}>
                  <CheckCircle2 size={40} style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Kho hàng đã khớp 100% với Olive Young Korea!</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-ivory)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '6px 10px' }}>Mã SP</th>
                      <th style={{ padding: '6px 10px' }}>Tên Sản Phẩm</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Giá Cũ</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Giá Mới OY</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center' }}>Chênh Lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceSyncSummaryModal.changes.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--purple-primary)' }}>{item.goodsNo}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-light)', textDecoration: 'line-through' }}>₩{item.oldPrice.toLocaleString()}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--purple-primary)' }}>₩{item.newPrice.toLocaleString()}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                          <span style={{ backgroundColor: item.diffWon < 0 ? '#DCFCE7' : '#FEE2E2', color: item.diffWon < 0 ? '#15803D' : '#DC2626', padding: '2px 6px', borderRadius: '8px', fontWeight: 800, fontSize: '0.68rem' }}>
                            {item.diffWon > 0 ? `+${item.diffWon.toLocaleString()}₩` : `${item.diffWon.toLocaleString()}₩`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setPriceSyncSummaryModal(null)} style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '6px 18px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
                Đóng Báo Cáo
              </button>
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
              style={{ position: 'absolute', top: '-32px', right: 0, background: 'none', border: 'none', color: '#FFF', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
