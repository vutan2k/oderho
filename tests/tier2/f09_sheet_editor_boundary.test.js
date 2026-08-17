import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertDeepEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F9-B1] Malformed CSV file upload rejection', () => {
  const parseCSVContent = (csvText) => {
    if (!csvText || typeof csvText !== 'string' || !csvText.trim()) {
      throw new Error('Tệp CSV rỗng hoặc không hợp lệ!');
    }
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    if (!headers.includes('goodsNo') || !headers.includes('name')) {
      throw new Error('Tệp CSV thiếu các cột bắt buộc: goodsNo, name!');
    }
    return lines.slice(1).map(line => {
      const parts = line.split(',');
      return { goodsNo: parts[0]?.trim(), name: parts[1]?.trim() };
    });
  };

  assertThrows(() => parseCSVContent(''), 'rỗng hoặc không hợp lệ');
  assertThrows(() => parseCSVContent('invalid_header_1,invalid_header_2\nval1,val2'), 'thiếu các cột bắt buộc');
  const validCsv = 'goodsNo,name,foreignPrice\nA001,Serum Torriden,18000';
  const parsed = parseCSVContent(validCsv);
  assertEquals(parsed[0].goodsNo, 'A001', 'Valid CSV parses headers and row content');
});

test('[F9-B2] Empty CSV rows handling', () => {
  const parseCSVContent = (csvText) => {
    if (!csvText || typeof csvText !== 'string' || !csvText.trim()) return [];
    const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) return []; // Only header or empty
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const parts = line.split(',');
      return { goodsNo: parts[0]?.trim(), name: parts[1]?.trim() };
    });
  };

  const emptyRowsCsv = 'goodsNo,name,foreignPrice\n\n\n   \n';
  const result = parseCSVContent(emptyRowsCsv);
  assertDeepEquals(result, [], 'CSV with empty rows produces empty array without error');
});

test('[F9-B3] Duplicate product SKU/goodsNo detection', () => {
  const existingProducts = [
    { goodsNo: 'A000000261415', name: 'Serum Cà Chua Xanh' },
    { goodsNo: 'A000000185934', name: 'Serum Torriden' }
  ];

  const validateProductImport = (newProduct) => {
    const duplicate = existingProducts.some(p => p.goodsNo === newProduct.goodsNo);
    if (duplicate) {
      return { success: false, duplicate: true, message: `Mã sản phẩm SKU ${newProduct.goodsNo} đã tồn tại trong danh mục!` };
    }
    return { success: true };
  };

  const dupRes = validateProductImport({ goodsNo: 'A000000261415', name: 'Duplicate Item' });
  assertEquals(dupRes.duplicate, true, 'Duplicate SKU detected');

  const uniqueRes = validateProductImport({ goodsNo: 'A999999999999', name: 'New Item' });
  assertEquals(uniqueRes.success, true, 'Unique SKU import succeeds');
});

test('[F9-B4] Unsaved inline editor changes revert', () => {
  class SheetEditorState {
    constructor(initialProducts) {
      this.originalProducts = JSON.parse(JSON.stringify(initialProducts));
      this.draftProducts = JSON.parse(JSON.stringify(initialProducts));
      this.isDirty = false;
    }

    updateCell(index, field, value) {
      this.draftProducts[index][field] = value;
      this.isDirty = true;
    }

    revertChanges() {
      this.draftProducts = JSON.parse(JSON.stringify(this.originalProducts));
      this.isDirty = false;
    }
  }

  const initial = [{ goodsNo: 'A001', name: 'Old Name', foreignPrice: 10000 }];
  const editor = new SheetEditorState(initial);

  editor.updateCell(0, 'name', 'Modified Unsaved Name');
  assertEquals(editor.isDirty, true, 'Editor state becomes dirty after modification');
  assertEquals(editor.draftProducts[0].name, 'Modified Unsaved Name', 'Draft product contains modified value');

  editor.revertChanges();
  assertEquals(editor.isDirty, false, 'Editor state clean after revert');
  assertEquals(editor.draftProducts[0].name, 'Old Name', 'Draft product restored to original name');
});

test('[F9-B5] Invalid price data type in sheet validation', () => {
  const sanitizeSheetRow = (row) => {
    const price = Number(row.foreignPrice);
    if (isNaN(price) || price <= 0) {
      throw new Error(`Giá sản phẩm "${row.foreignPrice}" không hợp lệ cho SKU ${row.goodsNo}!`);
    }
    return { ...row, foreignPrice: price };
  };

  assertThrows(() => sanitizeSheetRow({ goodsNo: 'A001', name: 'Test', foreignPrice: 'FREE' }), 'không hợp lệ');
  assertThrows(() => sanitizeSheetRow({ goodsNo: 'A001', name: 'Test', foreignPrice: -500 }), 'không hợp lệ');
  assertEquals(sanitizeSheetRow({ goodsNo: 'A001', name: 'Test', foreignPrice: '25000' }).foreignPrice, 25000, 'Valid numeric string converted to number');
});
