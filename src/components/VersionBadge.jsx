import React, { useState } from 'react';
import { APP_VERSION, BUILD_DATE } from '../data/appVersion';
import { Sparkles, Info, X } from 'lucide-react';

export default function VersionBadge({ position = 'bottom-right', isAdmin = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isLeft = position.includes('left');
  const isTop = position.includes('top');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isTop ? 'auto' : '16px',
        top: isTop ? '16px' : 'auto',
        right: isLeft ? 'auto' : '16px',
        left: isLeft ? '16px' : 'auto',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isLeft ? 'flex-start' : 'flex-end',
        pointerEvents: 'auto',
        userSelect: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Tooltip Popup Detail */}
      {showTooltip && (
        <div
          style={{
            marginBottom: '8px',
            backgroundColor: '#1E1B4B',
            color: '#FFF',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxWidth: '220px',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            <span style={{ fontWeight: 800, color: '#A78BFA' }}>
              {isAdmin ? 'TAVY ADMIN PORTAL' : 'TAVY KOREA WEB'}
            </span>
            <button
              onClick={() => setShowTooltip(false)}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0 }}
            >
              <X size={12} />
            </button>
          </div>
          <div style={{ color: '#E0E7FF' }}>Phiên bản: <strong>{APP_VERSION}</strong></div>
          <div style={{ color: '#C7D2FE' }}>Quy trình: <strong>8 Bước Minh Bạch</strong></div>
          <div style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>Build: {BUILD_DATE}</div>
        </div>
      )}

      {/* Main Pill Button */}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        title={`TAVY Korea System ${APP_VERSION} (Nhấn để xem chi tiết)`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: isAdmin ? 'rgba(30, 27, 75, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          color: isAdmin ? '#E0E7FF' : '#4C1D95',
          border: isAdmin ? '1px solid #6366F1' : '1px solid #DDD6FE',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.3px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: 0.85
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.85';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 6px #10B981'
          }}
        />
        <span>{APP_VERSION}</span>
      </button>
    </div>
  );
}
