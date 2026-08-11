/**
 * Google Sheet Product Synchronizer Service
 * Customized for User Sheet Schema (12 Columns):
 * STT | MÃ SẢN PHẨM | TÊN SẢN PHẨM | THƯƠNG HIỆU | PHÂN LOẠI | ẢNH SẢN PHẨM | MÔ TẢ, GHI CHÚ SẢN PHẨM | XUẤT SỨ | GIÁ THÀNH(VNĐ) | GIÁ THÀNH(WON) | ĐÁNH GIÁ | LINK SẢN PHẨM HÀN QUỐC
 */

export const DEFAULT_USER_GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1rlXji8EI6ry_aNqo9Q80uiQsT0qyOfgno2MEx-zsf9U/edit?usp=sharing';

export const parseGoogleSheetUrl = (url) => {
  if (!url) return null;
  
  // Extract spreadsheet ID if it is a standard Google Sheet link
  const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetIdMatch && sheetIdMatch[1]) {
    const sheetId = sheetIdMatch[1];
    const gidMatch = url.match(/gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  if (url.includes('format=csv') || url.includes('output=csv')) {
    return url;
  }

  return url;
};

/**
 * Robust CSV Parser handling quotes, commas and newlines
 */
export const parseCSV = (csvText) => {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentToken = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentToken.trim());
      if (row.some(field => field.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0 || row.length > 0) {
    row.push(currentToken.trim());
    if (row.some(field => field.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
};

/**
 * Normalize text for accent-insensitive column matching
 */
const normalizeHeader = (text) => {
  return (text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Fetch and convert User Google Sheet CSV to Product Catalog Array
 */
export const fetchProductsFromGoogleSheet = async (sheetUrl = DEFAULT_USER_GOOGLE_SHEET_URL) => {
  try {
    const csvExportUrl = parseGoogleSheetUrl(sheetUrl);
    if (!csvExportUrl) {
      throw new Error("URL Google Sheet không hợp lệ!");
    }

    const response = await fetch(csvExportUrl);
    if (!response.ok) {
      throw new Error(`Không thể kết nối Google Sheet (HTTP ${response.status})`);
    }

    const text = await response.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      throw new Error("Tệp Google Sheet rỗng!");
    }

    // Dynamic header row detection (Find line containing TÊN SẢN PHẨM / MÃ SẢN PHẨM)
    let headerRowIndex = -1;
    for (let rIdx = 0; rIdx < Math.min(rows.length, 5); rIdx++) {
      const normalizedRow = rows[rIdx].map(normalizeHeader);
      if (normalizedRow.some(cell => cell.includes('tensanpham') || cell.includes('masanpham') || cell.includes('name'))) {
        headerRowIndex = rIdx;
        break;
      }
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 0; // Fallback to first line
    }

    const headers = rows[headerRowIndex].map(normalizeHeader);
    
    // Find column indexes
    const getIndex = (possibleNames) => {
      return headers.findIndex(h => possibleNames.some(p => h.includes(p)));
    };

    const idxId = getIndex(['masanpham', 'ma', 'goodsno', 'id']);
    const idxName = getIndex(['tensanpham', 'ten', 'name', 'sanpham']);
    const idxBrand = getIndex(['thuonghieu', 'brand', 'hang']);
    const idxCategory = getIndex(['phanloai', 'danhmuc', 'category']);
    const idxImage = getIndex(['anhsanpham', 'anh', 'image', 'img']);
    const idxDesc = getIndex(['mota', 'ghichu', 'description']);
    const idxOrigin = getIndex(['xuatsu', 'xuatxu', 'origin']);
    const idxVndPrice = getIndex(['giathanhvnd', 'giavnd', 'vnd']);
    const idxWonPrice = getIndex(['giathanhwon', 'giawon', 'won', 'foreignprice']);
    const idxRating = getIndex(['danhgia', 'rating', 'sao']);
    const idxLink = getIndex(['linksanpham', 'link', 'url', 'danklink']);

    const products = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0) continue;

      const nameVal = idxName > -1 ? r[idxName] : r[2] || r[1];
      if (!nameVal || nameVal.trim() === '') continue; // Skip empty rows

      const rawWonPrice = idxWonPrice > -1 && r[idxWonPrice] ? r[idxWonPrice].replace(/[^0-9.]/g, '') : '';
      const foreignPrice = parseFloat(rawWonPrice) || 20000;

      const rawVndPrice = idxVndPrice > -1 && r[idxVndPrice] ? r[idxVndPrice].replace(/[^0-9.]/g, '') : '';
      const explicitVndPrice = rawVndPrice ? parseFloat(rawVndPrice) : null;

      // Category mapper
      let rawCat = idxCategory > -1 && r[idxCategory] ? r[idxCategory].toLowerCase() : 'skincare';
      if (rawCat.includes('trang điểm') || rawCat.includes('makeup')) rawCat = 'makeup';
      else if (rawCat.includes('thực phẩm') || rawCat.includes('sâm') || rawCat.includes('health')) rawCat = 'health';
      else if (rawCat.includes('thuốc') || rawCat.includes('dược') || rawCat.includes('pharmacy')) rawCat = 'pharmacy';
      else rawCat = 'skincare';

      const product = {
        goodsNo: idxId > -1 && r[idxId] ? r[idxId] : `SP-${1000 + i}`,
        name: nameVal,
        brand: idxBrand > -1 && r[idxBrand] ? r[idxBrand] : 'TAVY Official',
        category: rawCat,
        foreignPrice: foreignPrice,
        explicitVndPrice: explicitVndPrice,
        productImage: idxImage > -1 && r[idxImage] ? r[idxImage] : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        description: idxDesc > -1 && r[idxDesc] ? r[idxDesc] : 'Sản phẩm mua hộ chính hãng từ Store Hàn Quốc.',
        origin: idxOrigin > -1 && r[idxOrigin] ? r[idxOrigin] : 'Store Olive Young Seoul, Hàn Quốc',
        rating: idxRating > -1 && parseFloat(r[idxRating]) ? parseFloat(r[idxRating]) : 4.9,
        productUrl: idxLink > -1 && r[idxLink] ? r[idxLink] : '',
        reviewsCount: 100 + i * 12
      };

      products.push(product);
    }

    return { success: true, products, count: products.length };
  } catch (err) {
    console.warn("Lỗi đồng bộ Google Sheet:", err);
    return { success: false, error: err.message };
  }
};
