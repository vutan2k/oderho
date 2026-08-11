import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { fetchProductsFromGoogleSheet, DEFAULT_USER_GOOGLE_SHEET_URL } from '../services/googleSheetService';
import { scrapeProductMetadata } from '../services/productScraperService';
import { FileSpreadsheet, RefreshCw, Plus, Trash2, Save, Download, Copy, Check, Sparkles, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminSpreadsheetEditor() {
  const { products, setProducts, rates } = useContext(AppContext);
  const showToast = useToast();

  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('tavy_google_sheet_url') || DEFAULT_USER_GOOGLE_SHEET_URL);
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [quickLink, setQuickLink] = useState('');
  const [scrapedPreview, setScrapedPreview] = useState(null);
  const [gridData, setGridData] = useState(() => JSON.parse(JSON.stringify(products)));
  const [copiedSheetData, setCopiedSheetData] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  // Synchronize from Google Sheet URL
  const handleSyncFromSheet = async () => {
    if (!sheetUrl.trim()) {
      if (showToast) showToast('Vui lòng nhập đường link Google Trang Tính!', 'error');
      return;
    }

    setLoadingSync(true);
    const res = await fetchProductsFromGoogleSheet(sheetUrl.trim());
    setLoadingSync(false);

    if (res.success) {
      localStorage.setItem('tavy_google_sheet_url', sheetUrl.trim());
      setGridData(res.products);
      setProducts(res.products);
      if (showToast) showToast(`Đã đồng bộ thành công ${res.count} sản phẩm từ Google Sheet!`, 'success');
    } else {
      if (showToast) showToast(`Đồng bộ thất bại: ${res.error}`, 'error');
    }
  };

  // Quick product URL auto-extract & preview
  const handleAutoScrapeProductLink = async (e) => {
    e.preventDefault();
    if (!quickLink.trim()) {
      if (showToast) showToast('Vui lòng dán đường dẫn sản phẩm Hàn Quốc!', 'error');
      return;
    }

    setLoadingScrape(true);
    setScrapedPreview(null);
    if (showToast) showToast('Agent đang bóc tách thông tin & ảnh HD từ link Hàn Quốc...', 'info');

    const res = await scrapeProductMetadata(quickLink.trim());
    setLoadingScrape(false);

    if (res.success && res.product) {
      setScrapedPreview(res.product);
      if (showToast) showToast('Đã bóc tách dữ liệu sản phẩm thành công! Kiểm tra thẻ xem trước bên dưới.', 'success');
    } else {
      if (showToast) showToast(`Không thể cào dữ liệu: ${res.error}`, 'error');
    }
  };

  // Confirm and Push Scraped Product to Grid & Website
  const handleConfirmPushScrapedProduct = () => {
    if (!scrapedPreview) return;
    const updated = [scrapedPreview, ...gridData];
    setGridData(updated);
    setProducts(updated);
    localStorage.setItem('tavy_custom_products', JSON.stringify(updated));
    setScrapedPreview(null);
    setQuickLink('');
    if (showToast) showToast('Đã đẩy sản phẩm mới 100% lên Website thành công!', 'success');
  };

  // Update cell value directly
  const handleCellChange = (index, field, value) => {
    const updated = [...gridData];
    updated[index] = {
      ...updated[index],
      [field]: field === 'foreignPrice' ? (parseFloat(value) || 0) : value
    };
    setGridData(updated);
  };

  // Add new empty row
  const handleAddRow = () => {
    const newRow = {
      goodsNo: `SP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'Sản phẩm mới',
      brand: 'TAVY Official',
      category: 'skincare',
      foreignPrice: 20000,
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      description: 'Mô tả sản phẩm mới...',
      origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 5.0,
      productUrl: '',
      reviewsCount: 10
    };
    setGridData([newRow, ...gridData]);
    if (showToast) showToast('Đã thêm 1 hàng mới vào bảng!', 'info');
  };

  // Delete row
  const handleDeleteRow = (index) => {
    const updated = gridData.filter((_, i) => i !== index);
    setGridData(updated);
    setProducts(updated);
    if (showToast) showToast('Đã xóa hàng khỏi bảng', 'info');
  };

  // Save all grid changes to App state / Local storage
  const handleSaveGrid = () => {
    setProducts(gridData);
    localStorage.setItem('tavy_custom_products', JSON.stringify(gridData));
    if (showToast) showToast('Đã lưu toàn bộ danh mục sản phẩm mới thành công 100%!', 'success');
  };

  // Copy all products in TSV format (Tab Separated) to paste straight into Google Sheets A1 cell
  const handleCopyForGoogleSheet = () => {
    const titleHeader = "DANH SÁCH HÀNG HOÁ TAVY KOREA\t\t\t\t\t\t\t\t\t\t\t\n";
    const colHeader = "STT\tMÃ SẢN PHẨM\tTÊN SẢN PHẨM\tTHƯƠNG HIỆU\tPHÂN LOẠI\tẢNH SẢN PHẨM\tMÔ TẢ, GHI CHÚ SẢN PHẨM\tXUẤT SỨ\tGIÁ THÀNH(VNĐ)\tGIÁ THÀNH(WON)\tĐÁNH GIÁ\tLINK SẢN PHẨM HÀN QUỐC (DÁN LINK VÀO ĐÂY ĐỂ CÀO AUTO)\n";

    const rowsText = gridData.map((p, idx) => {
      const vnd = p.explicitVndPrice || Math.round((p.foreignPrice || 0) * krwRate);
      return `${idx + 1}\t${p.goodsNo || ''}\t${p.name || ''}\t${p.brand || ''}\t${p.category || 'skincare'}\t${p.productImage || ''}\t${p.description || ''}\t${p.origin || 'Korea'}\t${vnd}\t${p.foreignPrice || 0}\t${p.rating || 4.9}\t${p.productUrl || ''}`;
    }).join('\n');

    const fullSheetText = titleHeader + colHeader + rowsText;
    navigator.clipboard.writeText(fullSheetText);
    setCopiedSheetData(true);
    if (showToast) showToast('Đã sao chép toàn bộ dữ liệu 100%! Mở Google Sheet dán Ctrl+V vào ô A1.', 'success');
    setTimeout(() => setCopiedSheetData(false), 3000);
  };

  // Download CSV file
  const handleDownloadCSV = () => {
    const titleHeader = "DANH SÁCH HÀNG HOÁ TAVY KOREA,,,,,,,,,,,";
    const colHeader = "STT,MÃ SẢN PHẨM,TÊN SẢN PHẨM,THƯƠNG HIỆU,PHÂN LOẠI,ẢNH SẢN PHẨM,MÔ TẢ, GHI CHÚ SẢN PHẨM,XUẤT SỨ,GIÁ THÀNH(VNĐ),GIÁ THÀNH(WON),ĐÁNH GIÁ,LINK SẢN PHẨM HÀN QUỐC";

    const rowsCsv = gridData.map((p, idx) => {
      const vnd = p.explicitVndPrice || Math.round((p.foreignPrice || 0) * krwRate);
      const cleanDesc = `"${(p.description || '').replace(/"/g, '""')}"`;
      const cleanName = `"${(p.name || '').replace(/"/g, '""')}"`;
      return `${idx + 1},${p.goodsNo || ''},${cleanName},${p.brand || ''},${p.category || 'skincare'},${p.productImage || ''},${cleanDesc},${p.origin || 'Korea'},${vnd},${p.foreignPrice || 0},${p.rating || 4.9},${p.productUrl || ''}`;
    }).join('\n');

    const csvContent = "\uFEFF" + titleHeader + "\n" + colHeader + "\n" + rowsCsv;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TAVY_KOREA_DANH_SACH_HANG_HOA.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Đã tải xuống tệp TAVY_KOREA_DANH_SACH_HANG_HOA.csv!', 'info');
  };

  return (
    <div style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
      
      {/* Ô Nhập Quick Link Sản Phẩm Cho Agent Cào Auto Mắt & Tay */}
      <div style={{ backgroundColor: '#FEF3C7', border: '1.5px solid #F59E0B', borderRadius: '14px', padding: '18px 20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} />
          AGENT BROWSER VISION ("MẮT & TAY" - CUỘN & CLICK CÀO DỮ LIỆU CHÍNH XÁC 100%)
        </h3>
        <p style={{ fontSize: '0.83rem', color: '#92400E', margin: '0 0 12px 0' }}>
          Agent được trang bị "Mắt & Tay" để tự mở trình duyệt, cuộn trang, click chuyển Tab và trích xuất đúng 100% Ảnh HD, Tên, Thương hiệu và Giá Won ₩ từ Olive Young / Naver / Coupang.
        </p>

        <form onSubmit={handleAutoScrapeProductLink} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="url"
              className="input"
              style={{ width: '100%', paddingLeft: '36px', backgroundColor: '#FFF' }}
              placeholder="Dán link sản phẩm Olive Young / Hàn Quốc vào đây..."
              value={quickLink}
              onChange={(e) => setQuickLink(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loadingScrape}
            className="btn-gold"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            {loadingScrape ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{loadingScrape ? 'AGENT ĐANG BẮT ĐẦU CÀO...' : 'KÍCH HOẠT AGENT BROWSER VISION'}</span>
          </button>
        </form>

        {/* Live Scraped Preview Card */}
        {scrapedPreview && (
          <div style={{ marginTop: '16px', backgroundColor: '#FFF', border: '2px solid #10B981', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={scrapedPreview.productImage}
              alt={scrapedPreview.name}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E7EB' }}
            />
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '12px' }}>
                  {scrapedPreview.brand}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Mã: {scrapedPreview.goodsNo}</span>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#111827', fontWeight: 700 }}>
                {scrapedPreview.name}
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--purple-primary)', fontWeight: 700 }}>
                Giá Won: {scrapedPreview.foreignPrice.toLocaleString()} ₩ ({formatVnd(Math.round(scrapedPreview.foreignPrice * krwRate))})
              </div>
            </div>
            <button
              onClick={handleConfirmPushScrapedProduct}
              className="btn-primary"
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', backgroundColor: '#10B981' }}
            >
              <CheckCircle2 size={16} />
              <span>XÁC NHẬN & PUSH LÊN WEBSITE</span>
            </button>
          </div>
        )}
      </div>

      {/* Header Sync Bar */}
      <div style={{ backgroundColor: '#FDFBFF', border: '1.5px solid var(--purple-primary)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: 'var(--purple-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={20} />
          ĐỒNG BỘ DỮ LIỆU TỪ GOOGLE TRANG TÍNH (GOOGLE SHEET)
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 14px 0' }}>
          Nhập đường dẫn Google Sheet công khai. Website và Admin sẽ đồng bộ 100% nguyên bản dữ liệu.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            type="url"
            className="input"
            style={{ flex: 1, minWidth: '280px' }}
            placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
          />
          <button
            onClick={handleSyncFromSheet}
            disabled={loadingSync}
            className="btn-gold"
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={loadingSync ? 'animate-spin' : ''} />
            <span>{loadingSync ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ 100%'}</span>
          </button>
        </div>

        {/* Quick Export / Copy Tools for Google Sheet */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px dashed rgba(122, 75, 158, 0.3)' }}>
          <button
            onClick={handleCopyForGoogleSheet}
            className="btn-outline"
            style={{ backgroundColor: '#FFF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', borderColor: 'var(--purple-primary)', color: 'var(--purple-primary)' }}
          >
            {copiedSheetData ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
            <span>{copiedSheetData ? 'ĐÃ SAO CHÉP DỮ LIỆU!' : '1-CLICK SAO CHÉP DÁN VÀO GOOGLE SHEET (DÁN CELL A1)'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="btn-outline"
            style={{ backgroundColor: '#FFF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Download size={16} />
            <span>TẢI TỆP MẪU GOOGLE SHEET (.CSV)</span>
          </button>
        </div>

      </div>

      {/* Grid Action Tools */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: 700 }}>
            BẢNG CHỈNH SỬA SẢN PHẨM TRỰC QUAN ({gridData.length} sản phẩm)
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Dữ liệu Admin và Website đồng bộ 100% giống nhau</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleAddRow} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Plus size={16} />
            <span>Thêm Hàng Mới</span>
          </button>

          <button onClick={handleSaveGrid} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Save size={16} />
            <span>LƯU DỮ LIỆU</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Grid */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB', color: '#374151', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 14px', textAlign: 'center', width: '50px' }}>STT</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', width: '110px' }}>Mã SP</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: '220px' }}>Tên Sản Phẩm</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', width: '130px' }}>Thương Hiệu</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', width: '120px' }}>Danh Mục</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', width: '120px' }}>Giá Won (₩)</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', width: '130px' }}>Quy Đổi VNĐ (đ)</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', width: '70px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {gridData.map((prod, idx) => {
              const vndVal = prod.explicitVndPrice || Math.round((prod.foreignPrice || 0) * krwRate);

              return (
                <tr key={prod.goodsNo || idx} style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: idx % 2 === 0 ? '#FFF' : '#FDFBF7' }}>
                  
                  {/* STT */}
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#9CA3AF', fontWeight: 600 }}>
                    {idx + 1}
                  </td>

                  {/* Mã SP */}
                  <td style={{ padding: '8px 10px' }}>
                    <input
                      type="text"
                      value={prod.goodsNo || ''}
                      onChange={(e) => handleCellChange(idx, 'goodsNo', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace' }}
                    />
                  </td>

                  {/* Tên SP */}
                  <td style={{ padding: '8px 10px' }}>
                    <input
                      type="text"
                      value={prod.name || ''}
                      onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
                    />
                  </td>

                  {/* Thương Hiệu */}
                  <td style={{ padding: '8px 10px' }}>
                    <input
                      type="text"
                      value={prod.brand || ''}
                      onChange={(e) => handleCellChange(idx, 'brand', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.82rem' }}
                    />
                  </td>

                  {/* Danh Mục */}
                  <td style={{ padding: '8px 10px' }}>
                    <select
                      value={prod.category || 'skincare'}
                      onChange={(e) => handleCellChange(idx, 'category', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.82rem' }}
                    >
                      <option value="skincare">Mỹ phẩm dưỡng da</option>
                      <option value="makeup">Mỹ phẩm trang điểm</option>
                      <option value="health">Thực phẩm chức năng</option>
                      <option value="pharmacy">Thuốc hiệu thuốc</option>
                    </select>
                  </td>

                  {/* Giá Won */}
                  <td style={{ padding: '8px 10px' }}>
                    <input
                      type="number"
                      value={prod.foreignPrice || 0}
                      onChange={(e) => handleCellChange(idx, 'foreignPrice', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--purple-primary)' }}
                    />
                  </td>

                  {/* Giá VNĐ Tự Động Quy Đổi */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                    {formatVnd(vndVal)}
                  </td>

                  {/* Xóa Hàng */}
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteRow(idx)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                      title="Xóa hàng này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
