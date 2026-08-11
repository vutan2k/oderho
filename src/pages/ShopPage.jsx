import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import OrderDrawer from '../components/OrderDrawer';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'all',      label: 'Tất cả' },
  { id: 'skincare', label: '✨ Skincare' },
  { id: 'makeup',   label: '💄 Makeup' },
  { id: 'haircare', label: '💇 Tóc' },
  { id: 'bodycare', label: '🧴 Body' },
];

export default function ShopPage() {
  const { oliveYoungCatalog, rates } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const krwRate = rates?.KRW?.rate || 19.5;

  const formatVnd = (n) =>
    new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';

  const formatKrw = (n) =>
    new Intl.NumberFormat('ko-KR').format(n) + ' ₩';

  const filtered = useMemo(() => {
    if (!oliveYoungCatalog) return [];
    return oliveYoungCatalog.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [oliveYoungCatalog, activeCategory, search]);

  return (
    <main style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', paddingBottom: 80 }}>
      <div className="container">

        {/* ── Toolbar: pills (left) + search (right) ── */}
        <div style={{
          position: 'sticky',
          top: 64,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          paddingTop: 14,
          paddingBottom: 14,
          borderBottom: '1px solid var(--border)',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar — compact, right side */}
          <div className="search-wrap" style={{ flexShrink: 0, maxWidth: 220 }}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Product count ── */}
        {search || activeCategory !== 'all' ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            {filtered.length} sản phẩm
            {search && <> cho &ldquo;<strong>{search}</strong>&rdquo;</>}
          </p>
        ) : (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            {filtered.length} sản phẩm Olive Young chính hãng 🇰🇷
          </p>
        )}

        {/* ── Product Grid ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>🔍</span>
            <p>Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
          }}
            className="product-grid"
          >
            {filtered.map((product, i) => (
              <div
                key={product.goodsNo}
                className="product-card animate-in"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <img
                  src={product.productImage}
                  alt={product.name}
                  className="product-card__img"
                  loading="lazy"
                />
                <div className="product-card__body">
                  <div className="product-card__brand">{product.brand}</div>
                  <div className="product-card__name">{product.name}</div>
                  <div className="product-card__price-krw">{formatKrw(product.foreignPrice)}</div>
                  <div className="product-card__price-vnd">
                    ~{formatVnd(product.foreignPrice * krwRate)}
                  </div>
                  <button
                    className="product-card__btn"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Mua hộ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Responsive grid override ── */}
      <style>{`
        @media (max-width: 1100px) {
          .product-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 850px) {
          .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── Order Drawer ── */}
      <OrderDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
