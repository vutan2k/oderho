import React from 'react';
import { Bot, MessageCircle, X, RotateCcw } from 'lucide-react';

export default function ChatHeader({ activeTab, setActiveTab, onClose, onReset, isMobile }) {
  return (
    <div
      style={{
        backgroundColor: '#1E1B4B',
        color: '#FFFFFF',
        padding: isMobile ? '12px 14px' : '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '10px' : '14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        userSelect: 'none',
        borderTopLeftRadius: isMobile ? '0' : '16px',
        borderTopRightRadius: isMobile ? '0' : '16px',
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: isMobile ? '32px' : '36px',
              height: isMobile ? '32px' : '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--purple-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            <Bot size={isMobile ? 18 : 20} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: isMobile ? '0.95rem' : '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
              TAVY ASSISTANT
            </div>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} title="Trực tuyến" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onReset && (
            <button
              onClick={onReset}
              title="Bắt đầu lại hội thoại"
              style={{
                background: 'none',
                border: 'none',
                color: '#C7D2FE',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
                touchAction: 'manipulation'
              }}
            >
              <RotateCcw size={isMobile ? 18 : 16} />
            </button>
          )}
          <button
            onClick={onClose}
            title={isMobile ? "Đóng chat" : "Thu nhỏ cửa sổ chat"}
            style={{
              background: 'none',
              border: 'none',
              color: '#C7D2FE',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
              touchAction: 'manipulation'
            }}
          >
            <X size={isMobile ? 22 : 18} />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '3px'
        }}
      >
        <button
          onClick={() => setActiveTab('bot')}
          style={{
            flex: 1,
            padding: isMobile ? '8px 10px' : '8px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: isMobile ? '0.8rem' : '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'bot' ? 'var(--purple-primary)' : 'transparent',
            color: activeTab === 'bot' ? '#FFFFFF' : '#C7D2FE',
            touchAction: 'manipulation'
          }}
        >
          <Bot size={14} />
          <span>Trợ lý Tự Động</span>
        </button>

        <button
          onClick={() => setActiveTab('facebook')}
          style={{
            flex: 1,
            padding: isMobile ? '8px 10px' : '8px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: isMobile ? '0.8rem' : '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'facebook' ? '#0084FF' : 'transparent',
            color: activeTab === 'facebook' ? '#FFFFFF' : '#C7D2FE',
            touchAction: 'manipulation'
          }}
        >
          <MessageCircle size={14} />
          <span>Facebook Chat</span>
        </button>
      </div>
    </div>
  );
}
