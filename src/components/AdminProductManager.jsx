import React, { useState } from 'react';
import AdminProductCatalog from './AdminProductCatalog';
import AdminProductSourcing from './AdminProductSourcing';
import { ShoppingBag, Zap, Layers } from 'lucide-react';

export default function AdminProductManager({ defaultTab = 'catalog' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Sub-tab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '8px 14px',
        border: '1px solid #E2E8F0',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'catalog' ? '#2563EB' : 'transparent',
            color: activeTab === 'catalog' ? '#FFF' : '#64748B',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ShoppingBag size={16} />
          <span>Kho Sản Phẩm Live</span>
        </button>

        <button
          onClick={() => setActiveTab('sourcing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'sourcing' ? '#10B981' : 'transparent',
            color: activeTab === 'sourcing' ? '#FFF' : '#64748B',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={16} />
          <span>Kho Nạp Hàng & Chờ Duyệt</span>
        </button>
      </div>

      {activeTab === 'catalog' ? <AdminProductCatalog /> : <AdminProductSourcing />}
    </div>
  );
}
