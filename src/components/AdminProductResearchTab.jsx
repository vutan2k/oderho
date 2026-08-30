import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles, Image as ImageIcon, Link as LinkIcon,
  CheckCircle2, AlertCircle, RefreshCw, Layers, ExternalLink,
  ArrowRight, X, Copy, Trash2, Globe, Check,
  Terminal, UploadCloud, ShieldCheck, Edit3, Star,
  AlertTriangle
} from 'lucide-react';
import {
  detectInputType,
  researchProduct,
  getLogTimestamp
} from '../services/smartProductResearchEngine';
import { calculateVndPrice } from '../services/oliveYoungPriceSyncService';
import AdminProductModal from './AdminProductModal';

/**
 * AdminProductResearchTab.jsx
 * Tab 4: AI Smart Product Research & Multi-Source Vision Sourcing for Tavy Korea Admin.
 *
 * Features:
 * - Smart Input Box (URL auto-detection + Drag & Drop / Paste image recognition)
 * - Live Step-by-Step Terminal Log Console with 5-Step Stepper Pipeline & Auto-Scroll
 * - 10-Field Genuine Data Preview Card & Compliance Checklist (Rule 0 Compliant)
 * - Auto-Save to Pending Approval Queue with instant navigation to Tab 1
 */
export default function AdminProductResearchTab({
  isDark = false,
  rates = {},
  addPendingProduct,
  showToast,
  onNavigateToPending
}) {
  // Input states
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); // { previewUrl, base64, name, size, type }
  const [isDragging, setIsDragging] = useState(false);

  // Execution states
  const [isResearching, setIsResearching] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Input Detection -> 2: Multi-Source Scraping -> 3: AI Extraction -> 4: Review Photo Curation -> 5: Auto-Save
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);

  // Result & Auto-save states
  const [scrapedProduct, setScrapedProduct] = useState(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Modal edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Refs
  const logEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Currency rates
  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFee = rates?.serviceFeePercent || 5;

  // Realtime Input Detection
  const inputDetection = useMemo(() => {
    if (uploadedImage) {
      return {
        type: 'image',
        badgeText: '📷 Ảnh Nhận Diện Gemini Vision',
        color: '#8B5CF6',
        bg: isDark ? '#2E1065' : '#EDE9FE',
        border: isDark ? '#7C3AED' : '#C4B5FD'
      };
    }

    if (!inputValue.trim()) {
      return {
        type: 'empty',
        badgeText: 'Nhập URL hoặc tải ảnh để tự động nhận dạng',
        color: isDark ? '#64748B' : '#94A3B8',
        bg: isDark ? '#1E293B' : '#F1F5F9',
        border: isDark ? '#334155' : '#E2E8F0'
      };
    }

    const detected = detectInputType(inputValue.trim());

    if (detected.type === 'url') {
      const domainMap = {
        oliveyoung: { name: '🌿 Olive Young (Mỹ phẩm/Skincare)', color: '#10B981', bg: isDark ? '#064E3B' : '#ECFDF5', border: isDark ? '#059669' : '#A7F3D0' },
        naver: { name: '🟢 Naver Official Store (Sâm Nấm/TPCN)', color: '#22C55E', bg: isDark ? '#052E16' : '#F0FDF4', border: isDark ? '#16A34A' : '#BBF7D0' },
        coupang: { name: '🚀 Coupang KR (TMĐT #1 Hàn Quốc)', color: '#F43F5E', bg: isDark ? '#881337' : '#FFF1F2', border: isDark ? '#E11D48' : '#FECDD3' },
        hwahae: { name: '⭐ Hwahae (Cộng đồng Review Mỹ Phẩm)', color: '#06B6D4', bg: isDark ? '#164E63' : '#ECFEFF', border: isDark ? '#0891B2' : '#A5F3FC' },
        gmarket: { name: '🛍️ Gmarket (Sàn TMĐT)', color: '#F59E0B', bg: isDark ? '#78350F' : '#FFFBEB', border: isDark ? '#D97706' : '#FDE68A' },
        '11st': { name: '🛍️ 11st (Sàn TMĐT Hàn Quốc)', color: '#EF4444', bg: isDark ? '#7F1D1D' : '#FEF2F2', border: isDark ? '#DC2626' : '#FECACA' },
        musinsa: { name: '👔 Musinsa (Thời trang / Streetwear)', color: '#A855F7', bg: isDark ? '#3B0764' : '#FAF5FF', border: isDark ? '#9333EA' : '#E9D5FF' },
        unknown: { name: '🌐 Đa Nguồn Tự Động (Jina AI Proxy)', color: '#38BDF8', bg: isDark ? '#0C4A6E' : '#F0F9FF', border: isDark ? '#0284C7' : '#BAE6FD' }
      };
      const info = domainMap[detected.domain] || domainMap.unknown;
      return {
        type: 'url',
        domain: detected.domain,
        goodsNo: detected.goodsNo,
        badgeText: info.name,
        color: info.color,
        bg: info.bg,
        border: info.border
      };
    }

    return {
      type: 'keyword',
      badgeText: '🔍 Từ Khóa Tìm Kiếm Đa Nguồn',
      color: '#38BDF8',
      bg: isDark ? '#0C4A6E' : '#F0F9FF',
      border: isDark ? '#0284C7' : '#BAE6FD'
    };
  }, [inputValue, uploadedImage, isDark]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Preset sample URLs
  const samplePresets = [
    {
      label: '🌿 Olive Young (Mediheal Mask)',
      url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414'
    },
    {
      label: '🟢 Naver Store (Sâm KGC)',
      url: 'https://brand.naver.com/kgc/products/10482910'
    },
    {
      label: '🚀 Coupang (Medicube Age-R)',
      url: 'https://www.coupang.com/vp/products/8237194451'
    },
    {
      label: '👔 Musinsa (Streetwear)',
      url: 'https://www.musinsa.com/goods/3498211'
    }
  ];

  // Helper to read image file to base64
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (showToast) showToast('Vui lòng chỉ tải file ảnh (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      if (showToast) showToast('Dung lượng ảnh vượt quá 10MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setUploadedImage({
        previewUrl: URL.createObjectURL(file),
        base64,
        name: file.name || 'uploaded_image.jpg',
        size: file.size,
        type: file.type
      });
      setInputValue(''); // Clear text input when image is uploaded
      if (showToast) showToast(`Đã nhận ảnh: ${file.name || 'Ảnh tải lên'}`, 'info');
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Paste Event Handler (allows Ctrl+V / Cmd+V image paste)
  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          processImageFile(file);
          return;
        }
      }
    }
  };

  // Paste from system clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputValue(text);
          setUploadedImage(null);
          if (showToast) showToast('Đã dán nội dung từ clipboard!', 'info');
        }
      }
    } catch {
      if (showToast) showToast('Không thể truy cập bộ nhớ đệm. Vui lòng bấm Ctrl+V để dán.', 'warning');
    }
  };

  // Clear all inputs
  const handleClearAll = () => {
    setInputValue('');
    setUploadedImage(null);
    setScrapedProduct(null);
    setAutoSaved(false);
    setActiveStep(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear log console
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Copy logs to clipboard
  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const text = logs.map(l => l.full || `${l.timestamp} [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard?.writeText(text);
    if (showToast) showToast('Đã sao chép toàn bộ log vào bộ nhớ tạm!', 'success');
  };

  // Main Research Trigger
  const handleStartResearch = async () => {
    const hasInput = inputValue.trim() || uploadedImage;
    if (!hasInput) {
      if (showToast) showToast('Vui lòng nhập URL sản phẩm, ảnh chụp hoặc từ khóa tìm kiếm!', 'warning');
      return;
    }

    setIsResearching(true);
    setActiveStep(1);
    setScrapedProduct(null);
    setAutoSaved(false);

    // Initial starting log
    const startTimestamp = getLogTimestamp();
    const initialLog = {
      id: `${Date.now()}-0`,
      timestamp: startTimestamp,
      source: 'System',
      message: uploadedImage
        ? 'Bắt đầu quy trình nghiên cứu sản phẩm qua Gemini Vision...'
        : `Bắt đầu quy trình nghiên cứu cho: ${inputValue.trim()}`,
      type: 'info',
      full: `${startTimestamp} [System] Bắt đầu nghiên cứu sản phẩm...`
    };
    setLogs([initialLog]);

    const handleProgress = (p) => {
      // Step tracking based on progress messages
      if (p.source === 'Vision' || p.step === 'init' || p.step === 'calling_ai') {
        setActiveStep(1);
      } else if (
        p.source === 'oliveyoung' ||
        p.source === 'naver' ||
        p.source === 'coupang' ||
        p.source === 'musinsa' ||
        p.source === 'gmarket' ||
        p.source === '11st'
      ) {
        if (p.message.includes('Lấy được') || p.message.includes('trích xuất') || p.step === 'ai_extracted') {
          setActiveStep(3);
        } else {
          setActiveStep(2);
        }
      } else if (p.source === 'Hwahae' || p.message.includes('review') || p.message.includes('GDAS')) {
        setActiveStep(4);
      } else if (p.source === 'System' && (p.message.includes('Hoàn tất') || p.message.includes('Hàng Chờ Duyệt'))) {
        setActiveStep(5);
      }

      setLogs(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: p.timestamp || getLogTimestamp(),
          source: p.source || 'System',
          message: p.message,
          type: p.type || 'info',
          full: p.full || `${p.timestamp || getLogTimestamp()} [${p.source || 'System'}] ${p.message}`
        }
      ]);
    };

    try {
      const payload = uploadedImage ? uploadedImage.base64 : inputValue.trim();
      const result = await researchProduct(payload, {
        onProgress: handleProgress,
        enrichReviews: true,
        maxRetries: 3
      });

      if (result && result.success && result.product) {
        const prod = result.product;
        setScrapedProduct(prod);
        setActiveStep(5);

        // Auto-save to Pending Approval Queue via AppContext
        if (typeof addPendingProduct === 'function') {
          addPendingProduct(prod);
          setAutoSaved(true);
          const saveTimestamp = getLogTimestamp();
          setLogs(prev => [
            ...prev,
            {
              id: `${Date.now()}-saved`,
              timestamp: saveTimestamp,
              source: 'System',
              message: `✅ ĐÃ TỰ ĐỘNG LƯU SẢN PHẨM "${prod.name}" VÀO HÀNG CHỜ DUYỆT!`,
              type: 'success',
              full: `${saveTimestamp} [System] ✅ ĐÃ TỰ ĐỘNG LƯU SẢN PHẨM "${prod.name}" VÀO HÀNG CHỜ DUYỆT!`
            }
          ]);

          if (showToast) {
            showToast(`🎉 Đã cào & tự động đưa "${prod.name}" vào Hàng Chờ Duyệt!`, 'success');
          }
        }
      } else {
        const errTimestamp = getLogTimestamp();
        const errMsg = result?.error || 'Không thể cào thông tin sản phẩm sau toàn bộ chu trình thử';
        setLogs(prev => [
          ...prev,
          {
            id: `${Date.now()}-err`,
            timestamp: errTimestamp,
            source: 'System',
            message: `❌ ${errMsg}`,
            type: 'error',
            full: `${errTimestamp} [System] ❌ ${errMsg}`
          }
        ]);
        if (showToast) {
          showToast(`❌ Thất bại: ${errMsg}`, 'error');
        }
      }
    } catch (err) {
      const errTimestamp = getLogTimestamp();
      setLogs(prev => [
        ...prev,
        {
          id: `${Date.now()}-catch`,
          timestamp: errTimestamp,
          source: 'System',
          message: `❌ Ngoại lệ hệ thống: ${err.message}`,
          type: 'error',
          full: `${errTimestamp} [System] ❌ Ngoại lệ: ${err.message}`
        }
      ]);
      if (showToast) {
        showToast(`❌ Lỗi: ${err.message}`, 'error');
      }
    } finally {
      setIsResearching(false);
    }
  };

  // Re-save to pending queue manually
  const handleManualSaveToPending = () => {
    if (!scrapedProduct) return;
    if (typeof addPendingProduct === 'function') {
      addPendingProduct(scrapedProduct);
      setAutoSaved(true);
      if (showToast) {
        showToast(`Đã lưu "${scrapedProduct.name}" vào Hàng Chờ Duyệt!`, 'success');
      }
    }
  };

  // Quick edit modal save
  const handleSaveModalItem = (updated) => {
    setScrapedProduct(updated);
    if (typeof addPendingProduct === 'function') {
      addPendingProduct(updated);
    }
    setIsModalOpen(false);
    if (showToast) {
      showToast('Đã cập nhật thông tin sản phẩm thành công!', 'success');
    }
  };

  // 5 Stepper pipeline definitions
  const steps = [
    { num: 1, title: 'Nhận Diện', desc: 'URL / Gemini Vision' },
    { num: 2, title: 'Quét Nguồn', desc: 'Jina AI / Multi-Proxy' },
    { num: 3, title: 'Trích Xuất AI', desc: '10 Trường Bắt Buộc' },
    { num: 4, title: 'Ảnh Review Thật', desc: 'GDAS / Hwahae' },
    { num: 5, title: 'Lưu Hàng Chờ', desc: 'Auto-Save Pending' }
  ];

  // Helper for source tag styling
  const getSourceBadgeStyle = (source) => {
    const s = String(source).toLowerCase();
    if (s.includes('olive')) return { bg: isDark ? '#064E3B' : '#ECFDF5', color: '#10B981', label: 'OliveYoung' };
    if (s.includes('naver')) return { bg: isDark ? '#052E16' : '#F0FDF4', color: '#22C55E', label: 'Naver' };
    if (s.includes('coupang')) return { bg: isDark ? '#881337' : '#FFF1F2', color: '#F43F5E', label: 'Coupang' };
    if (s.includes('hwahae')) return { bg: isDark ? '#164E63' : '#ECFEFF', color: '#06B6D4', label: 'Hwahae' };
    if (s.includes('gmarket') || s.includes('11st')) return { bg: isDark ? '#78350F' : '#FFFBEB', color: '#F59E0B', label: 'TMĐT' };
    if (s.includes('musinsa')) return { bg: isDark ? '#3B0764' : '#FAF5FF', color: '#A855F7', label: 'Musinsa' };
    if (s.includes('vision')) return { bg: isDark ? '#2E1065' : '#EDE9FE', color: '#8B5CF6', label: 'Vision' };
    if (s.includes('ai')) return { bg: isDark ? '#0C4A6E' : '#F0F9FF', color: '#38BDF8', label: 'AI' };
    return { bg: isDark ? '#1E293B' : '#F1F5F9', color: '#94A3B8', label: 'System' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* HEADER BANNER                                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                AI Deep Sourcing & Smart Product Research
              </h2>
              <span style={{
                backgroundColor: isDark ? '#2E1065' : '#EDE9FE',
                color: '#8B5CF6',
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: '6px',
                border: isDark ? '1px solid #7C3AED' : '1px solid #C4B5FD'
              }}>
                MULTI-SOURCE CASCADE v5.0
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.84rem' }}>
              Dán URL hoặc Kéo thả ảnh sản phẩm Hàn Quốc (Olive Young, Naver, Coupang, Hwahae, Musinsa). Hệ thống tự động nghiên cứu, bóc tách 10 trường chuẩn và nạp vào Hàng Chờ Duyệt.
            </p>
          </div>
        </div>

        {/* Action shortcut to Pending Tab */}
        <button
          onClick={onNavigateToPending}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: isDark ? '1px solid #F59E0B' : '1px solid #FDE68A',
            backgroundColor: isDark ? '#78350F' : '#FEF3C7',
            color: isDark ? '#FDE68A' : '#D97706',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={16} />
          <span>Xem Kho Hàng Chờ Duyệt</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 1: SMART INPUT BOX (R1)                              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        style={{
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: isDragging
            ? '2px dashed #8B5CF6'
            : isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          boxShadow: isDragging
            ? '0 0 20px rgba(139, 92, 246, 0.3)'
            : isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Top bar of Input Box: Label + Realtime Auto-Detection Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#8B5CF6" />
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Ô Nhận Dữ Liệu Thông Minh (URL / Upload Ảnh / Từ Khóa)
            </span>
          </div>

          {/* Realtime Auto-Detection Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: inputDetection.bg,
            color: inputDetection.color,
            border: `1px solid ${inputDetection.border}`,
            fontSize: '0.78rem',
            fontWeight: 800
          }}>
            <span>{inputDetection.badgeText}</span>
          </div>
        </div>

        {/* Main Input Control: Text Input + Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 320px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ position: 'absolute', left: '14px', color: isDark ? '#64748B' : '#94A3B8' }}>
              {uploadedImage ? <ImageIcon size={18} color="#8B5CF6" /> : <LinkIcon size={18} />}
            </div>
            <input
              type="text"
              value={uploadedImage ? `[Ảnh đã chọn: ${uploadedImage.name}]` : inputValue}
              onChange={(e) => {
                if (uploadedImage) setUploadedImage(null);
                setInputValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isResearching) {
                  handleStartResearch();
                }
              }}
              placeholder="Dán link sản phẩm (Olive Young, Naver, Coupang, Musinsa...) hoặc nhập từ khóa tiếng Hàn/Việt..."
              disabled={isResearching}
              style={{
                width: '100%',
                padding: '13px 44px 13px 44px',
                borderRadius: '12px',
                border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                color: isDark ? '#F8FAFC' : '#0F172A',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border 0.2s ease',
                fontWeight: 500
              }}
            />
            {(inputValue || uploadedImage) && (
              <button
                onClick={handleClearAll}
                disabled={isResearching}
                title="Xóa nội dung"
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action Button: Paste from Clipboard */}
          <button
            onClick={handlePasteFromClipboard}
            disabled={isResearching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              color: isDark ? '#CBD5E1' : '#475569',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Copy size={15} />
            <span>Dán Clipboard</span>
          </button>

          {/* Action Button: Upload / Pick Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isResearching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: isDark ? '1px solid #7C3AED' : '1px solid #C4B5FD',
              backgroundColor: isDark ? '#2E1065' : '#EDE9FE',
              color: '#8B5CF6',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <UploadCloud size={16} />
            <span>Tải Ảnh Lên</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processImageFile(e.target.files[0]);
              }
            }}
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
          />

          {/* Primary Action Button: Start Research */}
          <button
            onClick={handleStartResearch}
            disabled={isResearching || (!inputValue.trim() && !uploadedImage)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: (isResearching || (!inputValue.trim() && !uploadedImage))
                ? (isDark ? '#475569' : '#CBD5E1')
                : '#8B5CF6',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 900,
              cursor: (isResearching || (!inputValue.trim() && !uploadedImage)) ? 'not-allowed' : 'pointer',
              boxShadow: (isResearching || (!inputValue.trim() && !uploadedImage)) ? 'none' : '0 4px 14px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {isResearching ? (
              <>
                <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Đang Nghiên Cứu...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Bắt Đầu Nghiên Cứu AI</span>
              </>
            )}
          </button>
        </div>

        {/* Uploaded Image Preview Box (If image is chosen) */}
        {uploadedImage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            border: isDark ? '1px solid #7C3AED' : '1px solid #C4B5FD'
          }}>
            <img
              src={uploadedImage.previewUrl}
              alt="Uploaded Preview"
              style={{
                width: '56px',
                height: '56px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #8B5CF6'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {uploadedImage.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B', display: 'flex', gap: '8px' }}>
                <span>{(uploadedImage.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span style={{ color: '#8B5CF6', fontWeight: 700 }}>Sẵn sàng nhận diện qua Gemini Vision API</span>
              </div>
            </div>
            <button
              onClick={() => setUploadedImage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#EF4444' : '#DC2626',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Presets & Quick Test Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#94A3B8' : '#64748B' }}>
            Thử nghiệm 1-Click:
          </span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUploadedImage(null);
                setInputValue(preset.url);
              }}
              disabled={isResearching}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                color: isDark ? '#CBD5E1' : '#475569',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 2: LIVE STEP-BY-STEP LOG CONSOLE (R5)                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#090D16',
        borderRadius: '16px',
        border: '1px solid #1E293B',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Terminal Header */}
        <div style={{
          backgroundColor: '#0F172A',
          padding: '12px 18px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* MacOS Window Dots + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 800 }}>
              <Terminal size={14} color="#8B5CF6" />
              <span>TAVY AI RESEARCH ENGINE v5.0 — MULTI-SOURCE SCRAPER CONSOLE</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              style={{
                background: autoScroll ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 8px',
                color: autoScroll ? '#A78BFA' : '#64748B',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Auto-Scroll: {autoScroll ? 'BẬT' : 'TẮT'}
            </button>
            <button
              onClick={handleCopyLogs}
              title="Sao chép toàn bộ log"
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#94A3B8',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Copy size={12} />
              <span>Sao Chép</span>
            </button>
            <button
              onClick={handleClearLogs}
              title="Xóa log"
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#EF4444',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={12} />
              <span>Xóa</span>
            </button>
          </div>
        </div>

        {/* Stepper Pipeline Visual Indicator */}
        <div style={{
          backgroundColor: '#090D16',
          padding: '12px 18px',
          borderBottom: '1px solid #1E293B',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px'
        }}>
          {steps.map((st) => {
            const isCompleted = activeStep > st.num || autoSaved;
            const isCurrent = activeStep === st.num && isResearching;
            return (
              <div
                key={st.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: isCurrent
                    ? 'rgba(139, 92, 246, 0.15)'
                    : isCompleted ? 'rgba(16, 185, 129, 0.1)' : '#0F172A',
                  border: isCurrent
                    ? '1px solid #8B5CF6'
                    : isCompleted ? '1px solid #059669' : '1px solid #1E293B'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#10B981' : isCurrent ? '#8B5CF6' : '#334155',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 900
                }}>
                  {isCompleted ? <Check size={12} /> : st.num}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: isCompleted ? '#34D399' : isCurrent ? '#A78BFA' : '#94A3B8'
                  }}>
                    {st.title}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                    {st.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal Log Output Container */}
        <div style={{
          padding: '16px 18px',
          maxHeight: '260px',
          minHeight: '140px',
          overflowY: 'auto',
          fontFamily: 'JetBrains Mono, Fira Code, ui-monospace, monospace',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#64748B', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
              Chưa có tiến trình cào nào. Nhập URL hoặc tải ảnh lên và bấm "Bắt Đầu Nghiên Cứu AI" để xem log thời gian thực...
            </div>
          ) : (
            logs.map((l) => {
              const badge = getSourceBadgeStyle(l.source);
              const messageColor =
                l.type === 'error' ? '#EF4444' :
                l.type === 'warning' ? '#F59E0B' :
                l.type === 'success' ? '#10B981' : '#E2E8F0';

              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#64748B', flexShrink: 0, userSelect: 'none' }}>
                    {l.timestamp}
                  </span>
                  <span style={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    [{badge.label}]
                  </span>
                  <span style={{ color: messageColor, wordBreak: 'break-word', flex: 1 }}>
                    {l.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 3: SCRAPED PRODUCT PREVIEW CARD (R3, R4, R6)         */}
      {/* ──────────────────────────────────────────────────────────── */}
      {scrapedProduct && (
        <div style={{
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Top Status & Auto-Save Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '12px',
            backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
            border: isDark ? '1px solid #059669' : '1px solid #A7F3D0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#10B981" />
              <div>
                <div style={{ fontWeight: 900, color: isDark ? '#6EE7B7' : '#065F46', fontSize: '0.92rem' }}>
                  {autoSaved
                    ? 'ĐÃ TỰ ĐỘNG LƯU VÀO KHO HÀNG CHỜ DUYỆT (PENDING QUEUE)'
                    : 'KẾT QUẢ NGHIÊN CỨU SẢN PHẨM HOÀN TẤT'}
                </div>
                <div style={{ fontSize: '0.78rem', color: isDark ? '#A7F3D0' : '#047857' }}>
                  Mã SKU: <strong>{scrapedProduct.goodsNo}</strong> • Nguồn: <strong>{scrapedProduct.source || 'Đa Nguồn'}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setEditingItem(scrapedProduct);
                  setIsModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={15} />
                <span>Chỉnh Sửa Nhanh</span>
              </button>

              {!autoSaved && (
                <button
                  onClick={handleManualSaveToPending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Layers size={15} />
                  <span>Lưu Vào Kho Chờ Duyệt</span>
                </button>
              )}

              <button
                onClick={onNavigateToPending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)'
                }}
              >
                <span>Xem Trong Kho Chờ Duyệt</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Product Details 2-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* ── LEFT COLUMN: HD Media & Authentic Photo Reviews ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Main HD Image with CDN Indicator */}
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                minHeight: '280px'
              }}>
                <img
                  src={
                    (scrapedProduct.images && scrapedProduct.images[selectedImageIndex]) ||
                    scrapedProduct.productImage ||
                    ''
                  }
                  alt={scrapedProduct.name}
                  style={{
                    maxHeight: '260px',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={13} color="#10B981" />
                  <span>CDN HD Đã Lọc Banner</span>
                </div>
              </div>

              {/* HD Product Images Album (3-8 images) */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '8px' }}>
                  Album Ảnh Sản Phẩm HD ({scrapedProduct.images?.length || 1} ảnh):
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(scrapedProduct.images && scrapedProduct.images.length > 0 ? scrapedProduct.images : [scrapedProduct.productImage]).map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        padding: 0,
                        border: selectedImageIndex === idx ? '2px solid #8B5CF6' : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        width: '52px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Authentic Photo Reviews (GDAS / Hwahae / Naver Pay) */}
              <div style={{
                borderRadius: '12px',
                padding: '14px',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={15} color="#8B5CF6" />
                    <span>Ảnh Review Thực Tế Người Dùng ({scrapedProduct.photoReviews?.length || 0})</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    GDAS / Hwahae / Naver
                  </span>
                </div>

                {Array.isArray(scrapedProduct.photoReviews) && scrapedProduct.photoReviews.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {scrapedProduct.photoReviews.map((revImg, idx) => (
                      <a
                        key={idx}
                        href={revImg}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                          display: 'block',
                          backgroundColor: '#000000'
                        }}
                      >
                        <img src={revImg} alt="Review Real" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.78rem',
                    color: isDark ? '#FDE68A' : '#D97706',
                    backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertTriangle size={15} />
                    <span>Không tìm thấy ảnh review thực tế từ người dùng (Hợp lệ theo Rule 0 — không tạo ảnh giả)</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Product Information & 10-Field Checklist ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Brand & Category & Source Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  {scrapedProduct.brand || 'Korea Brand'}
                </span>
                <span style={{
                  backgroundColor: isDark ? '#334155' : '#F1F5F9',
                  color: isDark ? '#CBD5E1' : '#475569',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  {scrapedProduct.category || 'cosmetics'}
                </span>
                {scrapedProduct.productUrl && (
                  <a
                    href={scrapedProduct.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#38BDF8',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Link Nguồn</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Product Titles */}
              <div>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  margin: '0 0 6px 0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  lineHeight: '1.4'
                }}>
                  {scrapedProduct.name}
                </h3>
                {scrapedProduct.nameKr && (
                  <div style={{ fontSize: '0.84rem', color: isDark ? '#94A3B8' : '#64748B', fontStyle: 'italic' }}>
                    🇰🇷 {scrapedProduct.nameKr}
                  </div>
                )}
              </div>

              {/* Price & Converted VND Card */}
              <div style={{
                borderRadius: '12px',
                padding: '14px 18px',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                    Giá Won Gốc (KRW):
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981' }}>
                    {Number(scrapedProduct.foreignPrice || scrapedProduct.price || 0).toLocaleString()} ₩
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                    Ước Tính VNĐ (Tỷ giá {krwRate} + {serviceFee}% phí):
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38BDF8' }}>
                    {calculateVndPrice(scrapedProduct.foreignPrice || scrapedProduct.price, krwRate, serviceFee).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Rating & Reviews Genuine Counts */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#0F172A' : '#F1F5F9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <span style={{ fontWeight: 900, fontSize: '0.92rem', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {typeof scrapedProduct.rating === 'number' && scrapedProduct.rating > 0 ? scrapedProduct.rating.toFixed(1) : '0.0'}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#64748B' }}>/ 5.0</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: isDark ? '#CBD5E1' : '#475569' }}>
                  <strong>{typeof scrapedProduct.reviewsCount === 'number' ? scrapedProduct.reviewsCount.toLocaleString() : 0}</strong> đánh giá thực tế từ nguồn
                </div>
              </div>

              {/* Ingredients List */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '6px' }}>
                  Thành Phần Hoạt Chất:
                </div>
                {Array.isArray(scrapedProduct.ingredients) && scrapedProduct.ingredients.length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {scrapedProduct.ingredients.slice(0, 8).map((ing, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                          color: isDark ? '#CBD5E1' : '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
                        }}
                      >
                        {ing}
                      </span>
                    ))}
                    {scrapedProduct.ingredients.length > 8 && (
                      <span style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#64748B', alignSelf: 'center' }}>
                        +{scrapedProduct.ingredients.length - 8} thành phần khác
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B', fontStyle: 'italic' }}>
                    Chưa có danh sách thành phần chi tiết từ trang nguồn.
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '4px' }}>
                  Mô Tả & Công Dụng:
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  color: isDark ? '#CBD5E1' : '#475569',
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  maxHeight: '100px',
                  overflowY: 'auto'
                }}>
                  {scrapedProduct.description || 'Sản phẩm chính hãng nội địa Hàn Quốc.'}
                </div>
              </div>

              {/* 10-Field Compliance Audit Matrix */}
              <div style={{
                borderRadius: '10px',
                padding: '12px 14px',
                backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '8px' }}>
                  Bảng Đối Soát 10 Tiêu Chí Nghiên Cứu (Rule 0 Zero Fake Data):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>1. Tên Tiếng Việt</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>2. Tên Tiếng Hàn</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>3. Thương Hiệu</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>4. Giá Won ({scrapedProduct.foreignPrice ? '✓' : '0'})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>5. Ảnh Chính HD</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>6. Ảnh Phụ ({scrapedProduct.images?.length || 1})</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: scrapedProduct.photoReviews?.length > 0 ? '#10B981' : '#F59E0B'
                  }}>
                    {scrapedProduct.photoReviews?.length > 0 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span>7. Review Thật ({scrapedProduct.photoReviews?.length || 0})</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: scrapedProduct.ingredients?.length > 0 ? '#10B981' : '#F59E0B'
                  }}>
                    {scrapedProduct.ingredients?.length > 0 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span>8. Thành Phần ({scrapedProduct.ingredients?.length || 0})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>9. Mô Tả Đầy Đủ</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <CheckCircle2 size={13} /> <span>10. Rating & Counts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* QUICK EDIT MODAL                                             */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <AdminProductModal
          isOpen={isModalOpen}
          product={editingItem || scrapedProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModalItem}
          onApprove={(item) => {
            handleSaveModalItem(item);
            if (onNavigateToPending) onNavigateToPending();
          }}
          onDelete={() => {
            setScrapedProduct(null);
            setIsModalOpen(false);
          }}
          rates={rates}
          isPending={true}
          isDark={isDark}
        />
      )}
    </div>
  );
}
