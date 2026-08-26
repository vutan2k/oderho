import React, { useState } from 'react';
import { Search, X, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * GuestOrderTrackingBar
 * Prominent order status tracking input bar for guest users on the Home Page.
 * Supports Phone Number or Order ID lookup with quick suggestion chips.
 */
export default function GuestOrderTrackingBar({
  onSearch,
  onClear,
  initialValue = '',
  isLoading = false,
  placeholder = 'Nhập Số điện thoại hoặc Mã đơn (VD: 0912345678, ORD-827192)...',
  sampleSuggestions = [
    { label: 'Thử mã: ORD-100001', value: 'ORD-100001' },
    { label: 'Thử SĐT: 0912345678', value: '0912345678' }
  ]
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

  const handleSuggestionClick = (value) => {
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div
      className="guest-order-tracking-bar-container"
      style={{
        maxWidth: '720px',
        margin: '0 auto 28px auto',
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

      {/* Quick Suggestion Chips & Value Props */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginTop: '12px'
        }}
      >
        <span style={{ fontSize: '0.78rem', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={13} style={{ color: 'var(--gold-primary, #C5A059)' }} /> Gợi ý tra cứu:
        </span>

        {sampleSuggestions.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(sug.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '16px',
              padding: '4px 10px',
              fontSize: '0.76rem',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--purple-primary, #7A4B9E)';
              e.currentTarget.style.color = 'var(--purple-primary, #7A4B9E)';
              e.currentTarget.style.backgroundColor = 'var(--purple-light, #F0E8F5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {sug.label}
          </button>
        ))}

        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--purple-primary, #7A4B9E)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '4px'
          }}
        >
          <ShieldCheck size={14} /> Minh bạch 100% Bill & Video POV
        </span>
      </div>
    </div>
  );
}
