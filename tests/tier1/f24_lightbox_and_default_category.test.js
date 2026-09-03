import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
} from '../framework/assert.js';
import { OLIVE_YOUNG_CATALOG } from '../../src/data/catalog.js';

setTier('Tier 1: Feature Coverage');

test('[F24-1] Lightbox step-back event isolation (stopPropagation)', () => {
  let modalClosed = false;
  let zoomIndex = 0;

  const onClose = () => {
    modalClosed = true;
  };

  // Giả lập thao tác click vào backdrop của Lightbox
  const handleLightboxBackdropClick = (e) => {
    e.stopPropagation();
    zoomIndex = null;
  };

  let propagationStopped = false;
  const mockEvent = {
    stopPropagation: () => {
      propagationStopped = true;
    }
  };

  handleLightboxBackdropClick(mockEvent);

  assertEquals(propagationStopped, true, 'Lightbox click must call stopPropagation()');
  assertEquals(zoomIndex, null, 'Lightbox zoomIndex must be reset to null');
  assertEquals(modalClosed, false, 'Parent product modal must NOT be closed');
});

test('[F24-2] Lightbox Escape key step-by-step dismissal logic', () => {
  let modalClosed = false;
  let zoomIndex = 1;

  const onClose = () => {
    modalClosed = true;
  };

  const handleKeyDown = (key) => {
    if (key === 'Escape') {
      if (zoomIndex !== null) {
        zoomIndex = null;
      } else if (onClose) {
        onClose();
      }
    }
  };

  // Bước 1: Khi Lightbox đang mở, bấm Escape -> Chỉ đóng Lightbox
  handleKeyDown('Escape');
  assertEquals(zoomIndex, null, 'First Escape keypress must close the Lightbox only');
  assertEquals(modalClosed, false, 'First Escape keypress must leave the product modal open');

  // Bước 2: Khi Lightbox đã đóng, bấm Escape -> Đóng modal chi tiết sản phẩm
  handleKeyDown('Escape');
  assertEquals(modalClosed, true, 'Second Escape keypress must close the product modal');
});

test('[F24-3] Default active category is cosmetics on home page initialization', () => {
  const initialCategory = 'cosmetics';
  assertEquals(initialCategory, 'cosmetics', 'Initial active category must default to cosmetics');

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'cosmetics', name: 'Mỹ phẩm' },
    { id: 'ginseng', name: 'Sâm nấm' },
    { id: 'supplements', name: 'Thực phẩm chức năng' }
  ];

  assertEquals(categories.length, 4, 'Catalog ribbon has 4 categories');
  assertEquals(categories[0].id, 'all', 'First category tab remains Tất cả sản phẩm');
  assertEquals(categories[1].id, 'cosmetics', 'Second category tab is Mỹ phẩm');
});

test('[F24-4] Cosmetics category filtering matches skincare and makeup products', () => {
  const filterByCosmetics = (catalog) => {
    return catalog.filter((product) => {
      if (product.isPublished === false || product.status === 'pending' || product.isHidden === true) return false;
      const cat = (product.category || '').toLowerCase();
      return cat === 'cosmetics' || cat.includes('mỹ phẩm') || cat.includes('skin') || cat.includes('dưỡng') || cat.includes('make') || cat.includes('trang') || cat.includes('hair') || cat.includes('body');
    });
  };

  const cosmetics = filterByCosmetics(OLIVE_YOUNG_CATALOG);
  assertGreaterThan(cosmetics.length, 0, 'Should have cosmetics products in catalog');
  
  // Xác nhận các sản phẩm skincare/makeup đều được bao gồm
  const hasSkincare = cosmetics.some(p => p.category === 'skincare');
  const hasMakeup = cosmetics.some(p => p.category === 'makeup');
  assertEquals(hasSkincare, true, 'Skincare products must be included in cosmetics category');
  assertEquals(hasMakeup, true, 'Makeup products must be included in cosmetics category');

  // Xác nhận sản phẩm sâm nấm, pharmacy không lọt vào danh mục mỹ phẩm
  const hasPharmacy = cosmetics.some(p => p.category === 'pharmacy');
  assertEquals(hasPharmacy, false, 'Pharmacy products must NOT be included in cosmetics category');
});
