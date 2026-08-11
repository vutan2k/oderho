/**
 * Google Sheet Product Synchronizer Service
 * Parses public Google Sheet CSV export or web CSV links into structured product objects.
 */

export const parseGoogleSheetUrl = (url) => {
  if (!url) return null;
  
  // Extract spreadsheet ID if it is a standard Google Sheet link
  const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetIdMatch && sheetIdMatch[1]) {
    const sheetId = sheetIdMatch[1];
    // Check if gviz or pub export
    const gidMatch = url.match(/gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  // If already a direct CSV link
  if (url.includes('format=csv') || url.includes('output=csv')) {
    return url;
  }

  return url;
};

/**
 * Simple Robust CSV Parser handles quoted values & commas inside text
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
 * Fetch and convert Google Sheet CSV to Product Catalog Array
 */
export const fetchProductsFromGoogleSheet = async (sheetUrl) => {
  try {
    const csvExportUrl = parseGoogleSheetUrl(sheetUrl);
    if (!csvExportUrl) {
      throw new Error("URL Google Sheet không hợp lệ!");
    }

    const response = await fetch(csvExportUrl);
    if (!response.ok) {
      throw new Error(`Không thể tải dữ liệu từ Google Sheet (HTTP ${response.status})`);
    }

    const text = await response.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      throw new Error("Tệp Google Sheet chưa có dòng dữ liệu!");
    }

    // Header row mapping (lowercase clean)
    const headers = rows[0].map(h => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ''));
    
    // Find column indexes
    const getIndex = (possibleNames) => {
      return headers.findIndex(h => possibleNames.some(p => h.includes(p)));
    };

    const idxId = getIndex(['ma', 'id', 'goodsno']);
    const idxName = getIndex(['ten', 'name', 'sanpham']);
    const idxBrand = getIndex(['thuonghieu', 'brand', 'hang']);
    const idxCategory = getIndex(['danhmuc', 'category', 'loai']);
    const idxPrice = getIndex(['gia', 'price', 'won', 'foreignprice']);
    const idxImage = getIndex(['anh', 'image', 'img', 'productimage']);
    const idxDesc = getIndex(['mota', 'description', 'chitiet']);
    const idxOrigin = getIndex(['xuatxu', 'origin', 'nguongoc']);
    const idxRating = getIndex(['danhgia', 'rating', 'sao']);

    const products = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0 || !r[idxName > -1 ? idxName : 1]) continue;

      const rawPrice = idxPrice > -1 && r[idxPrice] ? r[idxPrice].replace(/[^0-9.]/g, '') : '20000';
      const foreignPrice = parseFloat(rawPrice) || 20000;

      const product = {
        goodsNo: idxId > -1 && r[idxId] ? r[idxId] : `GS-${1000 + i}`,
        name: idxName > -1 ? r[idxName] : r[0] || `Sản phẩm ${i}`,
        brand: idxBrand > -1 && r[idxBrand] ? r[idxBrand] : 'TAVY Official',
        category: idxCategory > -1 && r[idxCategory] ? r[idxCategory].toLowerCase() : 'skincare',
        foreignPrice: foreignPrice,
        productImage: idxImage > -1 && r[idxImage] ? r[idxImage] : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        description: idxDesc > -1 && r[idxDesc] ? r[idxDesc] : 'Sản phẩm mua hộ chính hãng từ Store Hàn Quốc.',
        origin: idxOrigin > -1 && r[idxOrigin] ? r[idxOrigin] : 'Store Olive Young Seoul, Hàn Quốc',
        rating: idxRating > -1 && parseFloat(r[idxRating]) ? parseFloat(r[idxRating]) : 4.9,
        reviewsCount: 100 + i * 15
      };

      products.push(product);
    }

    return { success: true, products, count: products.length };
  } catch (err) {
    console.warn("Lỗi đồng bộ Google Sheet:", err);
    return { success: false, error: err.message };
  }
};
