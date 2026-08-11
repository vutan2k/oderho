import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { fetchProductsFromGoogleSheet, DEFAULT_USER_GOOGLE_SHEET_URL } from '../services/googleSheetService';
import { FileSpreadsheet, RefreshCw, Plus, Trash2, Save } from 'lucide-react';

export default function AdminSpreadsheetEditor() {
  const { products, setProducts, rates } = useContext(AppContext);
  const showToast = useToast();

  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('tavy_google_sheet_url') || DEFAULT_USER_GOOGLE_SHEET_URL);
  const [loadingSync, setLoadingSync] = useState(false);
  const [gridData, setGridData] = useState(() => JSON.parse(JSON.stringify(products)));

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
      reviewsCount: 10
    };
    setGridData([newRow, ...gridData]);
    if (showToast) showToast('Đã thêm 1 hàng mới vào bảng!', 'info');
  };

  // Delete row
  const handleDeleteRow = (index) => {
    const updated = gridData.filter((_, i) => i !== index);
    setGridData(updated);
    if (showToast) showToast('Đã xóa hàng khỏi bảng', 'info');
  };

  // Save all grid changes to App state / Local storage
  const handleSaveGrid = () => {
    setProducts(gridData);
    localStorage.setItem('tavy_custom_products', JSON.stringify(gridData));
    if (showToast) showToast('Đã lưu toàn bộ danh mục sản phẩm mới thành công!', 'success');
  };

  return (
    <div style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
      
      {/* Header Sync Bar */}
      <div style={{ backgroundColor: '#FDFBFF', border: '1.5px solid var(--purple-primary)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: 'var(--purple-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={20} />
          ĐỒNG BỘ DỮ LIỆU TỪ GOOGLE TRANG TÍNH (GOOGLE SHEET)
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 14px 0' }}>
          Nhập đường dẫn Google Sheet công khai (Chia sẻ ở chế độ "Bất kỳ ai có liên kết"). Website sẽ tự động quét và cập nhật giá & sản phẩm tức thì.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
            <span>{loadingSync ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ NGAY'}</span>
          </button>
        </div>
      </div>

      {/* Grid Action Tools */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: 700 }}>
            BẢNG CHỈNH SỬA SẢN PHẨM TRỰC QUAN ({gridData.length} sản phẩm)
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Click đúp vào ô để sửa trực tiếp dữ liệu</span>
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
              const vndVal = Math.round((prod.foreignPrice || 0) * krwRate);

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
