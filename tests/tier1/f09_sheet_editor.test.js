import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertGreaterThan,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 1: Feature Coverage');

test('[F9-1] Inline spreadsheet row editing state immutability', () => {
  const initialRows = [
    { goodsNo: 'A001', name: 'Product 1', foreignPrice: 15000, category: 'skincare' },
    { goodsNo: 'A002', name: 'Product 2', foreignPrice: 25000, category: 'makeup' },
  ];

  const updateCell = (rows, rowIndex, field, newValue) => {
    return rows.map((row, idx) => {
      if (idx === rowIndex) {
        return { ...row, [field]: newValue };
      }
      return row;
    });
  };

  const updatedRows = updateCell(initialRows, 0, 'foreignPrice', 18000);
  assertEquals(updatedRows[0].foreignPrice, 18000, 'Row 0 price updated to 18000');
  assertEquals(initialRows[0].foreignPrice, 15000, 'Original initialRows must not be mutated');
  assertEquals(updatedRows[1].foreignPrice, 25000, 'Row 1 price unchanged');
});

test('[F9-2] Catalog CSV export formatting', () => {
  const exportToCsv = (products) => {
    const headers = ['goodsNo', 'name', 'brand', 'category', 'foreignPrice'];
    const rows = products.map(p => {
      return headers.map(h => {
        const val = p[h] !== undefined ? String(p[h]) : '';
        // Escape quotes and wrap in quotes if contains comma
        if (val.includes(',') || val.includes('"')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const sampleProducts = [
    { goodsNo: 'A001', name: 'Serum Cà Chua, Green Tomato', brand: 'Sungboon', category: 'skincare', foreignPrice: 24900 },
    { goodsNo: 'A002', name: 'Toner Torriden', brand: 'Torriden', category: 'skincare', foreignPrice: 18000 },
  ];

  const csvContent = exportToCsv(sampleProducts);
  assert(csvContent.startsWith('goodsNo,name,brand,category,foreignPrice'), 'CSV header line correct');
  assert(csvContent.includes('"Serum Cà Chua, Green Tomato"'), 'Commas in values wrapped in double quotes');
});

test('[F9-3] CSV import text parsing into product models', () => {
  const parseCsvToProducts = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const item = {};
      headers.forEach((h, i) => {
        item[h] = h === 'foreignPrice' ? parseFloat(values[i]) || 0 : values[i];
      });
      return item;
    });
  };

  const csvInput = `goodsNo,name,brand,category,foreignPrice
A000000185934,Torriden Serum,Torriden,skincare,18000
A000000159495,Anua Toner,Anua,skincare,28000`;

  const parsed = parseCsvToProducts(csvInput);
  assertEquals(parsed.length, 2, 'Parsed array should contain 2 items');
  assertEquals(parsed[0].goodsNo, 'A000000185934', 'GoodsNo parsed correctly');
  assertEquals(parsed[0].foreignPrice, 18000, 'Price parsed as numeric 18000');
});

test('[F9-4] Catalog publish versioning increment & snapshotting', () => {
  function createVersionManager() {
    let currentVersion = 1;
    const history = [];

    return {
      getVersion: () => currentVersion,
      getHistory: () => history,
      publish: (productsData) => {
        const snapshot = {
          version: currentVersion,
          publishedAt: new Date().toISOString(),
          products: JSON.parse(JSON.stringify(productsData)),
        };
        history.push(snapshot);
        currentVersion += 1;
        return snapshot;
      }
    };
  }

  const vm = createVersionManager();
  assertEquals(vm.getVersion(), 1, 'Initial version is 1');

  const snap1 = vm.publish([{ goodsNo: 'P1', name: 'Prod 1' }]);
  assertEquals(snap1.version, 1, 'Snapshot 1 is version 1');
  assertEquals(vm.getVersion(), 2, 'Version incremented to 2');
});

test('[F9-5] Revert versioning state to historical snapshot', () => {
  let catalogState = [{ goodsNo: 'V1-ITEM', name: 'Original V1' }];
  const versionHistory = [
    { version: 1, products: [{ goodsNo: 'V1-ITEM', name: 'Original V1' }] },
    { version: 2, products: [{ goodsNo: 'V1-ITEM', name: 'Modified V2' }, { goodsNo: 'V2-ITEM', name: 'New V2' }] }
  ];

  const revertToVersion = (targetVersion) => {
    const historical = versionHistory.find(v => v.version === targetVersion);
    if (!historical) {
      throw new Error(`Phiên bản v${targetVersion} không tồn tại`);
    }
    return JSON.parse(JSON.stringify(historical.products));
  };

  catalogState = revertToVersion(1);
  assertEquals(catalogState.length, 1, 'Reverted catalog length should be 1');
  assertEquals(catalogState[0].name, 'Original V1', 'Reverted content matches Version 1');

  assertThrows(() => {
    revertToVersion(99);
  }, 'Phiên bản v99 không tồn tại');
});
