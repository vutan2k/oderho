import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * GuestOrderTrackingBar
 * Clean & minimal order status tracking input bar for guest users on the Home Page.
 * Supports Phone Number or Order ID lookup.
 */
export default function GuestOrderTrackingBar({
  onSearch,
  onClear,
  initialValue = '',
  isLoading = false,
  placeholder = 'Nhập Số điện thoại hoặc Mã đơn (VD: 0912345678, ORD-827192)...'
}) {
  const [query, setQuery] = useState(initialValue || '');
  const [prevInitial, setPrevInitial] = useState(initialValue);

  // Synchronize state when initialValue changes from parent without setState in useEffect
  if (initialValue !== prevInitial) {
    setPrevInitial(initialValue);
    setQuery(initialValue || '');
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery && onSearch) {
      onSearch(cleanQuery);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div
      className="guest-order-tracking-bar-container"
      style={{
        maxWidth: '720px',
        margin: '0 auto 24px auto',
        width: '100%'
      }}
    >
      <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '36px',
            border: '2px solid var(--purple-primary, #7A4B9E)',
            boxShadow: '0 4px 20px rgba(122, 75, 158, 0.12), 0 1px 4px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            padding: '4px 6px 4px 18px'
          }}
        >
          <Search
            size={22}
            style={{
              color: 'var(--purple-primary, #7A4B9E)',
              flexShrink: 0,
              marginRight: '12px'
            }}
          />

          <input
            id="search-input-main"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Tra cứu tiến độ đơn hàng"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.96rem',
              color: 'var(--text-dark, #1F2937)',
              backgroundColor: 'transparent',
              padding: '10px 4px',
              minWidth: '120px'
            }}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xóa tìm kiếm"
              title="Xóa nội dung"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9CA3AF',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '6px',
                borderRadius: '50%'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#4B5563')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              <X size={18} />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            style={{
              backgroundColor: query.trim() ? 'var(--purple-primary, #7A4B9E)' : '#E5E7EB',
              color: query.trim() ? '#FFFFFF' : '#9CA3AF',
              border: 'none',
              borderRadius: '28px',
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: query.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: query.trim() ? '0 2px 8px rgba(122, 75, 158, 0.3)' : 'none',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (query.trim() && !isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--purple-dark, #583377)';
              }
            }}
            onMouseLeave={(e) => {
              if (query.trim() && !isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--purple-primary, #7A4B9E)';
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang tra...
              </>
            ) : (
              'Tra cứu'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
